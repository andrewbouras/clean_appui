import { MCQCache } from '../cache';

describe('MCQCache', () => {
  let cache: MCQCache;

  beforeEach(() => {
    cache = MCQCache.getInstance();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should cache and retrieve data', () => {
    const testData = { test: 'data' };
    const key = cache.generateCacheKey({ type: 'test' });

    cache.set(key, testData);
    expect(cache.get(key)).toEqual(testData);
  });

  it('should expire cached data', () => {
    const testData = { test: 'data' };
    const key = cache.generateCacheKey({ type: 'test' });
    const ttl = 1000; // 1 second

    cache.set(key, testData, ttl);
    expect(cache.get(key)).toEqual(testData);

    // Advance time past TTL
    jest.advanceTimersByTime(ttl + 100);
    expect(cache.get(key)).toBeNull();
  });

  it('should generate consistent cache keys', () => {
    const params1 = { a: 1, b: 2 };
    const params2 = { b: 2, a: 1 };

    const key1 = cache.generateCacheKey(params1);
    const key2 = cache.generateCacheKey(params2);

    // Different order should produce same key
    expect(key1).toBe(key2);
  });
}); 