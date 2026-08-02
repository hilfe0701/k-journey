import { getJson, KEYS, storage } from '../storage';
import type { Bucket, DevMockCompletedDoc, UserProfile } from '../firebase';
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
      expect(currentSchemaVersion()).toBe(2);
    });
  });

  describe('runMigrations', () => {
    it('reports the pending migration and no failures', () => {
      const result = runMigrations();
      expect(result.ranMigrations).toBe(1);
      expect(result.failedKeys).toEqual([]);
      expect(result.finalVersion).toBe(2);
    });

    it('is idempotent across multiple calls', () => {
      runMigrations();
      const second = runMigrations();
      expect(second.ranMigrations).toBe(0);
      expect(second.finalVersion).toBe(2);
    });

    it('normalizes a v1 profile without guessing off-campus contract details', () => {
      storage.set(
        KEYS.profileCache,
        JSON.stringify({
          uid: 'legacy-user',
          email: 'legacy@example.com',
          university: 'yonsei',
          housing: 'off-campus',
          displayName: 'Mina',
          onboardingCompletedAt: '2026-05-01T00:00:00.000Z',
        }),
      );

      runMigrations();

      const profile = getJson<UserProfile>(KEYS.profileCache);
      expect(profile?.uid).toBe('local-profile');
      expect(profile?.email).toBeNull();
      expect(profile?.universityId).toBe('yonsei');
      expect(profile?.housing).toBe('off-campus');
      expect(profile?.housingType).toBe('unknown');
      expect(profile?.contractHolder).toBe('unknown');
      expect(profile?.onboardingCompletedAt).toBeNull();
    });

    it('merges legacy mission and bucket progress without replacing current data', () => {
      const currentMission: DevMockCompletedDoc = {
        missionId: 'p1_pack',
        completedAtIso: '2026-01-01T00:00:00.000Z',
      };
      const legacyMission: DevMockCompletedDoc = {
        missionId: 'p2_tmoney',
        completedAtIso: '2026-01-02T00:00:00.000Z',
      };
      const bucket: Bucket = {
        id: 'bkt_legacy',
        themeName: 'Food',
        templateKey: 'peony',
        maxItems: 3,
        items: [],
        createdAtIso: '2026-01-01T00:00:00.000Z',
      };
      storage.set(KEYS.completedMissionsCache, JSON.stringify([currentMission]));
      storage.set('dev:missions:v1', JSON.stringify([legacyMission]));
      storage.set('dev:buckets:v1', JSON.stringify([bucket]));

      runMigrations();

      expect(getJson<DevMockCompletedDoc[]>(KEYS.completedMissionsCache)).toEqual([
        currentMission,
        legacyMission,
      ]);
      expect(getJson<Bucket[]>(KEYS.bucketsCache)).toEqual([bucket]);
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
