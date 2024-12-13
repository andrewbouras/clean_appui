interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class MCQCache {
  private static instance: MCQCache;
  private cache: Map<string, CacheEntry<any>>;
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

  private constructor() {
    this.cache = new Map();
    this.startCleanupInterval();
  }

  static getInstance(): MCQCache {
    if (!this.instance) {
      this.instance = new MCQCache();
    }
    return this.instance;
  }

  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;

    this.cache.set(key, {
      data,
      timestamp,
      expiresAt
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now > entry.expiresAt) {
          this.cache.delete(key);
        }
      }
    }, 5 * 60 * 1000); // Clean every 5 minutes
  }

  generateCacheKey(params: object): string {
    return JSON.stringify(params);
  }
}

export const mcqCache = MCQCache.getInstance(); 