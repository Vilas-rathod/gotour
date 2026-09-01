/** Converts a title into a URL-safe slug matching the backend's expectations. */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    // Strip combining diacritical marks so "Curaçao" becomes "curacao".
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
