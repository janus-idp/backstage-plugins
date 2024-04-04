import { GroupCache } from './role-cache';

const usersToBeCached = [
  'user:default/a',
  'user:default/b',
  'user:default/c',
  'user:default/d',
  'user:default/e',
];

const pause = (ms: number | undefined) =>
  new Promise(res => setTimeout(res, ms));

describe('GroupCache', () => {
  let groupCache: GroupCache;

  beforeEach(() => {
    const maxSize = 5;
    const maxAge = 1000; // one second
    groupCache = new GroupCache(maxSize, maxAge);
    groupCache.put('user:default/todd', [
      'user:default/todd',
      'group:default/qe',
    ]);
  });

  describe('initialize', () => {
    it('should initialize even when no parameters are given', () => {
      const cache = new GroupCache();

      expect(cache).not.toBeNull();
    });
  });

  describe('get', () => {
    it('should return the cached user by key', () => {
      const cachedGroups = groupCache.get('user:default/todd');

      expect(cachedGroups).toEqual(['user:default/todd', 'group:default/qe']);
    });
  });

  describe('put', () => {
    it('should add the cached user by key', () => {
      groupCache.put('user:default/adam', [
        'user:default/adam',
        'group:default/qe',
      ]);

      const cachedGroups = groupCache.get('user:default/adam');
      expect(cachedGroups).toEqual(['user:default/adam', 'group:default/qe']);
    });

    it('should remove the cached user if they were the last to be added', () => {
      for (const user of usersToBeCached) {
        groupCache.put(user, [user, 'group:default/qe']);
      }

      const removedCachedUser = groupCache.get('user:default/todd');

      expect(removedCachedUser).toEqual(undefined);
    });
  });

  describe('shouldUpdate', () => {
    it('should not need updating if the cache has not expired', () => {
      const isExpired = groupCache.shouldUpdate('user:default/todd');

      expect(isExpired).toEqual(false);
    });

    it('should need updating if the cache is expired', async () => {
      await pause(1001);
      const isExpired = groupCache.shouldUpdate('user:default/todd');

      expect(isExpired).toEqual(true);
    });

    it('should not need updating if the cache does not exist', () => {
      const isExpired = groupCache.shouldUpdate('user:default/test-user');

      expect(isExpired).toEqual(false);
    });
  });

  describe('isEnabled', () => {
    it('should be enabled', () => {
      const isEnabled = groupCache.isEnabled();

      expect(isEnabled).toEqual(true);
    });
  });
});
