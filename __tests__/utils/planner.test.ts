import { addLocalDays, isLocalDate } from '@/src/utils/dates';
import { autoPlanBackward, milestoneCountFor, phaseTitlesFor, PHASE_TITLES } from '@/src/utils/planner';
import { formatTMinusLabel } from '@/src/utils/dates';

const TODAY = '2027-01-01';
const NOW = new Date(2027, 0, 1, 9, 0);

describe('milestoneCountFor (AC-06)', () => {
  it.each([
    [0, 3], [1, 3], [13, 3], [14, 4], [27, 4], [28, 5], [41, 5], [42, 6], [365, 6],
  ])('D=%i → %i', (d, n) => {
    expect(milestoneCountFor(d)).toBe(n);
  });
});

describe('phaseTitlesFor', () => {
  it('returns all 6 for n=6 and spreads fewer evenly', () => {
    expect(phaseTitlesFor(6)).toEqual([...PHASE_TITLES]);
    const three = phaseTitlesFor(3);
    expect(three[0]).toBe('Research & scope');
    expect(three[2]).toBe('Final review');
    expect(phaseTitlesFor(1)).toEqual(['Final review']);
  });
});

describe('autoPlanBackward (AC-06)', () => {
  it.each([0, 1, 2, 7, 30, 120])('D=%i: dates within [today, deadline], ascending, labelled', (D) => {
    const deadlineDate = addLocalDays(TODAY, D);
    const ms = autoPlanBackward({ today: TODAY, deadlineDate, now: NOW });
    expect(ms).toHaveLength(milestoneCountFor(D));
    for (const m of ms) {
      expect(isLocalDate(m.date)).toBe(true);
      expect(m.date >= TODAY).toBe(true);
      expect(m.date <= deadlineDate).toBe(true);
      expect(m.done).toBe(false);
      expect(m.title.length).toBeGreaterThan(0);
      expect(formatTMinusLabel(m, { deadlineDate })).toMatch(/^T-\d+ · [A-Z][a-z]{2} \d{1,2}$/);
    }
    for (let i = 1; i < ms.length; i++) expect(ms[i].date >= ms[i - 1].date).toBe(true);
    expect(ms.map((m) => m.order)).toEqual([...ms.keys()]);
    expect(new Set(ms.map((m) => m.id)).size).toBe(ms.length);
  });

  it('spaces offsets with round(D·i/(n+1))', () => {
    const ms = autoPlanBackward({ today: TODAY, deadlineDate: addLocalDays(TODAY, 30), now: NOW });
    // n = 5 → offsets 5,10,15,20,25 before the deadline → T-25 … T-5
    expect(ms.map((m) => formatTMinusLabel(m, { deadlineDate: addLocalDays(TODAY, 30) }).split(' ')[0])).toEqual([
      'T-25', 'T-20', 'T-15', 'T-10', 'T-5',
    ]);
  });

  it('assigns suggested icons', () => {
    const ms = autoPlanBackward({ today: TODAY, deadlineDate: addLocalDays(TODAY, 60), now: NOW });
    expect(ms[0].title).toBe('Research & scope');
    expect(ms[0].icon).toBe('book-open');
  });

  it('handles a past deadline by clamping D to 0', () => {
    const ms = autoPlanBackward({ today: TODAY, deadlineDate: '2026-12-25', now: NOW });
    expect(ms).toHaveLength(3);
    expect(ms.every((m) => m.date === '2026-12-25')).toBe(true);
  });
});
