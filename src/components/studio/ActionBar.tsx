import { CircleHelp, Download, Lock, Share2 } from 'lucide-react-native';
import { Platform, StyleSheet, View } from 'react-native';
import { AppText, Button } from '@/src/components/ui';
import { S } from '@/src/constants/strings';

export interface ActionBarProps {
  busy: boolean;
  onSave: () => void;
  onShare: () => void;
  /** Android only (FR-21). `undefined` hides the button. */
  lock?: { enabled: boolean; reason: string | null; onPress: () => void };
  /** iOS only (FR-22). */
  onHowTo?: () => void;
}

export function ActionBar({ busy, onSave, onShare, lock, onHowTo }: ActionBarProps) {
  const isIOS = Platform.OS === 'ios';
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Button
          label={isIOS ? S.studio.saveToPhotos : S.studio.save}
          icon={Download}
          variant={lock?.enabled ? 'secondary' : 'primary'}
          onPress={onSave}
          disabled={busy}
          style={styles.flex}
        />
        {lock ? (
          <Button
            label={S.studio.setLock}
            icon={Lock}
            onPress={lock.onPress}
            disabled={busy || !lock.enabled}
            accessibilityHint={lock.reason ?? undefined}
            style={styles.flex}
          />
        ) : null}
        <Button label={S.studio.share} icon={Share2} variant="secondary" onPress={onShare} disabled={busy} style={styles.flex} />
      </View>
      {lock && !lock.enabled && lock.reason ? (
        <AppText variant="caption" tone="secondary" accessibilityLiveRegion="polite">
          ⓘ {lock.reason}
        </AppText>
      ) : null}
      {onHowTo ? <Button label={S.studio.howTo} icon={CircleHelp} variant="ghost" onPress={onHowTo} compact /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, paddingHorizontal: 16 },
  row: { flexDirection: 'row', gap: 8 },
  flex: { flex: 1 },
});
