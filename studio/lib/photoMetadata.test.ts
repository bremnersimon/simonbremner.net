import assert from "node:assert/strict";
import { test } from "node:test";
import {
	type Equipment,
	buildProposals,
	captureDate,
	confirmImport,
	formatExposure,
	matchEquipment,
	parseEquipment,
	selectedValues,
	snapshot,
} from "./photoMetadata";

const equipment: Equipment[] = [
	{
		_id: "camera-1",
		_type: "camera",
		name: "Canon R6",
		brand: "Canon",
		modelNumber: "EOS R6m2",
	},
	{
		_id: "lens-1",
		_type: "lens",
		name: "RF100-400mm F5.6-8 IS USM",
		brand: "Canon",
	},
];
const lightroom = {
	Make: "Canon",
	Model: "Canon EOS R6m2",
	LensModel: "RF100-400mm F5.6-8 IS USM",
	FocalLength: 400,
	FNumber: 8,
	ApertureValue: 6,
	ExposureTime: 0.004,
	ISO: 8000,
	DateTimeOriginal: "2026:11:06 09:04:01",
	OffsetTimeOriginal: "-04:00",
};

test("Lightroom values map to the existing fields, respecting embedded offset", () => {
	const values = selectedValues(
		buildProposals({}, lightroom, equipment),
		new Set([
			"camera",
			"lens",
			"focalLength",
			"aperture",
			"shutterSpeed",
			"iso",
			"dateTaken",
		]),
	);
	assert.deepEqual(values, {
		camera: { _type: "reference", _ref: "camera-1" },
		lens: { _type: "reference", _ref: "lens-1" },
		focalLength: "400mm",
		aperture: "f/8",
		shutterSpeed: "1/250",
		iso: 8000,
		dateTaken: "2026-11-06T13:04:01.000Z",
	});
});

test("Sanity stored capture date falls back to selected offset, not its normalized Z suffix", () => {
	const proposals = buildProposals(
		{
			image: { Make: "Canon", Model: "Canon EOS R6m2" },
			exif: {
				...lightroom,
				FocalLength: 85,
				DateTimeOriginal: "2026-11-06T09:04:01.000Z",
			},
		},
		undefined,
		equipment,
	);
	assert.equal(proposals.find((p) => p.field === "focalLength")?.value, "85mm");
	assert.equal(
		proposals.find((p) => p.field === "dateTaken")?.value,
		"2026-11-06T14:04:01.000Z",
	);
	const date = proposals.find((p) => p.field === "dateTaken");
	assert.equal(date?.requiresOffset, true);
	assert.match(date?.message ?? "", /original timezone unverified/);
});

test("stored-date fallback works with empty EXIF and honors offset changes", () => {
	const metadata = { exif: { DateTimeOriginal: "2026-11-06T09:04:01.000Z" } };
	for (const raw of [undefined, {}, { DateTimeOriginal: "" }]) {
		const date = buildProposals(metadata, raw, [], "-04:00").find(
			(p) => p.field === "dateTaken",
		);
		assert.equal(date?.value, "2026-11-06T13:04:01.000Z");
		assert.equal(date?.requiresOffset, true);
	}
});

test("stored summer dates still default to fixed EST and ignore normalized offset suffixes", () => {
	for (const suffix of ["Z", "+00:00", "-04:00", ""]) {
		const date = captureDate(
			undefined,
			"-05:00",
			`2026-07-06T09:04:01.000${suffix}`,
		);
		assert.equal(date.value, "2026-07-06T14:04:01.000Z");
		assert.equal(date.requiresOffset, true);
	}
});

test("original EXIF date and verified offset take precedence over stored dates", () => {
	const date = captureDate(lightroom, "-05:00", "2026-11-06T09:04:01.000Z");
	assert.equal(date.value, "2026-11-06T13:04:01.000Z");
	assert.equal(date.requiresOffset, false);
	assert.doesNotMatch(date.message ?? "", /unverified/);
	const withoutOffset = { DateTimeOriginal: "2026:11:06 10:00:00" };
	assert.equal(
		captureDate(withoutOffset, "-05:00", "2026-11-06T09:04:01.000Z").value,
		"2026-11-06T15:00:00.000Z",
	);
	assert.equal(captureDate(withoutOffset).requiresOffset, true);
});

test("missing and malformed stored dates remain unavailable without overwriting fields", () => {
	for (const storedDate of [
		undefined,
		null,
		123,
		"",
		"bad",
		"2026-02-30T09:04:01.000Z",
	]) {
		const date = captureDate(undefined, "-05:00", storedDate);
		assert.equal(date.value, undefined);
		assert.ok(date.message);
	}
	assert.equal(
		captureDate(
			{ DateTimeOriginal: "bad" },
			"-05:00",
			"2026-11-06T09:04:01.000Z",
		).value,
		undefined,
	);
});

