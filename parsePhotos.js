/**
 * Parses the L_Photos field from the database, which is stored as a JSON
 * string array of photo URLs. Handles all known malformed cases:
 * - null / undefined
 * - empty string '' (the actual "no photos" case found in this dataset)
 * - '[]' (empty array, valid JSON but no photos)
 * - malformed/invalid JSON
 * - JSON that parses but isn't an array
 * - arrays containing non-string entries
 *
 * Always returns an array of strings (possibly empty). Never throws.
 */
export function parsePhotos(rawPhotos) {
  if (rawPhotos === null || rawPhotos === undefined) {
    return [];
  }

  if (typeof rawPhotos !== "string") {
    return [];
  }

  const trimmed = rawPhotos.trim();
  if (trimmed === "") {
    return [];
  }

  let parsed;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err) {
    return [];
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.filter((item) => typeof item === "string" && item.length > 0);
}

/**
 * Returns the first photo URL, or null if none exist.
 */
export function getFirstPhoto(rawPhotos) {
  const photos = parsePhotos(rawPhotos);
  return photos.length > 0 ? photos[0] : null;
}
