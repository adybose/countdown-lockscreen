import { render } from '@testing-library/react-native';
import ThemeStep from '@/app/onboarding/theme';
import { initialState, useAppStore } from '@/src/store';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn() }) }));

describe('onboarding theme step (AC-08)', () => {
  it('renders 4 live <Wallpaper> previews built from the draft, one per theme', async () => {
    useAppStore.setState({ ...initialState() });
    const s = useAppStore.getState();
    s.startDraft('create');
    s.updateDraft({ title: 'Pass Bio Exam', deadlineDate: '2030-01-01' });
    const r = await render(<ThemeStep />);
    expect(r.getAllByText(/Pass Bio Exam/, { includeHiddenElements: true })).toHaveLength(4);
    for (const name of ['Glass Terminal', 'Pixel Quest', 'Sticker Planner', 'Field Journal']) {
      expect(r.getByLabelText(new RegExp(`^${name} theme`))).toBeTruthy();
    }
    expect(r.getAllByText('>_', { includeHiddenElements: true })).toHaveLength(1); // Glass Terminal's title prefix appears once
  });
});
