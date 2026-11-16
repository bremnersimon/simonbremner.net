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
		shutterSpeed: "1/250s",
		iso: 8000,
		dateTaken: "2026-11-06T13:04:01.000Z",
	});
});

test("Sanity technical metadata is preferred; its normalized date is not guessed", () => {
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
	assert.equal(proposals.find((p) => p.field === "shutterSpeed")?.value, "2s");
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
	assert.equal(
		proposals.find((p) => p.field === "shutterSpeed")?.value,
		"0.4s",
	);
});

test("fractional, long, and approximate reciprocal exposures retain precision", () => {
	assert.equal(formatExposure(1 / 125), "1/125s");
	assert.equal(formatExposure(0.3), "0.3s");
	assert.equal(formatExposure(0.66666667), "0.66666667s");
	assert.equal(formatExposure(1.5), "1.5s");
	assert.equal(formatExposure(30), "30s");
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
