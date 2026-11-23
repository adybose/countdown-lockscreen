/** Persisted-state migrations. Each step upgrades from version `n` to `n + 1`. */
export const STORE_VERSION = 1;

type Migration = (state: Record<string, unknown>) => Record<string, unknown>;

const MIGRATIONS: Record<number, Migration> = {
  // v0 → v1: v0 had no version field; the shape is compatible.
  0: (s) => s,
};

export function migrate(persisted: unknown, fromVersion: number): Record<string, unknown> {
  let state: Record<string, unknown> =
    typeof persisted === 'object' && persisted !== null ? { ...(persisted as Record<string, unknown>) } : {};
  for (let v = fromVersion; v < STORE_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (step) state = step(state);
  }
  return state;
}
