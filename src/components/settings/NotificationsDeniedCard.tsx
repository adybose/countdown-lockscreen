import { BellOff } from 'lucide-react-native';
import { Linking } from 'react-native';
import { Banner, Button } from '@/src/components/ui';
import { S } from '@/src/constants/strings';

/** DESIGN §10.3: shown when notifications are denied. The toggles stay on so a later grant just works. */
export function NotificationsDeniedCard() {
  return (
    <Banner tone="warning" icon={BellOff} title={S.notifications.deniedTitle} message={S.notifications.deniedBody}>
      <Button label={S.common.openSettings} variant="secondary" compact onPress={() => Linking.openSettings()} />
    </Banner>
  );
}
