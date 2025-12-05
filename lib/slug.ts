/**
 * Slug generation utilities
 */

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a number if needed
 */
export async function generateUniqueSlug(
    baseSlug: string,
    checkUnique: (slug: string) => Promise<boolean>,
    maxAttempts: number = 10
): Promise<string> {
    const slug = generateSlug(baseSlug);
    let isUnique = await checkUnique(slug);

    if (isUnique) {
        return slug;
    }

    // Try appending numbers
    for (let i = 1; i <= maxAttempts; i++) {
        const candidate = `${slug}-${i}`;
        isUnique = await checkUnique(candidate);
        if (isUnique) {
            return candidate;
        }
    }

    // Fallback: append timestamp
    return `${slug}-${Date.now()}`;
}