test("partial metadata never substitutes APEX aperture, equivalent focal length, or export date", () => {
	const proposals = buildProposals(
		{
			exif: {
				ApertureValue: 6,
				FocalLengthIn35mmFormat: 600,
				DateTimeDigitized: "2026-01-01",
				ExposureTime: 2,
			},
		},
		undefined,
		[],
	);
	assert.equal(proposals.find((p) => p.field === "aperture")?.value, undefined);
	assert.equal(
		proposals.find((p) => p.field === "focalLength")?.value,
		undefined,
	);
	assert.equal(
		proposals.find((p) => p.field === "dateTaken")?.value,
		undefined,
	);
	assert.equal(proposals.find((p) => p.field === "shutterSpeed")?.value, "2");
});

test("invalid scalar tags are explained and do not suppress valid fields", () => {
	const proposals = buildProposals(
		{
			exif: {
				FNumber: Number.NaN,
				ISO: "8,000",
				FocalLength: -1,
				ExposureTime: 0.4,
			},
		},
		undefined,
		[],
	);
	for (const field of ["aperture", "iso", "focalLength"]) {
		const proposal = proposals.find((p) => p.field === field);
		assert.equal(proposal?.value, undefined);
		assert.match(proposal?.message ?? "", /Invalid/);
	}
	assert.equal(proposals.find((p) => p.field === "shutterSpeed")?.value, "0.4");
});

test("fractional, long, and approximate reciprocal exposures retain precision", () => {
	assert.equal(formatExposure(1 / 1000), "1/1000");
	assert.equal(formatExposure(1 / 125), "1/125");
	assert.equal(formatExposure(0.3), "0.3");
	assert.equal(formatExposure(0.66666667), "0.66666667");
	assert.equal(formatExposure(1.5), "1.5");
	assert.equal(formatExposure(30), "30");
});

test("decimal focal length and aperture are retained", () => {
	const proposals = buildProposals(
		{ exif: { FNumber: 2.8, FocalLength: 24.5 } },
		undefined,
		[],
	);
	assert.equal(proposals.find((p) => p.field === "aperture")?.value, "f/2.8");
	assert.equal(
		proposals.find((p) => p.field === "focalLength")?.value,
		"24.5mm",
	);
});

test("fixed EST defaults to UTC-05:00 in winter and summer", () => {
	for (const month of ["01", "07"]) {
		assert.equal(
			captureDate({ DateTimeOriginal: `2026:${month}:06 09:04:01` }).value,
			`2026-${month}-06T14:04:01.000Z`,
		);
	}
	assert.equal(
		captureDate({ DateTimeOriginal: "2026:07:06 09:04:01" }, "+05:30").value,
		"2026-07-06T03:34:01.000Z",
	);
});

test("embedded UTC offset wins over the default and explicit selection", () => {
	assert.equal(
		captureDate(lightroom, "+05:30").value,
		"2026-11-06T13:04:01.000Z",
	);
	assert.equal(
		captureDate({ DateTimeOriginal: "2026-11-06T09:04:01Z" }).value,
		"2026-11-06T09:04:01.000Z",
	);
});

test("impossible dates and invalid offsets are rejected, not rolled over", () => {
	for (const timestamp of [
		"2026:02:30 09:00:00",
		"2026:13:01 09:00:00",
		"2026:01:01 24:00:00",
		"bad",
	]) {
		assert.equal(captureDate({ DateTimeOriginal: timestamp }).value, undefined);
	}
	for (const offset of ["EST", "+14:30", "-15:00", "+05:99"]) {
		assert.equal(
			captureDate({ DateTimeOriginal: "2026:01:01 09:00:00" }, offset).value,
			undefined,
		);
	}
	assert.equal(
		captureDate({ DateTimeOriginal: "2024:02:29 09:00:00" }).value,
		"2024-02-29T14:00:00.000Z",
	);
});

test("equipment matching normalizes case, whitespace and repeated brand prefixes", () => {
	assert.deepEqual(
		matchEquipment("camera", " CANON canon EOS   R6m2 ", "CANON", equipment)
			.value,
		{ _type: "reference", _ref: "camera-1" },
	);
	assert.deepEqual(
		matchEquipment(
			"lens",
			"Canon RF100-400mm F5.6-8 IS USM",
			undefined,
			equipment,
		).value,
		{ _type: "reference", _ref: "lens-1" },
	);
});

test("ambiguous, fuzzy, and conflicting-brand equipment never auto-match", () => {
	assert.equal(
		matchEquipment("camera", "Canon EOS R6m2", "Canon", [
			...equipment,
			{ ...equipment[0], _id: "duplicate" },
		]).value,
		undefined,
	);
	assert.equal(
		matchEquipment("camera", "EOS R6", "Canon", equipment).value,
		undefined,
	);
	assert.equal(
		matchEquipment("camera", "EOS R6m2", "Sony", equipment).value,
		undefined,
	);
});

test("equipment responses are guarded at runtime", () => {
	assert.deepEqual(parseEquipment(equipment), equipment);
	assert.throws(() => parseEquipment(null), /Invalid equipment/);
	assert.throws(
		() => parseEquipment([{ _id: "bad", _type: "camera", name: 42 }]),
		/Invalid equipment/,
	);
});

