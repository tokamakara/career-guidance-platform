// Simple in-memory cache implementation
// For production, consider using Redis or a more robust solution

class Cache {
  constructor(defaultTTL = 3600000) { // Default 1 hour
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  // Set a value in cache
  set(key, value, ttl = this.defaultTTL) {
    const expiresAt = Date.now() + ttl;
    this.cache.set(key, {
      value,
      expiresAt
    });
  }

  // Get a value from cache
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  // Check if key exists and is not expired
  has(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      return false;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  // Delete a key from cache
  delete(key) {
    return this.cache.delete(key);
  }

  // Clear all cache
  clear() {
    this.cache.clear();
  }

  // Get cache size
  size() {
    return this.cache.size;
  }

  // Clean expired entries
  clean() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
const cache = new Cache();

// Auto-clean expired entries every 5 minutes
setInterval(() => {
  cache.clean();
}, 5 * 60 * 1000);

module.exports = cache;

