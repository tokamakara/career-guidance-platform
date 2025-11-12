const cache = require('../utils/cache');

describe('Cache Utility', () => {
  beforeEach(() => {
    cache.clear();
  });

  describe('set and get', () => {
    it('should set and get a value', () => {
      cache.set('test-key', 'test-value');
      const value = cache.get('test-key');
      expect(value).toBe('test-value');
    });

    it('should return null for non-existent key', () => {
      const value = cache.get('non-existent');
      expect(value).toBeNull();
    });

    it('should return null for expired key', (done) => {
      cache.set('expired-key', 'value', 100); // 100ms TTL
      setTimeout(() => {
        const value = cache.get('expired-key');
        expect(value).toBeNull();
        done();
      }, 150);
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('test-key', 'test-value');
      expect(cache.has('test-key')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('non-existent')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should delete a key', () => {
      cache.set('test-key', 'test-value');
      cache.delete('test-key');
      expect(cache.get('test-key')).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all cache', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should return correct cache size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });
  });
});

