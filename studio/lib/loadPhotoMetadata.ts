import { type Equipment, type Metadata, record } from "./photoMetadata";

export const EXIF_TAGS = [
	"Make",
	"Model",
	"LensMake",
	"LensModel",
	"FocalLength",
	"FNumber",
	"ExposureTime",
	"ISO",
	"DateTimeOriginal",
	"OffsetTimeOriginal",
] as const;

export type Extraction = {
	assetId: string;
	metadata: Metadata;
	raw?: Metadata;
	equipment: Equipment[];
	warnings: string[];
};

export type MetadataSource = {
	asset: (id: string, signal: AbortSignal) => Promise<unknown>;
	equipment: (signal: AbortSignal) => Promise<Equipment[]>;
	original: (url: string, signal: AbortSignal) => Promise<unknown>;
	wait: (milliseconds: number, signal: AbortSignal) => Promise<void>;
};

export function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

export async function loadPhotoMetadata(
	assetId: string,
	source: MetadataSource,
	signal: AbortSignal,
): Promise<Extraction> {
	let asset = record(await source.asset(assetId, signal));
	signal.throwIfAborted();
	for (const delay of [1000, 2000, 4000, 8000]) {
		if (typeof asset.url === "string") break;
		await source.wait(delay, signal);
		asset = record(await source.asset(assetId, signal));
	}
	if (typeof asset.url !== "string")
		throw new Error(
			"The uploaded asset is not available yet. Retry or enter values manually.",
		);

	const warnings: string[] = [];
	const [raw, equipment] = await Promise.all([
		source.original(asset.url, signal).then(
			(value) => (value == null ? undefined : record(value)),
			(error: unknown) => {
				signal.throwIfAborted();
				warnings.push(
					`Original EXIF could not be read: ${errorMessage(error)}. If a stored capture date is available, confirm its UTC offset; otherwise enter Date Taken manually.`,
				);
				return undefined;
			},
		),
		source.equipment(signal).catch((error: unknown) => {
			signal.throwIfAborted();
			warnings.push(
				`Equipment could not be loaded: ${errorMessage(error)}. Select camera and lens manually.`,
			);
			return [];
		}),
	]);
	let metadata = record(asset.metadata);
	// Older assets may have no extracted metadata; the original is a valid fallback.
	if (!raw && !Object.keys(record(metadata.exif)).length) {
		for (const delay of [1000, 2000, 4000, 8000]) {
			await source.wait(delay, signal);
			asset = record(await source.asset(assetId, signal));
			metadata = record(asset.metadata);
			if (Object.keys(record(metadata.exif)).length) break;
		}
	}
	signal.throwIfAborted();
	return { assetId, metadata, raw, equipment, warnings };
}

export function wait(milliseconds: number, signal: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		signal.throwIfAborted();
		const abort = () => {
			clearTimeout(timer);
			reject(signal.reason);
		};
		const timer = setTimeout(() => {
			signal.removeEventListener("abort", abort);
			resolve();
		}, milliseconds);
		signal.addEventListener("abort", abort, { once: true });
	});
}
