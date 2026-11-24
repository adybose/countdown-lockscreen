export interface NativeCapabilities {
  isWallpaperSupported: boolean;
  isSetWallpaperAllowed: boolean;
  sdkInt: number;
}

export interface SetOptions {
  alsoSetHome?: boolean;
  allowBackup?: boolean;
}

export type LockscreenErrorCode =
  | 'ERR_FILE_NOT_FOUND'
  | 'ERR_DECODE_FAILED'
  | 'ERR_NOT_SUPPORTED'
  | 'ERR_NOT_ALLOWED'
  | 'ERR_SET_FAILED';

export interface LockscreenWallpaperNativeModule {
  getCapabilities(): NativeCapabilities;
  setLockScreenWallpaperAsync(fileUri: string, options: SetOptions): Promise<number>;
}
