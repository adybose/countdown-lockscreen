import { requireOptionalNativeModule } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { getLockscreenCapabilities, setLockScreenWallpaper } from '@/src/services/lockscreen';

jest.mock('expo', () => ({ requireOptionalNativeModule: jest.fn() }));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { executionEnvironment: 'bare' },
  ExecutionEnvironment: { Bare: 'bare', Standalone: 'standalone', StoreClient: 'storeClient' },
}));

const requireMock = requireOptionalNativeModule as jest.Mock;
const constants = Constants as { executionEnvironment: string };

const nativeOk = () => ({
  getCapabilities: jest.fn(() => ({ isWallpaperSupported: true, isSetWallpaperAllowed: true, sdkInt: 34 })),
  setLockScreenWallpaperAsync: jest.fn(() => Promise.resolve(42)),
});

beforeEach(() => {
  requireMock.mockReset();
  constants.executionEnvironment = ExecutionEnvironment.Bare;
});

describe('getLockscreenCapabilities (AC-21)', () => {
  it('module absent in Expo Go → available false, reason expo-go', () => {
    requireMock.mockReturnValue(null);
    constants.executionEnvironment = ExecutionEnvironment.StoreClient;
    expect(getLockscreenCapabilities('android')).toMatchObject({ available: false, reason: 'expo-go' });
  });
  it('module absent in a dev build → module-missing', () => {
    requireMock.mockReturnValue(null);
    expect(getLockscreenCapabilities('android')).toMatchObject({ available: false, reason: 'module-missing' });
    expect(requireMock).toHaveBeenCalledWith('LockscreenWallpaper');
  });
  it('iOS / web → not-android without touching the module', () => {
    expect(getLockscreenCapabilities('ios')).toMatchObject({ available: false, reason: 'not-android' });
    expect(getLockscreenCapabilities('web').reason).toBe('not-android');
    expect(requireMock).not.toHaveBeenCalled();
  });
  it('module present → ok', () => {
    requireMock.mockReturnValue(nativeOk());
    expect(getLockscreenCapabilities('android')).toEqual({ available: true, isWallpaperSupported: true, isSetWallpaperAllowed: true, reason: 'ok' });
  });
  it('device policy blocks wallpaper changes → not-allowed', () => {
    const m = nativeOk();
    m.getCapabilities.mockReturnValue({ isWallpaperSupported: true, isSetWallpaperAllowed: false, sdkInt: 34 });
    requireMock.mockReturnValue(m);
    expect(getLockscreenCapabilities('android').reason).toBe('not-allowed');
  });
  it('unsupported device → not-supported', () => {
    const m = nativeOk();
    m.getCapabilities.mockReturnValue({ isWallpaperSupported: false, isSetWallpaperAllowed: true, sdkInt: 34 });
    requireMock.mockReturnValue(m);
    expect(getLockscreenCapabilities('android').reason).toBe('not-supported');
  });
});

describe('setLockScreenWallpaper', () => {
  it('calls through with lock-only defaults', async () => {
    const m = nativeOk();
    requireMock.mockReturnValue(m);
    expect(await setLockScreenWallpaper('file:///tmp/a.png')).toEqual({ ok: true, wallpaperId: 42 });
    expect(m.setLockScreenWallpaperAsync).toHaveBeenCalledWith('file:///tmp/a.png', { alsoSetHome: false, allowBackup: true });
  });
  it('maps a native rejection to { ok: false, code }', async () => {
    const m = nativeOk();
    m.setLockScreenWallpaperAsync.mockRejectedValue(Object.assign(new Error('nope'), { code: 'ERR_DECODE_FAILED' }));
    requireMock.mockReturnValue(m);
    expect(await setLockScreenWallpaper('file:///tmp/a.png')).toEqual({ ok: false, code: 'ERR_DECODE_FAILED', message: 'nope' });
  });
  it('returns ERR_UNAVAILABLE when the module is absent', async () => {
    requireMock.mockReturnValue(null);
    expect(await setLockScreenWallpaper('file:///x.png')).toMatchObject({ ok: false, code: 'ERR_UNAVAILABLE' });
  });
});