test("camera and lens aliases route import names without changing display names", () => {
	const mapped: Equipment[] = [
		{
			...equipment[0],
			name: "My Canon camera",
			modelNumber: undefined,
			exifNames: ["Canon EOS R6m2", "EOS R6 Mark II"],
		},
		{
			...equipment[1],
			name: "Canon RF 100-400mm",
			exifNames: ["RF100-400mm F5.6-8 IS USM", "Another lens export name"],
		},
	];
	const parsed = parseEquipment(mapped);
	const proposals = buildProposals({}, lightroom, parsed);
	assert.deepEqual(proposals.find((p) => p.field === "camera")?.value, {
		_type: "reference",
		_ref: "camera-1",
	});
	assert.deepEqual(proposals.find((p) => p.field === "lens")?.value, {
		_type: "reference",
		_ref: "lens-1",
	});
	assert.deepEqual(
		matchEquipment("camera", "EOS R6 Mark II", "Canon", parsed).value,
		{
			_type: "reference",
			_ref: "camera-1",
		},
	);
	assert.equal(mapped[0].name, "My Canon camera");
	assert.deepEqual(
		matchEquipment("lens", "Another lens export name", undefined, parsed).value,
		{
			_type: "reference",
			_ref: "lens-1",
		},
	);
	assert.equal(mapped[1].name, "Canon RF 100-400mm");
});

test("aliases normalize case, whitespace and brand prefixes without fuzzy matching", () => {
	for (const kind of ["camera", "lens"] as const) {
		const mapped: Equipment[] = [
			{
				_id: "mapped",
				_type: kind,
				name: "Display name",
				brand: "Canon",
				exifNames: ["Canon Export   Model", " ", "export model"],
			},
		];
		assert.deepEqual(
			matchEquipment(kind, " CANON canon EXPORT model ", "Canon", mapped).value,
			{
				_type: "reference",
				_ref: "mapped",
			},
		);
		assert.equal(
			matchEquipment(kind, "Export", "Canon", mapped).value,
			undefined,
		);
		assert.equal(
			matchEquipment(kind, "Export Model", "Sony", mapped).value,
			undefined,
		);
		assert.equal(
			matchEquipment(
				kind === "camera" ? "lens" : "camera",
				"Export Model",
				undefined,
				mapped,
			).value,
			undefined,
		);
	}
});

test("alias collisions across records stay ambiguous, including display-name matches", () => {
	for (const kind of ["camera", "lens"] as const) {
		const first: Equipment = {
			_id: "first",
			_type: kind,
			name: "First display name",
			exifNames: ["Export Model", "Canon Export Model"],
		};
		const duplicate: Equipment = { ...first, _id: "second" };
		const named: Equipment = {
			_id: "named",
			_type: kind,
			name: "Export Model",
		};
		assert.equal(
			matchEquipment(kind, "Export Model", "Canon", [first, duplicate]).value,
			undefined,
		);
		assert.equal(
			matchEquipment(kind, "Export Model", "Canon", [first, named]).value,
			undefined,
		);
		assert.deepEqual(
			matchEquipment(kind, "Export Model", "Canon", [first]).value,
			{
				_type: "reference",
				_ref: "first",
			},
		);
	}
});

test("alias parsing supports legacy equipment and rejects malformed aliases", () => {
	assert.equal(
		parseEquipment([{ ...equipment[0], exifNames: null }])[0].exifNames,
		undefined,
	);
	assert.deepEqual(
		parseEquipment([{ ...equipment[1], exifNames: [] }])[0].exifNames,
		[],
	);
	for (const exifNames of ["single string", [42], ["valid", null]]) {
		assert.throws(
			() => parseEquipment([{ ...equipment[0], exifNames }]),
			/Invalid equipment EXIF names/,
		);
	}
});

test("confirmation only applies selected valid values and never unsets missing tags", () => {
	const proposals = buildProposals({}, lightroom, equipment);
	const current = snapshot({ aperture: "f/4", location: "Keep me" });
	assert.deepEqual(
		confirmImport("image-1", "image-1", current, current, proposals, new Set())
			.values,
		{},
	);
	assert.deepEqual(
		confirmImport(
			"image-1",
			"image-1",
			current,
			current,
			proposals,
			new Set(["iso"]),
		).values,
		{ iso: 8000 },
	);
	assert.equal(current.aperture, "f/4");
	assert.deepEqual(
		selectedValues(buildProposals({}, undefined, []), new Set(["iso"])),
		{},
	);
});

test("image replacement and collaborator/manual edits require a fresh confirmation", () => {
	const proposals = buildProposals({}, lightroom, equipment);
	assert.equal(
		confirmImport("old", "new", {}, {}, proposals, new Set(["iso"])).status,
		"stale-image",
	);
	const changed = confirmImport(
		"image",
		"image",
		{},
		{ iso: 100 },
		proposals,
		new Set(["iso"]),
	);
	assert.equal(changed.status, "changed-fields");
	assert.deepEqual(changed.values, {});
	assert.equal(
		confirmImport(
			"image",
			"image",
			{ iso: 100 },
			{ iso: 100 },
			proposals,
			new Set(["iso"]),
		).status,
		"ready",
	);
});
