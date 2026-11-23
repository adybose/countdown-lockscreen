import type { PersistStorage, StorageValue } from 'zustand/middleware';

export interface StringStorage {
  getItem(name: string): Promise<string | null> | string | null;
  setItem(name: string, value: string): Promise<void> | void;
  removeItem(name: string): Promise<void> | void;
}

let lastLoadFailed = false;

/** Returns whether the last load hit corrupt data, and clears the flag. */
export function consumeLoadFailure(): boolean {
  const v = lastLoadFailed;
  lastLoadFailed = false;
  return v;
}

function isStorageValue(v: unknown): v is StorageValue<unknown> {
  return typeof v === 'object' && v !== null && 'state' in v && typeof (v as { state: unknown }).state === 'object';
}

/**
 * JSON storage that never throws on corrupt data: the bad value is discarded,
 * `lastLoadFailed` is set, and `null` is returned so the store keeps its defaults (FR-30).
 */
export function safeJSONStorage<S>(storage: StringStorage): PersistStorage<S> {
  return {
    async getItem(name) {
      let raw: string | null;
      try {
        raw = await storage.getItem(name);
      } catch {
        return null; // storage unavailable (e.g. static web render): not corruption
      }
      if (raw == null) return null;
      try {
        const parsed: unknown = JSON.parse(raw);
        if (!isStorageValue(parsed)) throw new Error('Unexpected persisted shape');
        return parsed as StorageValue<S>;
      } catch {
        lastLoadFailed = true;
        try {
          await storage.removeItem(name);
        } catch {
          // ignore
        }
        return null;
      }
    },
    async setItem(name, value) {
      try {
        await storage.setItem(name, JSON.stringify(value));
      } catch {
        // ignore write failures (storage unavailable)
      }
    },
    async removeItem(name) {
      try {
        await storage.removeItem(name);
      } catch {
        // ignore
      }
    },
  };
}
