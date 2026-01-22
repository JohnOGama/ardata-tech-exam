import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    return (await this.cacheManager.get(key)) as T;
  }

  async set(key: string, value: any, ttl?: number) {
    this.logger.log(`Cached successfully: ${key}`);
    await this.cacheManager.set(key, value, ttl);
  }
}
