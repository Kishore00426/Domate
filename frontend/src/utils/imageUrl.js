export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Normalize path: replace backslashes with forward slashes (common Windows issue)
    const normalizedPath = path.replace(/\\/g, '/');
    const baseUrl = 'http://localhost:4000';

    return `${baseUrl}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
};
