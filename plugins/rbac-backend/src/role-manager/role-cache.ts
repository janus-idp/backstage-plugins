export class RoleCache {
  private cache: Map<string, { data: Set<string>; timestamp: number }> =
    new Map();
  private maxEntries: number;
  private maxAge: number;
  constructor(maxEntries?: number, maxAge?: number) {
    this.maxEntries = maxEntries || 100;
    this.maxAge = maxAge || 60 * 60 * 1000; // 1 hour (60 minutes * 60 seconds * 1000 milliseconds)
  }

  /**
   * get will return the cached users based on the key that is received.
   * We also will update the cached place in the map and update its timestamp.
   * This is because the implemented cache is based on Least Recently used
   * and maps hold the order that keys are placed in.
   * Updating the place in the order will ensure that we only remove the
   * least recently used items whenever we run out of space.
   * @param key The user that
   * @returns The cache if we are able to find it
   */
  public get(key: string): Set<string> | undefined {
    const hasKey = this.cache.has(key);
    if (!hasKey) return undefined;

    const { data, timestamp } = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, { data, timestamp });

    return data;
  }

  /**
   * put will add the cache using the user as the key.
   * It will set the value to the roles that the user is directly or indirectly
   * attached to as well as set the time for this cache.
   *
   * If we are running out of space, we will remove the least recently used
   * cache which will be at the end of the cache.
   * @param key The user to be cached
   * @param value The roles that are attached to the user
   */
  public put(key: string, value: Set<string>) {
    if (this.cache.size >= this.maxEntries) {
      const keyToDelete = this.cache.keys().next().value;
      this.cache.delete(keyToDelete);
    }

    const currentTime = Date.now();

    this.cache.set(key, { data: value, timestamp: currentTime });
  }

  /**
   * delete removes the cache user.
   * @param key The user to be removed
   */
  public delete(key: string) {
    this.cache.delete(key);
  }

  /**
   * shouldUpdate checks if the cached user's time in the cache has reached
   * the set max age.
   * @param key The user cache that we are checking
   * @returns True if the time has exceeded the max age
   */
  public shouldUpdate(key: string): boolean {
    const currentTime = Date.now();
    const hasKey = this.cache.has(key);
    if (!hasKey) return false;

    const { timestamp } = this.cache.get(key)!;
    if (currentTime - timestamp > this.maxAge) {
      return true;
    }

    return false;
  }

  /**
   * deleteCacheWithRole will remove cached users based on a role.
   * This is useful for when we want to remove a particular role and invalidate
   * any cache that is associated with said role.
   * @param role The role that we will be invalidating
   */
  public deleteCacheWithRole(role: string): void {
    for (const [key, value] of this.cache.entries()) {
      if (value.data.has(role)) {
        this.cache.delete(key);
      }
    }
  }
}
