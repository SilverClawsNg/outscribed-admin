
const MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_BASE_URL || 'https://staging-media.outscribed.com';

export const mediaHelper = {
  getUrl(
    filename: string | undefined, 
    collection: 'tales' | 'insights' | 'profiles', 
    size: 'full' | 'thumb' = 'full'
  ): string {
    if (!filename) return '';

    let cleanFile = filename.trim().split('/').filter(Boolean).pop() || '';
    if (!cleanFile) return '';

    // Fix extension if .jpg was passed for placeholders stored as .png in R2
    if (cleanFile.includes('placeholder')) {
      cleanFile = cleanFile.replace(/\.jpg$/, '.png');
    }

    // Output: https://staging-media.outscribed.com/outscribed/tales/yellow_placeholder.png
    return `${MEDIA_BASE_URL}/outscribed/${collection}/${cleanFile}`;
  }
};