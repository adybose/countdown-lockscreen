let counter = 0;

/**
 * Creates a short unique id: `<prefix>_<time36>_<counter36>`.
 * `timeMs` is passed in (utils never read the clock); uniqueness comes from the counter.
 */
export function createId(prefix: string, timeMs: number): string {
  counter = (counter + 1) % 1_679_616; // 36^4
  return `${prefix}_${Math.floor(timeMs).toString(36)}_${counter.toString(36)}`;
}
