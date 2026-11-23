import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { create } from 'zustand';
import { useChrome } from '@/src/hooks/useChrome';
import { AppText } from './AppText';

export interface ToastAction {
  label: string;
  onPress: () => void;
}

export interface ToastSpec {
  message: string;
  tone?: 'info' | 'success' | 'error';
  actions?: ToastAction[];
  durationMs?: number;
}

interface ToastState {
  toast: (ToastSpec & { id: number }) | null;
  show: (t: ToastSpec) => void;
  hide: () => void;
}

let seq = 0;

export const useToastStore = create<ToastState>()((set) => ({
  toast: null,
  show: (t) => set({ toast: { ...t, id: ++seq } }),
  hide: () => set({ toast: null }),
}));

export function showToast(t: ToastSpec): void {
  useToastStore.getState().show(t);
}

/** Mounted once in the root layout. */
export function ToastHost() {
  const toast = useToastStore((s) => s.toast);
  const hide = useToastStore((s) => s.hide);
  const { c, scheme } = useChrome();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!toast) return;
    const ms = toast.durationMs ?? (toast.actions?.length ? 6000 : 3500);
    const t = setTimeout(hide, ms);
    return () => clearTimeout(t);
  }, [toast, hide]);

  if (!toast) return null;
  const bar = toast.tone === 'error' ? c.danger : toast.tone === 'success' ? c.success : c.border;
  const bg = scheme === 'dark' ? '#23262E' : '#14151A';

  return (
    <View pointerEvents="box-none" style={[styles.host, { bottom: insets.bottom + 16 }]}>
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={[styles.toast, { backgroundColor: bg, borderLeftColor: bar }]}
      >
        <AppText variant="bodyStrong" style={styles.msg}>
          {toast.message}
        </AppText>
        {toast.actions?.map((a) => (
          <Pressable
            key={a.label}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            onPress={() => {
              hide();
              a.onPress();
            }}
            style={styles.action}
          >
            <AppText variant="label" style={styles.actionText}>
              {a.label}
            </AppText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, alignItems: 'center' },
  toast: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 12,
    borderLeftWidth: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 4,
  },
  msg: { color: '#FFFFFF', flexGrow: 1, flexShrink: 1, paddingVertical: 6 },
  action: { minHeight: 44, minWidth: 44, justifyContent: 'center', paddingHorizontal: 8 },
  actionText: { color: '#7FD7FF' },
});
