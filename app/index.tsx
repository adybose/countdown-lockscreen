import { Redirect } from 'expo-router';
import { useAppStore } from '@/src/store';

export default function Index() {
  const hasCountdown = useAppStore((s) => s.countdown !== null);
  return <Redirect href={hasCountdown ? '/home' : '/onboarding/goal'} />;
}
