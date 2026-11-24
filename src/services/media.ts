import { Asset, requestPermissionsAsync } from 'expo-media-library';
import { Platform } from 'react-native';

export type SaveResult = { ok: true } | { ok: false; reason: 'denied' | 'failed' | 'unavailable'; message?: string };

/** Saves a PNG to Photos/Gallery with write-only permission (FR-19). Never throws. */
export async function saveToGallery(uri: string): Promise<SaveResult> {
  if (Platform.OS === 'web') return { ok: false, reason: 'unavailable' };
  try {
    const perm = await requestPermissionsAsync(true, ['photo']);
    if (!perm.granted) return { ok: false, reason: 'denied' };
  } catch (e) {
    return { ok: false, reason: 'failed', message: e instanceof Error ? e.message : String(e) };
  }
  try {
    await Asset.create(uri);
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: 'failed', message: e instanceof Error ? e.message : String(e) };
  }
}
