import {
  createBucket,
  EMPTY_TASK_PROGRESS,
  markMissionComplete,
  saveTaskProgress,
  updateUserProfile,
} from '../firebase';
import { storage } from '../storage';

describe('verified local writes', () => {
  beforeEach(() => {
    storage.clearAll();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('rejects a task write that cannot be read back', () => {
    jest.spyOn(storage, 'getString').mockReturnValue('{"corrupt":true}');
    expect(() => saveTaskProgress(EMPTY_TASK_PROGRESS)).toThrow('Local task progress was not saved.');
  });

  it('rejects a profile write that cannot be read back', async () => {
    const original = storage.getString.bind(storage);
    let reads = 0;
    jest.spyOn(storage, 'getString').mockImplementation((key) => {
      reads += 1;
      return reads === 1 ? original(key) : '{"corrupt":true}';
    });
    await expect(updateUserProfile({ residenceDistrict: 'Mapo-gu' })).rejects.toThrow(
      'Local profile was not saved.',
    );
  });

  it('rejects a mission write that cannot be read back', async () => {
    const original = storage.getString.bind(storage);
    let reads = 0;
    jest.spyOn(storage, 'getString').mockImplementation((key) => {
      reads += 1;
      return reads === 1 ? original(key) : '[]';
    });
    await expect(markMissionComplete('p1_pack')).rejects.toThrow('Mission progress was not saved.');
  });

  it('rejects a Want-to write that cannot be read back', async () => {
    const original = storage.getString.bind(storage);
    let reads = 0;
    jest.spyOn(storage, 'getString').mockImplementation((key) => {
      reads += 1;
      return reads === 1 ? original(key) : '[]';
    });
    await expect(
      createBucket({
        themeName: 'Failure check',
        templateKey: 'tiger',
        maxItems: 6,
        initialItems: ['Try one thing'],
      }),
    ).rejects.toThrow('Want-to progress was not saved.');
  });
});
