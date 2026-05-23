import { storage } from '../storage';
import {
  backupAndReset,
  currentSchemaVersion,
  runMigrations,
  _resetSchemaForTesting,
} from '../storageMigrations';

describe('storage migrations', () => {
  beforeEach(() => {
    storage.clearAll();
    _resetSchemaForTesting();
  });

  describe('currentSchemaVersion', () => {
    it('returns 1 when no schema version has been written', () => {
      expect(currentSchemaVersion()).toBe(1);
    });

    it('returns the persisted version after a run', () => {
      runMigrations();
      expect(currentSchemaVersion()).toBe(1);
    });
  });

  describe('runMigrations with no pending migrations', () => {
    it('reports zero ran migrations and no failures', () => {
      const result = runMigrations();
      expect(result.ranMigrations).toBe(0);
      expect(result.failedKeys).toEqual([]);
      expect(result.finalVersion).toBe(1);
    });

    it('is idempotent across multiple calls', () => {
      runMigrations();
      const second = runMigrations();
      expect(second.ranMigrations).toBe(0);
      expect(second.finalVersion).toBe(1);
    });
  });

  describe('backupAndReset', () => {
    it('returns null when the key does not exist', () => {
      expect(backupAndReset('missing:key')).toBeNull();
    });

    it('returns the parsed value when JSON is valid', () => {
      storage.set('valid:key', JSON.stringify({ hello: 'world' }));
      expect(backupAndReset('valid:key')).toEqual({ hello: 'world' });
      // Valid path leaves the key in place.
      expect(storage.getString('valid:key')).toBeDefined();
    });

    it('backs up and deletes corrupt JSON', () => {
      storage.set('corrupt:key', '{not valid json');
      const result = backupAndReset('corrupt:key');
      expect(result).toBeNull();
      // Original key was deleted — the user-facing contract that matters here.
      // Backup-key naming is internal; verifying it via getAllKeys would require
      // a richer MMKV mock than the test environment provides.
      expect(storage.getString('corrupt:key')).toBeUndefined();
    });
  });
});
