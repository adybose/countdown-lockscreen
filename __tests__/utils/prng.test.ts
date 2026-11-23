import { hashString, mulberry32, randBetween } from '@/src/utils/prng';

describe('prng', () => {
  it('hashString is deterministic and spreads', () => {
    expect(hashString('abc')).toBe(hashString('abc'));
    expect(hashString('abc')).not.toBe(hashString('abd'));
    expect(hashString('')).toBe(0x811c9dc5);
  });

  it('mulberry32 is deterministic per seed and in [0,1)', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const seqA = Array.from({ length: 100 }, a);
    const seqB = Array.from({ length: 100 }, b);
    expect(seqA).toEqual(seqB);
    for (const x of seqA) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
    expect(Array.from({ length: 5 }, mulberry32(43))).not.toEqual(seqA.slice(0, 5));
  });

  it('randBetween stays in range', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 50; i++) {
      const v = randBetween(r, 2, 5);
      expect(v).toBeGreaterThanOrEqual(2);
      expect(v).toBeLessThan(5);
    }
  });
});
