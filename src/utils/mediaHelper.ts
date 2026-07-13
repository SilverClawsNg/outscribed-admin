
export const mediaHelper = {
  getUrl(filename: string | undefined, collection: 'tales' | 'insights' | 'profiles', size: 'full' | 'thumb' = 'full'): string {
    if (!filename) return '';

    let cleanFile = filename.trim().split('/').filter(Boolean).pop() || '';
    if (!cleanFile) return '';

    // Generates a predictable, secure route: https://outscribed.com/images/thumb/tales/asset.jpg
    return `https://outscribed.com/images/${size}/${collection}/${cleanFile}`;
  }
};