# Photography Studio

## Importing Lightroom photo metadata

1. Export the original JPEG from Lightroom with camera metadata included.
   Consistent export settings give a consistent tag structure, not identical
   exposure values for every photo. Messaging/image-sharing services may resize
   files and strip their metadata.
2. Upload or select the image in a Photo document. The standard upload, crop,
   hotspot, and manual form controls remain available.
3. Review the **Import photo metadata** panel. It proposes camera, lens, focal
   length, aperture, shutter speed, ISO, and Date Taken. Nothing is applied
   automatically.
4. Select the fields to import, then **Confirm and apply**. Available values for
   empty fields are selected initially. Replacing an existing value requires
   selecting its checkbox explicitly, with an overwrite warning.
5. Edit any field manually afterward. Imported values are not continuously
   synchronized. Use **Retry / review metadata** to extract again.

Camera and lens match existing published equipment records by exact normalized
model/name or EXIF alias, with brand checked when supplied. Unmatched or ambiguous
models are not automatically created or selected: use the normal Camera and
Lens reference inputs to select or create them manually. Publish new equipment
before retrying the match.

To map a different import name to an existing entry:

1. Open the Camera or Lens document and keep its display name unchanged.
2. Add the imported model name to **EXIF Camera Names** or **EXIF Lens Names**.
   For example, on the lens named `Canon RF 100-400mm`, add
   `RF100-400mm F5.6-8 IS USM`. A camera alias might be `Canon EOS R6m2`.
3. Add other variants as separate entries, then publish the equipment document.
4. On the photo, click **Retry / review metadata**, review the matched equipment,
   select its checkbox if replacing an existing reference, and confirm.

Matching ignores case, repeated whitespace, and brand prefixes; it does not
guess based on partial names. Multiple aliases on one entry are supported.
If multiple entries match the same name (including aliases), selection remains
manual. Existing entries do not need aliases if their names already match.

Changing the image never clears or overwrites photo fields. Changing fields
after extraction, including collaborator changes, requires refreshed
comparisons and renewed selection before applying.

### Capture dates and UTC offsets

Date Taken uses the original capture timestamp, not export or filesystem dates.
An embedded EXIF offset is respected even if it differs from the default.
For photos without an offset, choose the capture UTC offset in the preview.
The default is **fixed EST (UTC-05:00), year-round**, not America/New_York:
there is no automatic daylight-saving adjustment. The preview shows the
resulting UTC datetime before confirmation.

If the downloaded original has no readable capture timestamp, the importer
offers Sanity's stored `DateTimeOriginal` as a fallback. Its timezone is
explicitly marked **unverified**: the normalized `Z` suffix is not treated as
proof that the camera used UTC. Review the stored wall-clock time and choose
the capture offset before confirming; the default remains fixed EST.
For the sample photo's recorded `-04:00` offset, choose `UTC-04:00` when using
this fallback.

For example, `2026:11:06 09:04:01` with an embedded `-04:00` becomes
`2026-11-06T13:04:01.000Z`; without an embedded offset, the default `-05:00`
would produce `2026-11-06T14:04:01.000Z`.

### Missing metadata and failures

Extraction uses Sanity's asset metadata for technical values and reads the
original asset's EXIF to preserve capture-time offset information and provide
missing tags. Sanity's normalized datetime alone cannot establish the original
timezone. Missing tags never erase existing fields. Aperture uses `FNumber`,
not the EXIF APEX `ApertureValue`.

Some Sanity metadata arrives asynchronously. The panel retries on a bounded
schedule (1, 2, 4, and 8 seconds), and original downloads time out after 20
seconds. Access, network, and parse failures appear in the panel; valid partial
values remain importable. Retry or enter values manually if extraction fails.

Enabling EXIF extraction does not backfill older assets. Selecting an older
asset can still work when the original download retains EXIF. A stored capture
date can be reviewed even if the downloaded original has no readable EXIF.
If neither source provides a capture timestamp, use manual entry.

### Metadata privacy

The importer does not populate descriptive fields or GPS/location and requests
no separate Sanity location extraction. This is not a metadata scrubber:
retained EXIF and downloadable originals can include GPS, serial numbers, or
other identifying data. Consider your dataset and asset visibility when
exporting/uploading photos. Changing schema options later does not remove
metadata already stored on assets.

## Development checks

From this directory:

```sh
pnpm test
pnpm check
pnpm build
```

Tests cover mapping, date offsets, conservative equipment matching, explicit
confirmation, stale state, partial failures, retries, and cancellation.

[Sanity image metadata documentation](https://www.sanity.io/docs/apis-and-sdks/image-metadata)

