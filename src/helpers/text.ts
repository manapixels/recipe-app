/**
 * Generates a URL-friendly "slug" from a given string.
 * @param {string} text - The input string to be slugified.
 * @returns {string} The slugified version of the input string.
 */
export function slugify(text: string): string {
  if (text === null) {
    return '';
  }
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

/**
 * Reverses the slugification of a string, replacing hyphens with spaces and capitalizing words.
 * @param {string} slug - The slugified string to be reversed.
 * @returns {string} The original string before slugification.
 */
export function reverseSlugify(slug: string | null): string {
  if (slug === null) {
    return '';
  }
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
