import { useEffect, useState } from 'react';
import { useMMKVBoolean, useMMKVString } from 'react-native-mmkv';
import { onSnapshot, orderBy, query } from '@react-native-firebase/firestore';
import { useAuth } from './useAuth';
import { completedMissionsCollection, DevMockCompletedDoc } from '../lib/firebase';
import { setJson, getJson, storage, KEYS } from '../lib/storage';

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
  const { user } = useAuth();
  const [devMock] = useMMKVBoolean(KEYS.devMockAuth, storage);
  const [devMockJson] = useMMKVString(KEYS.devMockMissions, storage);

  const cached = getJson<{ missionId: string; completedAtIso: string | null }[]>(
    KEYS.completedMissionsCache,
  );
  const initial: CompletedMission[] =
    cached?.map((c) => ({
      missionId: c.missionId,
      completedAt: c.completedAtIso ? new Date(c.completedAtIso) : null,
    })) ?? [];

  const [state, setState] = useState<CompletedState>({
    loading: true,
    completed: initial,
    set: new Set(initial.map((c) => c.missionId)),
  });

  useEffect(() => {
    if (__DEV__ && devMock) {
      const raw: DevMockCompletedDoc[] = devMockJson ? JSON.parse(devMockJson) : [];
      const list: CompletedMission[] = raw.map((d) => ({
        missionId: d.missionId,
        completedAt: new Date(d.completedAtIso),
      }));
      setState({
        loading: false,
        completed: list,
        set: new Set(list.map((m) => m.missionId)),
      });
      return;
    }

    if (!user) {
      setState({ loading: false, completed: [], set: new Set() });
      return;
    }

    const unsub = onSnapshot(
      query(completedMissionsCollection(user.uid), orderBy('completedAt', 'desc')),
        (snapshot) => {
          const list: CompletedMission[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              missionId: data.missionId as string,
              completedAt:
                data.completedAt && typeof data.completedAt.toDate === 'function'
                  ? data.completedAt.toDate()
                  : null,
            };
          });
          setJson(
            KEYS.completedMissionsCache,
            list.map((m) => ({
              missionId: m.missionId,
              completedAtIso: m.completedAt?.toISOString() ?? null,
            })),
          );
          setState({
            loading: false,
            completed: list,
            set: new Set(list.map((m) => m.missionId)),
          });
        },
        (err) => {
          console.warn('completedMissions snapshot error', err);
          setState((prev) => ({ ...prev, loading: false }));
        },
    );

    return unsub;
  }, [user, devMock, devMockJson]);

  return state;
}
