import { isIconId, suggestIcon } from '@/src/utils/icons';

describe('suggestIcon (AC-05)', () => {
  it.each([
    ['Polish resume', 'file-text'],
    ['Update CV', 'file-text'],
    ['Drill LeetCode', 'code'],
    ['Build the app', 'code'],
    ['Study chapter 3', 'book-open'],
    ['Mock interviews', 'users'],
    ['Apply to 10 jobs', 'send'],
    ['Book flights', 'plane'],
    ['Packing list', 'luggage'],
    ['Save $500', 'piggy-bank'],
    ['Gym 3x', 'dumbbell'],
    ['Something else entirely', 'flag'],
    ['', 'flag'],
  ])('%s → %s', (title, icon) => {
    expect(suggestIcon(title)).toBe(icon);
  });

  it('does not match partial words (apply ≠ app)', () => {
    expect(suggestIcon('Apply now')).toBe('send');
  });

  it('isIconId guards', () => {
    expect(isIconId('flag')).toBe(true);
    expect(isIconId('nope')).toBe(false);
    expect(isIconId(3)).toBe(false);
  });
});
