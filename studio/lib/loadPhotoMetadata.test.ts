import assert from "node:assert/strict";
import { test } from "node:test";
import {
	type MetadataSource,
	loadPhotoMetadata,
	wait,
} from "./loadPhotoMetadata";

function source(overrides: Partial<MetadataSource> = {}): MetadataSource {
	return {
		asset: async () => ({
			url: "https://cdn.sanity.io/sample.jpg",
			metadata: { exif: { ISO: 800 } },
		}),
		equipment: async () => [],
		original: async () => ({
			ISO: 800,
			DateTimeOriginal: "2026:11:06 09:04:01",
		}),
		wait: async () => {},
		...overrides,
	};
}

test("successful extraction is tied to the asset and does not write documents", async () => {
	const result = await loadPhotoMetadata(
		"image-1",
		source(),
		new AbortController().signal,
	);
	assert.equal(result.assetId, "image-1");
	assert.equal(result.raw?.ISO, 800);
	assert.deepEqual(result.warnings, []);
});

test("older assets use the original EXIF without requiring a re-upload", async () => {
	const result = await loadPhotoMetadata(
		"old-image",
		source({
			asset: async () => ({ url: "https://cdn.sanity.io/sample.jpg" }),
		}),
		new AbortController().signal,
	);
	assert.deepEqual(result.metadata, {});
	assert.equal(result.raw?.ISO, 800);
});

test("missing original EXIF is a normal empty result", async () => {
	const result = await loadPhotoMetadata(
		"image",
		source({
			original: async () => undefined,
		}),
		new AbortController().signal,
	);
	assert.equal(result.raw, undefined);
	assert.deepEqual(result.warnings, []);
});

test("original download failure is surfaced, while extracted scalar data survives", async () => {
	const result = await loadPhotoMetadata(
		"image",
		source({
			original: async () => {
				throw new Error("HTTP 403");
			},
		}),
		new AbortController().signal,
	);
	assert.equal(result.raw, undefined);
	assert.match(result.warnings[0], /HTTP 403/);
	assert.deepEqual(result.metadata.exif, { ISO: 800 });
});

test("equipment failure is surfaced without blocking exposure import", async () => {
	const result = await loadPhotoMetadata(
		"image",
		source({
			equipment: async () => {
				throw new Error("Network unavailable");
			},
		}),
		new AbortController().signal,
	);
	assert.match(result.warnings[0], /Equipment could not be loaded/);
	assert.deepEqual(result.equipment, []);
	assert.equal(result.raw?.ISO, 800);
});

test("asynchronous metadata is retried on a bounded schedule", async () => {
	const delays: number[] = [];
	let reads = 0;
	const result = await loadPhotoMetadata(
		"image",
		source({
			asset: async () => ({
				url: "https://cdn.sanity.io/sample.jpg",
				metadata: ++reads === 3 ? { exif: { ISO: 3200 } } : {},
			}),
			original: async () => undefined,
			wait: async (delay) => {
				delays.push(delay);
			},
		}),
		new AbortController().signal,
	);
	assert.deepEqual(delays, [1000, 2000]);
	assert.deepEqual(result.metadata.exif, { ISO: 3200 });
});

test("permanently absent metadata stops after four retries", async () => {
	const delays: number[] = [];
	await loadPhotoMetadata(
		"image",
		source({
			asset: async () => ({ url: "https://cdn.sanity.io/sample.jpg" }),
			original: async () => undefined,
			wait: async (delay) => {
				delays.push(delay);
			},
		}),
		new AbortController().signal,
	);
	assert.deepEqual(delays, [1000, 2000, 4000, 8000]);
});

test("unavailable assets fail explicitly after bounded retries", async () => {
	let reads = 0;
	await assert.rejects(
		loadPhotoMetadata(
			"missing",
			source({
				asset: async () => {
					reads++;
					return null;
				},
			}),
			new AbortController().signal,
		),
		/not available yet/,
	);
	assert.equal(reads, 5);
});

test("asset access failure is not disguised as empty metadata", async () => {
	await assert.rejects(
		loadPhotoMetadata(
			"image",
			source({
				asset: async () => {
					throw new Error("Access denied");
				},
			}),
			new AbortController().signal,
		),
		/Access denied/,
	);
});

test("replacement/unmount abort prevents stale extraction results", async () => {
	const controller = new AbortController();
	await assert.rejects(
		loadPhotoMetadata(
			"old-image",
			source({
				original: async () => {
					controller.abort(new Error("Image replaced"));
					return { ISO: 800 };
				},
			}),
			controller.signal,
		),
		/Image replaced/,
	);
});

test("abortable wait stops timers promptly", async () => {
	const controller = new AbortController();
	const promise = wait(60_000, controller.signal);
	controller.abort(new Error("Unmounted"));
	await assert.rejects(promise, /Unmounted/);
});
