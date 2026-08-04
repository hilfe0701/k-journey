import { useMMKVString } from 'react-native-mmkv';
import { DevMockCompletedDoc } from '../lib/firebase';
import { getJson, KEYS, storage } from '../lib/storage';

export interface CompletedMission {
  missionId: string;
  completedAt: Date | null;
}

export interface CompletedState {
  loading: boolean;
  completed: CompletedMission[];
  set: Set<string>;
}

export function useCompletedMissions(): CompletedState {
  const [completedJson] = useMMKVString(KEYS.completedMissionsCache, storage);
  const raw = completedJson
    ? parseCompleted(completedJson)
    : getJson<DevMockCompletedDoc[]>(KEYS.completedMissionsCache) ?? [];
  const completed = raw.map((item) => ({
    missionId: item.missionId,
    completedAt: item.completedAtIso ? new Date(item.completedAtIso) : null,
  }));

  return {
    loading: false,
    completed,
    set: new Set(completed.map((item) => item.missionId)),
  };
}

function parseCompleted(raw: string): DevMockCompletedDoc[] {
  try {
    return JSON.parse(raw) as DevMockCompletedDoc[];
  } catch {
    return [];
  }
}
