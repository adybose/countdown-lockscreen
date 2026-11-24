import * as Sharing from 'expo-sharing';

export async function isShareAvailable(): Promise<boolean> {
  try {
    return await Sharing.isAvailableAsync();
  } catch {
    return false;
  }
}

/** Opens the OS share sheet with a PNG (FR-20). Returns false when sharing is unavailable. */
export async function sharePng(uri: string): Promise<boolean> {
  if (!(await isShareAvailable())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'image/png', UTI: 'public.png', dialogTitle: 'Share wallpaper' });
  return true;
}

export async function shareJson(uri: string): Promise<boolean> {
  if (!(await isShareAvailable())) return false;
  await Sharing.shareAsync(uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: 'Export plan' });
  return true;
}
