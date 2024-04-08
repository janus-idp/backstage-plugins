import { RoleCache } from './role-cache';

const usersToBeCached = [
  'user:default/a',
  'user:default/b',
  'user:default/c',
  'user:default/d',
  'user:default/e',
];

const pause = (ms: number | undefined) =>
  new Promise(res => setTimeout(res, ms));

describe('RoleCache', () => {
  let roleCache: RoleCache;

  beforeEach(() => {
    const maxSize = 5;
    const maxAge = 1000; // one second
    roleCache = new RoleCache(maxSize, maxAge);
    const roles = new Set(['role:default/test', 'role:default/qe']);
    roleCache.put('user:default/todd', roles);
  });

  describe('initialize', () => {
    it('should initialize even when no parameters are given', () => {
      const cache = new RoleCache();

      expect(cache).not.toBeNull();
    });
  });

  describe('get', () => {
    it('should return the cached user by key', () => {
      const cachedGroups = roleCache.get('user:default/todd');

      expect(cachedGroups).toEqual(
        new Set(['role:default/test', 'role:default/qe']),
      );
    });
  });

  describe('put', () => {
    it('should add the cached user by key', () => {
      const roles = new Set(['role:default/admin', 'role:default/qe']);
      roleCache.put('user:default/adam', roles);

      const cachedGroups = roleCache.get('user:default/adam');
      expect(cachedGroups).toEqual(
        new Set(['role:default/admin', 'role:default/qe']),
      );
    });

    it('should remove the cached user if they were the last to be added', () => {
      for (const user of usersToBeCached) {
        const rolesToBeAdded = new Set([user, 'role:default/qe']);
        roleCache.put(user, rolesToBeAdded);
      }

      const removedCachedUser = roleCache.get('user:default/todd');

      expect(removedCachedUser).toEqual(undefined);
    });
  });

  describe('shouldUpdate', () => {
    it('should not need updating if the cache has not expired', () => {
      const isExpired = roleCache.shouldUpdate('user:default/todd');

      expect(isExpired).toEqual(false);
    });

    it('should need updating if the cache is expired', async () => {
      await pause(1001);
      const isExpired = roleCache.shouldUpdate('user:default/todd');

      expect(isExpired).toEqual(true);
    });

    it('should not need updating if the cache does not exist', () => {
      const isExpired = roleCache.shouldUpdate('user:default/test-user');

      expect(isExpired).toEqual(false);
    });
  });

  describe('isEnabled', () => {
    it('should be enabled', () => {
      const isEnabled = roleCache.isEnabled();

      expect(isEnabled).toEqual(true);
    });
  });
});
