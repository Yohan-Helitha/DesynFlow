// Utility to build a full URL to files served from /uploads
// - Accepts absolute URLs as-is
// - Normalizes Windows paths
// - Preserves original /uploads subpath (e.g., /uploads/inspection_payments)
// - When not present, uses fallbackFolder within /uploads
// - Uses absolute backend base in development for reliability

export function buildUploadsUrl(raw, fallbackFolder = '') {
  if (!raw) return '';
  const str = String(raw);
  if (/^https?:\/\//i.test(str)) return str; // absolute URL

  // Normalize backslashes from Windows
  let normalized = str.replace(/\\/g, '/');
  const lower = normalized.toLowerCase();

  // If path already includes /uploads, slice from there (preserve casing after slice)
  let idx = lower.indexOf('/uploads/');
  if (idx !== -1) {
    let path = normalized.slice(idx);
    if (!path.startsWith('/')) path = `/${path}`;
    const base = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
    return `${base}${path}`;
  }

  // Handle variants missing leading slash
  idx = lower.indexOf('uploads/');
  if (idx !== -1) {
    let path = normalized.slice(idx);
    if (!path.startsWith('/')) path = `/${path}`;
    const base = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
    return `${base}${path}`;
  }

  // Handle full local paths containing server/uploads
  idx = lower.indexOf('server/uploads/');
  if (idx !== -1) {
    let path = normalized.slice(idx + 'server'.length);
    if (!path.startsWith('/')) path = `/${path}`;
    const base = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
    return `${base}${path}`;
  }

  // Fallback to /uploads/<fallbackFolder>/<filename>
  const fileName = normalized.split('/').filter(Boolean).pop();
  const folder = fallbackFolder ? `/${fallbackFolder.replace(/^\/+|\/+$/g, '')}` : '';
  const base = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : '';
  return `${base}/uploads${folder}/${fileName}`;
}
