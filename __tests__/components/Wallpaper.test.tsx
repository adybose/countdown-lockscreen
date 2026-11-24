import { render } from '@testing-library/react-native';
import { Wallpaper, WallpaperPreview } from '@/src/components/wallpaper';
import { THEME_ORDER } from '@/src/themes';
import type { Countdown, Milestone } from '@/src/types/domain';
import { LANDSCAPE_SAFE, PORTRAIT_SAFE, type WallpaperRenderOptions } from '@/src/types/wallpaper';

const milestones = (n: number): Milestone[] =>
  Array.from({ length: n }, (_, i) => ({
    id: `m${i}`,
    title: `Milestone ${i}`,
    date: `2027-01-${String(18 + i).padStart(2, '0')}`,
    done: i === 0,
    completedAt: i === 0 ? '2027-01-16T10:00:00.000Z' : null,
    icon: 'flag',
    order: i,
  }));

const countdown = (n: number, completed = false): Countdown => ({
  id: 'c1', title: 'Pass Bio Exam', emoji: '📚', deadlineDate: '2027-02-01', deadlineTime: null,
  motivation: 'Future me will thank me.', startDate: '2027-01-01', themeId: 'glass-terminal',
  createdAt: '2027-01-01T00:00:00.000Z', updatedAt: '2027-01-01T00:00:00.000Z',
  completedAt: completed ? new Date(2027, 0, 16, 12).toISOString() : null,
  milestones: milestones(n),
});

const STATUSES = [
  { status: 'upcoming', now: new Date(2027, 0, 17, 9), hero: '15', completed: false },
  { status: 'today', now: new Date(2027, 1, 1, 9), hero: 'TODAY', completed: false },
  { status: 'overdue', now: new Date(2027, 1, 4, 9), hero: 'OVERDUE', completed: false },
  { status: 'completed', now: new Date(2027, 0, 17, 9), hero: 'DONE', completed: true },
] as const;

const options = (now: Date, landscape = false): WallpaperRenderOptions => ({
  now: now.toISOString(),
  showMotivation: true,
  showCompleted: true,
  showProgress: true,
  orientation: landscape ? 'landscape' : 'portrait',
  safeZone: landscape ? LANDSCAPE_SAFE : PORTRAIT_SAFE,
});

const cases = THEME_ORDER.flatMap((theme) =>
  STATUSES.flatMap((s) => [0, 3, 12].map((n) => [theme, s.status, n, s] as const)),
);

describe('<Wallpaper> smoke render (AC-08 partial)', () => {
  it.each(cases)('%s · %s · %i milestones', async (theme, _status, n, s) => {
    const r = await render(
      <Wallpaper countdown={countdown(n, s.completed)} theme={theme} size={{ width: 360, height: 800 }} options={options(s.now)} />,
    );
    expect(r.getAllByText(s.hero).length).toBeGreaterThan(0);
    expect(r.getAllByText(/Pass Bio Exam/).length).toBeGreaterThan(0);
    if (n > 0 && s.status !== 'completed') expect(r.queryAllByText(/^T-\d+/).length + r.queryAllByText(/T-\d+ ·/).length).toBeGreaterThan(0);
  });

  it.each(THEME_ORDER)('%s renders a landscape desktop canvas', async (theme) => {
    const r = await render(
      <Wallpaper countdown={countdown(3)} theme={theme} size={{ width: 1280, height: 800 }} options={options(new Date(2027, 0, 17, 9), true)} />,
    );
    expect(r.getAllByText('15').length).toBeGreaterThan(0);
  });

  it('is deterministic: same props → same tree', async () => {
    const props = { countdown: countdown(3), theme: 'pixel-quest' as const, size: { width: 360, height: 800 }, options: options(new Date(2027, 0, 17, 9)) };
    const a = await render(<Wallpaper {...props} />);
    const ja = JSON.stringify(a.toJSON());
    await a.unmount();
    const b = await render(<Wallpaper {...props} />);
    expect(JSON.stringify(b.toJSON())).toBe(ja);
  });

  it('WallpaperPreview scales into a box with an accessible summary', async () => {
    const r = await render(
      <WallpaperPreview
        countdown={countdown(3)}
        theme="sticker-planner"
        size={{ width: 360, height: 800 }}
        options={options(new Date(2027, 0, 17, 9))}
        boxWidth={90}
        accessibilityLabel="Lock screen preview"
      />,
    );
    const root = r.toJSON() as { props: { accessibilityLabel?: string; style?: unknown } } | null;
    expect(root?.props.accessibilityLabel).toBe('Lock screen preview');
  });
});
