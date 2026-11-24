import { Alert, Platform } from 'react-native';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
}

/** Cross-platform confirm dialog (RN Alert is a no-op on web). */
export function confirmAsync({ title, message, confirmLabel, cancelLabel = 'Cancel', destructive }: ConfirmOptions): Promise<boolean> {
  if (Platform.OS === 'web') {
    const g = globalThis as { confirm?: (msg: string) => boolean };
    return Promise.resolve(typeof g.confirm === 'function' ? g.confirm(`${title}\n\n${message}`) : true);
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: cancelLabel, style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

/** Cross-platform informational alert. */
export function alertAsync(title: string, message: string): Promise<void> {
  if (Platform.OS === 'web') {
    const g = globalThis as { alert?: (msg: string) => void };
    g.alert?.(`${title}\n\n${message}`);
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    Alert.alert(title, message, [{ text: 'OK', onPress: () => resolve() }], { onDismiss: () => resolve() });
  });
}
