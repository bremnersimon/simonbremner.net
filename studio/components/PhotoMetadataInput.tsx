import {
	Box,
	Button,
	Card,
	Checkbox,
	Flex,
	Select,
	Stack,
	Text,
} from "@sanity/ui";
import { parse } from "exifr";
import { useEffect, useMemo, useRef, useState } from "react";
import { type ObjectInputProps, PatchEvent, set, useClient } from "sanity";
import {
	EXIF_TAGS,
	type Extraction,
	errorMessage,
	loadPhotoMetadata,
	wait,
} from "../lib/loadPhotoMetadata";
import {
	type Equipment,
	type PhotoField,
	type PhotoValue,
	type PhotoValues,
	buildProposals,
	confirmImport,
	emptyValue,
	parseEquipment,
	record,
	sameValues,
	selectedValues,
	snapshot,
} from "../lib/photoMetadata";

type Preview = {
	extraction: Extraction;
	baseline: PhotoValues;
};

function display(
	value: PhotoValue | undefined,
	equipment: Equipment[],
): string {
	if (value === undefined || value === "") return "Empty";
	if (typeof value !== "object") return String(value);
	return equipment.find((item) => item._id === value._ref)?.name ?? value._ref;
}

const OFFSETS = Array.from({ length: 105 }, (_, i) => {
	const minutes = (i - 48) * 15;
	const absolute = Math.abs(minutes);
	return `${minutes < 0 ? "-" : "+"}${String(Math.floor(absolute / 60)).padStart(2, "0")}:${String(absolute % 60).padStart(2, "0")}`;
});

