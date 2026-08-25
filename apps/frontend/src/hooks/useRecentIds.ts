import { useCallback, useState } from "react";

/**
 * Remembers the ids a player picked most recently, newest first.
 *
 * Kept in localStorage rather than on the server: it is a per-device
 * convenience, not user data worth a table and an endpoint. Every access is
 * guarded because storage throws in private windows and when site data is
 * blocked.
 */
export function useRecentIds(storageKey: string, limit = 5) {
  const [recentIds, setRecentIds] = useState<number[]>(() => read(storageKey, limit));

  const remember = useCallback(
    (ids: number[]) => {
      setRecentIds((previous) => {
        const merged = dedupe([...ids, ...previous]).slice(0, limit);
        write(storageKey, merged);
        return merged;
      });
    },
    [storageKey, limit]
  );

  return { recentIds, remember };
}

function dedupe(ids: number[]): number[] {
  return [...new Set(ids)];
}

function read(storageKey: string, limit: number): number[] {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === "number").slice(0, limit);
  } catch {
    return [];
  }
}

function write(storageKey: string, ids: number[]): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(ids));
  } catch {
    // Storage unavailable - the ordering is a convenience, so carry on without it.
  }
}
