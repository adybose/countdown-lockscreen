import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import { loadLockscreenModule } from '@/modules/lockscreen-wallpaper';

export interface LockscreenCapabilities {
  /** Native module present (false on iOS, web, Expo Go). */
  available: boolean;
  isWallpaperSupported: boolean;
  isSetWallpaperAllowed: boolean;
  reason: 'ok' | 'not-android' | 'expo-go' | 'module-missing' | 'not-supported' | 'not-allowed';
}

export type SetLockscreenResult = { ok: true; wallpaperId: number } | { ok: false; code: string; message: string };

function isExpoGo(): boolean {
  return Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
}

const NONE = { available: false, isWallpaperSupported: false, isSetWallpaperAllowed: false } as const;

/** ARCHITECTURE §8.3: availability is decided only by the optional native module. */
export function getLockscreenCapabilities(platform: string = Platform.OS): LockscreenCapabilities {
  if (platform !== 'android') return { ...NONE, reason: 'not-android' };
  const mod = loadLockscreenModule();
  if (!mod) return { ...NONE, reason: isExpoGo() ? 'expo-go' : 'module-missing' };
  try {
    const caps = mod.getCapabilities();
    const reason = !caps.isWallpaperSupported ? 'not-supported' : !caps.isSetWallpaperAllowed ? 'not-allowed' : 'ok';
    return {
      available: true,
      isWallpaperSupported: caps.isWallpaperSupported,
      isSetWallpaperAllowed: caps.isSetWallpaperAllowed,
      reason,
    };
  } catch {
    return { ...NONE, reason: 'module-missing' };
  }
}

/** Sets only the lock screen (FLAG_LOCK) unless `alsoSetHome`. Never throws. */
export async function setLockScreenWallpaper(fileUri: string, opts?: { alsoSetHome?: boolean }): Promise<SetLockscreenResult> {
  const mod = loadLockscreenModule();
  if (!mod) return { ok: false, code: 'ERR_UNAVAILABLE', message: 'Lock-screen setting is not available in this build.' };
  try {
    const wallpaperId = await mod.setLockScreenWallpaperAsync(fileUri, { alsoSetHome: opts?.alsoSetHome ?? false, allowBackup: true });
    return { ok: true, wallpaperId };
  } catch (e) {
    const err = e as { code?: unknown; message?: unknown };
    return {
      ok: false,
      code: typeof err.code === 'string' ? err.code : 'ERR_SET_FAILED',
      message: typeof err.message === 'string' ? err.message : String(e),
    };
  }
}
