import { StyleSheet, View } from 'react-native';
import { ProgressBar } from '@/src/components/ui';
import { S } from '@/src/constants/strings';
import type { Progress } from '@/src/utils/progress';

/** Milestones done/total + time elapsed (FR-12). The milestone bar hides with no milestones. */
export function DualProgress({ progress }: { progress: Progress }) {
  return (
    <View style={styles.wrap}>
      {progress.milestoneRatio !== null ? (
        <ProgressBar label={S.home.milestonesLabel} ratio={progress.milestoneRatio} detail={`${progress.done}/${progress.total}`} />
      ) : null}
      <ProgressBar label={S.home.timeLabel} ratio={progress.timeRatio} />
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { gap: 10 } });
