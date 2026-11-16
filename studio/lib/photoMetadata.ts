export const PHOTO_FIELDS = [
	"camera",
	"lens",
	"focalLength",
	"aperture",
	"shutterSpeed",
	"iso",
	"dateTaken",
] as const;

export type PhotoField = (typeof PHOTO_FIELDS)[number];
export type Metadata = Record<string, unknown>;
export type PhotoReference = { _type: "reference"; _ref: string };
export type PhotoValue = string | number | PhotoReference;
export type PhotoValues = Partial<Record<PhotoField, PhotoValue>>;
export type Equipment = {
	_id: string;
	_type: "camera" | "lens";
	name: string;
	brand?: string;
	modelNumber?: string;
};
export type Proposal = {
	field: PhotoField;
	label: string;
	value?: PhotoValue;
	message?: string;
};

function isRecord(value: unknown): value is Metadata {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function record(value: unknown): Metadata {
	return isRecord(value) ? value : {};
}

export function parseEquipment(value: unknown): Equipment[] {
	if (!Array.isArray(value)) throw new Error("Invalid equipment response.");
	return value.map((entry: unknown) => {
		const item = record(entry);
		if (
			typeof item._id !== "string" ||
			(item._type !== "camera" && item._type !== "lens") ||
			typeof item.name !== "string" ||
			(item.brand != null && typeof item.brand !== "string") ||
			(item.modelNumber != null && typeof item.modelNumber !== "string")
		)
			throw new Error("Invalid equipment record.");
		const equipment: Equipment = {
			_id: item._id,
			_type: item._type,
			name: item.name,
		};
		if (typeof item.brand === "string") equipment.brand = item.brand;
		if (typeof item.modelNumber === "string")
			equipment.modelNumber = item.modelNumber;
		return equipment;
	});
}

function text(value: unknown): string | undefined {
	return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function positive(value: unknown): number | undefined {
	return typeof value === "number" && Number.isFinite(value) && value > 0
		? value
		: undefined;
}

function normalize(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function withoutBrand(value: string, brand?: string): string {
	let result = normalize(value);
	if (brand) {
		const prefix = `${normalize(brand)} `;
		while (result.startsWith(prefix)) result = result.slice(prefix.length);
	}
	return result;
}

export function matchEquipment(
	kind: "camera" | "lens",
	model: unknown,
	make: unknown,
	equipment: Equipment[],
): Proposal {
	const label = kind === "camera" ? "Camera" : "Lens";
	const name = text(model);
	const brand = text(make);
	if (!name) return { field: kind, label, message: "No model tag found." };
	const matches = equipment.filter((item) => {
		if (item._type !== kind) return false;
		if (brand && item.brand && normalize(brand) !== normalize(item.brand))
			return false;
		const prefix = brand ?? item.brand;
		const target = withoutBrand(name, prefix);
		return [item.name, kind === "camera" ? item.modelNumber : undefined].some(
			(candidate) => candidate && withoutBrand(candidate, prefix) === target,
		);
	});
	if (matches.length !== 1) {
		return {
			field: kind,
			label,
			message: `${name}: ${matches.length ? "multiple matching records" : "no matching record"}. Select or create equipment manually in the form.`,
		};
	}
	return {
		field: kind,
		label,
		value: { _type: "reference", _ref: matches[0]._id },
		message: `Matched ${matches[0].name} (${name}).`,
	};
}

export function formatExposure(seconds: number): string {
	const reciprocal = 1 / seconds;
	const denominator = Math.round(reciprocal);
	// Only round to a reciprocal when the stored exposure agrees within 0.1%.
	if (seconds < 1 && Math.abs(reciprocal - denominator) / reciprocal < 0.001)
		return `1/${denominator}s`;
	return `${Number(seconds.toPrecision(8))}s`;
}

export function captureDate(
	raw: Metadata | undefined,
	offset = "-05:00",
): Proposal {
	const base = { field: "dateTaken", label: "Date Taken" } as const;
	const timestamp = text(raw?.DateTimeOriginal);
	if (!timestamp)
		return {
			...base,
			message:
				"Original capture timestamp unavailable. Enter Date Taken manually.",
		};
	const match =
		/^(\d{4})[:-](\d{2})[:-](\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})?$/.exec(
			timestamp,
		);
	const embedded = text(raw?.OffsetTimeOriginal) ?? match?.[8];
	const zone = embedded === "Z" ? "+00:00" : (embedded ?? offset);
	const zoneMatch = /^([+-])(\d{2}):(\d{2})$/.exec(zone);
	if (
		!match ||
		!zoneMatch ||
		Number(zoneMatch[2]) > 14 ||
		Number(zoneMatch[3]) > 59 ||
		(Number(zoneMatch[2]) === 14 && Number(zoneMatch[3]) !== 0)
	)
		return { ...base, message: "Invalid capture timestamp or UTC offset." };
	const [, year, month, day, hour, minute, second, fraction] = match;
	const wall = new Date(
		`${year}-${month}-${day}T${hour}:${minute}:${second}.${(fraction ?? "").padEnd(3, "0")}Z`,
	);
	if (
		!Number.isFinite(wall.getTime()) ||
		wall.getUTCFullYear() !== Number(year) ||
		wall.getUTCMonth() + 1 !== Number(month) ||
		wall.getUTCDate() !== Number(day) ||
		wall.getUTCHours() !== Number(hour) ||
		wall.getUTCMinutes() !== Number(minute) ||
		wall.getUTCSeconds() !== Number(second)
	)
		return { ...base, message: "Invalid original capture timestamp." };
	const offsetMinutes =
		(Number(zoneMatch[2]) * 60 + Number(zoneMatch[3])) *
		(zoneMatch[1] === "-" ? -1 : 1);
	return {
		...base,
		value: new Date(wall.getTime() - offsetMinutes * 60_000).toISOString(),
		message: `${timestamp} / ${embedded ? "embedded offset" : "selected offset"} ${zone}.`,
	};
}

export function buildProposals(
	metadata: Metadata,
	raw: Metadata | undefined,
	equipment: Equipment[],
	offset = "-05:00",
): Proposal[] {
	const image = record(metadata.image);
	const exif = record(metadata.exif);
	const tag = (key: string) => exif[key] ?? image[key] ?? raw?.[key];
	const scalar = (
		field: PhotoField,
		label: string,
		key: string,
		format: (value: number) => string | number,
	): Proposal => {
		const value = tag(key);
		const number = positive(value);
		return number === undefined
			? {
					field,
					label,
					message: value == null ? "No tag found." : `Invalid ${key} tag.`,
				}
			: { field, label, value: format(number) };
	};
	return [
		matchEquipment("camera", tag("Model"), tag("Make"), equipment),
		matchEquipment("lens", tag("LensModel"), tag("LensMake"), equipment),
		scalar("focalLength", "Focal Length", "FocalLength", (n) => `${n}mm`),
		scalar("aperture", "Aperture", "FNumber", (n) => `f/${n}`),
		scalar("shutterSpeed", "Shutter Speed", "ExposureTime", formatExposure),
		scalar("iso", "ISO", "ISO", (n) => n),
		// Sanity's normalized datetime cannot establish the original offset.
		captureDate(raw, offset),
	];
}

export function snapshot(document: unknown): PhotoValues {
	const source = record(document);
	const values: PhotoValues = {};
	for (const field of PHOTO_FIELDS) {
		const value = source[field];
		if (typeof value === "string" || typeof value === "number")
			values[field] = value;
		else if (typeof record(value)._ref === "string")
			values[field] = {
				_type: "reference",
				_ref: String(record(value)._ref),
			};
	}
	return values;
}

export function sameValues(a: PhotoValues, b: PhotoValues): boolean {
	return PHOTO_FIELDS.every(
		(field) => JSON.stringify(a[field]) === JSON.stringify(b[field]),
	);
}

export function emptyValue(value: PhotoValue | undefined): boolean {
	return value === undefined || value === "";
}

export function selectedValues(
	proposals: Proposal[],
	selected: Set<PhotoField>,
): PhotoValues {
	const values: PhotoValues = {};
	for (const proposal of proposals) {
		if (selected.has(proposal.field) && proposal.value !== undefined)
			values[proposal.field] = proposal.value;
	}
	return values;
}

export function confirmImport(
	assetId: string,
	currentAssetId: string | undefined,
	baseline: PhotoValues,
	current: PhotoValues,
	proposals: Proposal[],
	selected: Set<PhotoField>,
): { status: "stale-image" | "changed-fields" | "ready"; values: PhotoValues } {
	if (assetId !== currentAssetId) return { status: "stale-image", values: {} };
	if (!sameValues(baseline, current))
		return { status: "changed-fields", values: {} };
	return { status: "ready", values: selectedValues(proposals, selected) };
}
