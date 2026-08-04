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
// notifications.ts import Crashlytics for best-effort error reporting; it
// swallows failures, so a no-op mock is sufficient.
jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: jest.fn(() => ({})),
  recordError: jest.fn(),
}));

// The @react-native-firebase/auth mock was removed with the package itself
// (DEC-001: no sign-in). It outlived the dependency because node_modules still
// held the package until a later install pruned it.
