import sample from '../../docs/samples/overdue-plan.json';
import { getCountdownStatus } from '@/src/utils/dates';
import { importPlan } from '@/src/utils/planFile';

describe('docs/samples/overdue-plan.json', () => {
  it('imports cleanly and is overdue', () => {
    const res = importPlan(sample, new Date(2026, 10, 24));
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(getCountdownStatus(new Date(2026, 10, 24), res.plan.countdown)).toBe('overdue');
  });
});
