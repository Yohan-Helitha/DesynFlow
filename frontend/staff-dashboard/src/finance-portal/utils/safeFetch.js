// Safe fetch wrapper that gracefully handles empty or non-JSON responses
export async function safeFetchJson(url, options = {}) {
  const res = await fetch(url, options);
  let text = '';
  try {
    text = await res.text();
  } catch (_) {
    // ignore body read errors
  }

  // Try to extract error details from JSON-ish body when not ok
  if (!res.ok) {
    let serverMsg = '';
    try {
      const maybeJson = text ? JSON.parse(text) : null;
      serverMsg = maybeJson && (maybeJson.error || maybeJson.message) ? `: ${maybeJson.error || maybeJson.message}` : '';
    } catch (_) {
      // not JSON, ignore
    }
    const err = new Error(`HTTP ${res.status}${serverMsg}`);
    err.status = res.status;
    err.body = text;
    throw err;
  }

  // No content
  if (!text) return null;

  // Parse JSON if possible; fallback to null
  try {
    return JSON.parse(text);
  } catch (_) {
    // Not JSON; return raw text to caller if they want to handle it
    return text;
  }
}
