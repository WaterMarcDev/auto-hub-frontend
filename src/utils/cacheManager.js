/**
 * AutoHub Client-Side Reactive Cache Manager
 * 
 * Implements Stale-While-Revalidate (SWR) caching with real-time
 * WebSocket push invalidation.
 */

class ClientCacheManager {
  constructor() {
    this.cache = new Map();
    this.subscribers = new Map(); // scope -> Set of callbacks
    this.socket = null;
  }

  /**
   * Connect socket for real-time push invalidations
   */
  initSocket(socketInstance) {
    if (!socketInstance || this.socket === socketInstance) return;
    this.socket = socketInstance;

    this.socket.on("cache:invalidate", (payload) => {
      const scope = payload?.scope;
      if (scope) {
        this.invalidate(scope);
      }
    });

    this.socket.on("badge:update", () => {
      this.invalidate("badge");
    });

    this.socket.on("new_email", () => {
      this.invalidate("badge");
      this.invalidate("emails");
    });
  }

  /**
   * Get cached data if valid
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Store data in client cache
   */
  set(key, data, ttlSeconds = 60) {
    this.cache.set(key, {
      data,
      expiresAt: ttlSeconds > 0 ? Date.now() + ttlSeconds * 1000 : null,
      timestamp: Date.now(),
    });
    return data;
  }

  /**
   * Invalidate all keys matching a scope and notify active listeners
   */
  invalidate(scope) {
    if (!scope) return;
    const normScope = scope.toLowerCase();

    // Delete matching keys
    for (const key of this.cache.keys()) {
      const normKey = key.toLowerCase();
      if (normKey.includes(normScope) || normScope.includes(normKey.split(":")[0])) {
        this.cache.delete(key);
      }
    }

    // Notify subscribed components to re-validate
    for (const [subScope, callbacks] of this.subscribers.entries()) {
      const normSub = subScope.toLowerCase();
      if (
        normSub === normScope ||
        normSub.includes(normScope) ||
        normScope.includes(normSub)
      ) {
        for (const cb of callbacks) {
          try {
            cb();
          } catch (e) {
            console.error("Cache subscriber error:", e);
          }
        }
      }
    }
  }

  /**
   * Subscribe a component callback to real-time invalidations for a scope
   */
  subscribe(scope, callback) {
    if (!this.subscribers.has(scope)) {
      this.subscribers.set(scope, new Set());
    }
    this.subscribers.get(scope).add(callback);

    // Return unsubscribe function
    return () => {
      const set = this.subscribers.get(scope);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.subscribers.delete(scope);
        }
      }
    };
  }

  /**
   * Clear entire client cache
   */
  clear() {
    this.cache.clear();
  }
}

export const cacheManager = new ClientCacheManager();
export default cacheManager;
