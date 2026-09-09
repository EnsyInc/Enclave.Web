import { vi } from 'vitest';

import { isLocalStorageAvailable, readLocalStorage, writeLocalStorage } from './local-storage';

function createStorageMock(initial: Record<string, string> = {}): Storage {
  const store = new Map(Object.entries(initial));
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => void store.delete(key),
    setItem: (key: string, value: string) => void store.set(key, value),
  };
}

/** Storage that exists but rejects every operation -- private browsing, blocked cookies, quota. */
function createThrowingStorageMock(): Storage {
  const reject = () => {
    throw new DOMException('The operation is insecure.', 'SecurityError');
  };
  return {
    get length(): number {
      return reject();
    },
    clear: reject,
    getItem: reject,
    key: reject,
    removeItem: reject,
    setItem: reject,
  };
}

describe('local-storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('when storage works', () => {
    it('reports itself as available', () => {
      vi.stubGlobal('localStorage', createStorageMock());

      expect(isLocalStorageAvailable()).toBe(true);
    });

    it('reads a stored value', () => {
      vi.stubGlobal('localStorage', createStorageMock({ 'a-key': 'a-value' }));

      expect(readLocalStorage('a-key')).toBe('a-value');
    });

    it('returns null for a key that was never set', () => {
      vi.stubGlobal('localStorage', createStorageMock());

      expect(readLocalStorage('missing')).toBeNull();
    });

    it('writes a value that can be read back', () => {
      const storage = createStorageMock();
      vi.stubGlobal('localStorage', storage);

      writeLocalStorage('a-key', 'a-value');

      expect(storage.getItem('a-key')).toBe('a-value');
    });
  });

  describe('when storage is absent (SSR, or Node shadowing jsdom)', () => {
    beforeEach(() => {
      vi.stubGlobal('localStorage', undefined);
    });

    it('reports itself as unavailable', () => {
      expect(isLocalStorageAvailable()).toBe(false);
    });

    it('reads as null rather than throwing', () => {
      expect(() => readLocalStorage('a-key')).not.toThrow();
      expect(readLocalStorage('a-key')).toBeNull();
    });

    it('swallows the write rather than throwing', () => {
      expect(() => writeLocalStorage('a-key', 'a-value')).not.toThrow();
    });
  });

  // The case the previous inline `typeof localStorage === 'undefined'` guards missed: storage
  // is present, so the typeof check passes, but every access throws.
  describe('when storage exists but throws on access', () => {
    beforeEach(() => {
      vi.stubGlobal('localStorage', createThrowingStorageMock());
    });

    it('reads as null rather than throwing', () => {
      expect(() => readLocalStorage('a-key')).not.toThrow();
      expect(readLocalStorage('a-key')).toBeNull();
    });

    it('swallows the write rather than throwing', () => {
      expect(() => writeLocalStorage('a-key', 'a-value')).not.toThrow();
    });
  });
});
