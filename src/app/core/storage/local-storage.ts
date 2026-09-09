/**
 * SSR/test-safe `localStorage` access.
 *
 * `localStorage` is unavailable during server-side rendering, and unreliable in this Vitest +
 * jsdom setup (Node's own experimental `globalThis.localStorage` can shadow jsdom's -- see
 * CLAUDE.md, "Testing gotchas"). It can also exist but throw on access: private browsing,
 * blocked cookies, or an exceeded quota on write. Every helper here degrades quietly instead,
 * so callers never need their own guard.
 */

function getLocalStorage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/**
 * Whether `localStorage` can be used at all.
 *
 * Exposed separately from {@link readLocalStorage} because "storage is unavailable" and "the
 * key isn't set" are not always the same decision: `ThemeService` falls through to
 * `matchMedia` on a missing key, but must skip it entirely when there's no storage, since
 * `matchMedia` is unreliable in the same environments.
 */
export function isLocalStorageAvailable(): boolean {
  return getLocalStorage() !== null;
}

/** Reads a key, returning `null` when it's unset or storage is unavailable. */
export function readLocalStorage(key: string): string | null {
  try {
    return getLocalStorage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** Writes a key, doing nothing when storage is unavailable or the write is rejected. */
export function writeLocalStorage(key: string, value: string): void {
  try {
    getLocalStorage()?.setItem(key, value);
  } catch {
    // Persistence is a convenience here -- a failed write must never break the UI.
  }
}
