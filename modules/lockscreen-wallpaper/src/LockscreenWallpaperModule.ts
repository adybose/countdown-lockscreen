import { requireOptionalNativeModule } from 'expo';
import type { LockscreenWallpaperNativeModule } from './LockscreenWallpaper.types';

/** `null` in Expo Go, on iOS and on web — callers must feature-detect (NFR-10). */
export function loadLockscreenModule(): LockscreenWallpaperNativeModule | null {
  try {
    return requireOptionalNativeModule<LockscreenWallpaperNativeModule>('LockscreenWallpaper');
  } catch {
    return null;
  }
}
