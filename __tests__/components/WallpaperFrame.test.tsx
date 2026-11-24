import { render } from '@testing-library/react-native';
import { Wallpaper } from '@/src/components/wallpaper';
import type { Countdown } from '@/src/types/domain';
import { PORTRAIT_SAFE } from '@/src/types/wallpaper';

const c: Countdown = {
  id: 'c1', title: 'Pass Bio Exam', emoji: null, deadlineDate: '2027-02-01', deadlineTime: null, motivation: 'Go',
  startDate: '2027-01-01', themeId: 'glass-terminal', createdAt: '', updatedAt: '', completedAt: null,
  milestones: [{ id: 'm1', title: 'Read ch 1', date: '2027-01-20', done: false, completedAt: null, icon: 'book-open', order: 0 }],
};

describe('<Wallpaper> frame', () => {
  it('renders the neutral fallback with hero and finish', async () => {
    const r = await render(
      <Wallpaper
        countdown={c}
        theme="glass-terminal"
        size={{ width: 360, height: 800 }}
        options={{ now: new Date(2027, 0, 17, 9).toISOString(), showMotivation: true, showCompleted: true, showProgress: true, orientation: 'portrait', safeZone: PORTRAIT_SAFE }}
      />,
    );
    expect(r.getByText('15')).toBeTruthy();
    expect(r.getByText('DAYS TO GO')).toBeTruthy();
    expect(r.getByText('Read ch 1')).toBeTruthy();
  });
});
