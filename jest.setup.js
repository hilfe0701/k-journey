// Mock react-native-mmkv with an in-memory store. The real module needs the
// JSI runtime which isn't available under Jest.
jest.mock('react-native-mmkv', () => {
  class MMKV {
    constructor() {
      this.store = new Map();
    }
    set(key, value) {
      this.store.set(key, value);
    }
    getString(key) {
      const v = this.store.get(key);
      return typeof v === 'string' ? v : undefined;
    }
    getNumber(key) {
      const v = this.store.get(key);
      return typeof v === 'number' ? v : undefined;
    }
    getBoolean(key) {
      const v = this.store.get(key);
      return typeof v === 'boolean' ? v : undefined;
    }
    delete(key) {
      this.store.delete(key);
    }
    contains(key) {
      return this.store.has(key);
    }
    clearAll() {
      this.store.clear();
    }
    addOnValueChangedListener() {
      return { remove: () => {} };
    }
  }
  return {
    MMKV,
    useMMKVString: () => [undefined, () => {}],
    useMMKVNumber: () => [undefined, () => {}],
    useMMKVBoolean: () => [undefined, () => {}],
  };
});

// RNFB native modules have no JSI runtime under Jest. errorAlert.ts and
// notifications.ts import these for best-effort Crashlytics + auth-state reads;
// both swallow failures, so a no-op mock is sufficient.
jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: jest.fn(() => ({})),
  recordError: jest.fn(),
}));

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({ currentUser: null })),
}));