export default function PhotoMetadataInput(props: ObjectInputProps) {
	const client = useClient({ apiVersion: "2026-11-01" }).withConfig({
		useCdn: false,
		perspective: "published",
	});
	const assetId = record(record(props.value?.image).asset)._ref;
	const id = typeof assetId === "string" ? assetId : undefined;
	const [attempt, setAttempt] = useState(0);
	const [loading, setLoading] = useState(false);
	const [preview, setPreview] = useState<Preview>();
	const [failure, setFailure] = useState<string>();
	const [notice, setNotice] = useState<string>();
	const [offset, setOffset] = useState("-05:00");
	const [selected, setSelected] = useState<Set<PhotoField>>(new Set());
	const current = snapshot(props.value);
	const latest = useRef({ id, current });
	latest.current = { id, current };

	// Keep the configured client stable so form edits do not restart extraction.
	const clientRef = useRef(client);
	clientRef.current = client;
	useEffect(() => {
		const controller = new AbortController();
		const signal = controller.signal;
		setPreview(undefined);
		setFailure(undefined);
		setNotice(attempt ? "Reviewing metadata again..." : undefined);
		setSelected(new Set());
		setOffset("-05:00");
		setLoading(Boolean(id));
		if (!id) return () => controller.abort();
		const activeClient = clientRef.current;
		loadPhotoMetadata(
			id,
			{
				asset: (ref, requestSignal) =>
					activeClient.fetch(
						"*[_type == 'sanity.imageAsset' && _id == $id][0]{url, metadata{image, exif}}",
						{ id: ref },
						{ signal: requestSignal },
					),
				equipment: async (requestSignal) =>
					parseEquipment(
						await activeClient.fetch<unknown>(
							"*[_type in $types]{_id, _type, name, brand, modelNumber, exifNames}",
							{ types: ["camera", "lens"] },
							{ signal: requestSignal },
						),
					),
				original: async (url, requestSignal) => {
					const downloadSignal = AbortSignal.any([
						requestSignal,
						AbortSignal.timeout(20_000),
					]);
					const response = await fetch(url, { signal: downloadSignal });
					if (!response.ok)
						throw new Error(
							`Original download returned HTTP ${response.status}`,
						);
					const bytes = await response.arrayBuffer();
					const result: unknown = await parse(bytes, {
						pick: [...EXIF_TAGS],
						translateValues: false,
						reviveValues: false,
					});
					downloadSignal.throwIfAborted();
					return result;
				},
				wait,
			},
			signal,
		).then(
			(extraction) => {
				if (signal.aborted || latest.current.id !== id) return;
				const baseline = latest.current.current;
				setPreview({ extraction, baseline });
				setSelected(
					new Set(
						buildProposals(
							extraction.metadata,
							extraction.raw,
							extraction.equipment,
						)
							.filter(
								(item) =>
									item.value !== undefined && emptyValue(baseline[item.field]),
							)
							.map((item) => item.field),
					),
				);
				setLoading(false);
			},
			(error: unknown) => {
				if (signal.aborted) return;
				setFailure(errorMessage(error));
				setLoading(false);
			},
		);
		return () => controller.abort();
	}, [id, attempt]);

	const proposals = useMemo(
		() =>
			preview
				? buildProposals(
						preview.extraction.metadata,
						preview.extraction.raw,
						preview.extraction.equipment,
						offset,
					)
				: [],
		[preview, offset],
	);
	const changed = preview && !sameValues(preview.baseline, current);
	const validPreview = preview?.extraction.assetId === id;
	const values = selectedValues(proposals, selected);
	const count = Object.keys(values).length;

	function apply() {
		if (!preview || props.readOnly) return;
		const confirmation = confirmImport(
			preview.extraction.assetId,
			latest.current.id,
			preview.baseline,
			latest.current.current,
			proposals,
			selected,
		);
		if (confirmation.status === "stale-image") {
			setNotice(
				"The image changed. Review metadata for the current image first.",
			);
			return;
		}
		if (confirmation.status === "changed-fields") {
			setPreview({ ...preview, baseline: latest.current.current });
			setSelected(new Set());
			setNotice(
				"Photo fields changed. Review current values and select fields again.",
			);
			return;
		}
		const patches = proposals.flatMap((item) => {
			const value = confirmation.values[item.field];
			return value === undefined ? [] : [set(value, [item.field])];
		});
		if (!patches.length) return;
		props.onChange(PatchEvent.from(patches));
		setPreview({
			...preview,
			baseline: { ...latest.current.current, ...confirmation.values },
		});
		setSelected(new Set());
		setNotice(
			`Applied ${patches.length} fields. All fields remain manually editable.`,
		);
	}

	return (
		<Stack gap={4}>
			<Card padding={4} border radius={2}>
				<Stack gap={4}>
					<Text weight="semibold">Import photo metadata</Text>
					<Text size={1}>
						Review extracted values, then confirm selected fields. Nothing is
						applied automatically. Manual entry is always available below.
					</Text>
					{!id && (
						<Text size={1}>Upload or select a photo to extract metadata.</Text>
					)}
					{loading && <Text size={1}>Reading original photo metadata...</Text>}
					{failure && (
						<Card tone="critical" padding={3}>
							<Text size={1}>
								{failure} Retry or enter the fields manually.
							</Text>
						</Card>
					)}
					{notice && (
						<Text as="output" size={1}>
							{notice}
						</Text>
					)}
					{validPreview && preview && (
						<>
							{preview.extraction.warnings.map((warning) => (
								<Card key={warning} tone="caution" padding={3}>
									<Text size={1}>{warning}</Text>
								</Card>
							))}
							{!proposals.some((item) => item.value !== undefined) && (
								<Text size={1}>
									No importable metadata found. Older assets may not have
									extracted EXIF. Retry or enter the fields manually.
								</Text>
							)}
							{proposals.some(
								(item) => item.field === "dateTaken" && item.requiresOffset,
							) && (
								<Stack gap={2}>
									<Text as="label" htmlFor={`${props.id}-offset`} size={1}>
										Capture UTC offset (default: fixed EST, no daylight saving)
									</Text>
									<Select
										id={`${props.id}-offset`}
										value={offset}
										disabled={props.readOnly}
										onChange={(event) => setOffset(event.currentTarget.value)}
									>
										{OFFSETS.map((zone) => (
											<option key={zone} value={zone}>
												UTC{zone}
												{zone === "-05:00" ? " (fixed EST)" : ""}
											</option>
										))}
									</Select>
								</Stack>
							)}
							{proposals.map((item) => (
								<Flex key={item.field} gap={3} align="flex-start">
									<Checkbox
										id={`${props.id}-${item.field}`}
										checked={selected.has(item.field)}
										disabled={props.readOnly || item.value === undefined}
										onChange={(event) => {
											const checked = event.currentTarget.checked;
											setSelected((previous) => {
												const next = new Set(previous);
												if (checked) next.add(item.field);
												else next.delete(item.field);
												return next;
											});
										}}
									/>
									<Box flex={1}>
										<Stack gap={2}>
											<Text
												as="label"
												htmlFor={`${props.id}-${item.field}`}
												size={1}
												weight="semibold"
											>
												{item.label}
											</Text>
											<Text size={1}>
												Current:{" "}
												{display(
													current[item.field],
													preview.extraction.equipment,
												)}
												{" / "}Proposed:{" "}
												{item.value === undefined
													? "Unavailable"
													: display(item.value, preview.extraction.equipment)}
											</Text>
											{item.message && <Text size={1}>{item.message}</Text>}
											{selected.has(item.field) &&
												!emptyValue(current[item.field]) && (
													<Text size={1}>
														Confirmation will replace the existing value.
													</Text>
												)}
										</Stack>
									</Box>
								</Flex>
							))}
							{changed && (
								<Text size={1}>
									Fields changed since this preview. Confirmation will first
									refresh comparisons and clear selections for your review.
								</Text>
							)}
							<Button
								text={
									changed
										? "Refresh comparisons"
										: `Confirm and apply ${count} selected fields`
								}
								tone="primary"
								disabled={props.readOnly || (!changed && count === 0)}
								onClick={apply}
							/>
						</>
					)}
					{id && (
						<Button
							text="Retry / review metadata"
							mode="ghost"
							disabled={loading || props.readOnly}
							onClick={() => setAttempt((value) => value + 1)}
						/>
					)}
				</Stack>
			</Card>
			{props.renderDefault(props)}
		</Stack>
	);
}
