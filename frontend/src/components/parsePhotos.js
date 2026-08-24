/**
 * L_Photos comes back from the API as a JSON-stringified array, e.g.
 *   '["https://example.com/1.jpg","https://example.com/2.jpg"]'
 * It can also be null/undefined/empty/malformed depending on the listing,
 * so we always fall back to [] rather than let a bad row crash the UI.
 */
export function parsePhotos(lPhotos) {
  if (!lPhotos) return [];

  try {
    const parsed = typeof lPhotos === "string" ? JSON.parse(lPhotos) : lPhotos;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((url) => typeof url === "string" && url.trim() !== "");
  } catch {
    return [];
  }
}
