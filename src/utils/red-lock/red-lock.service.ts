import { Injectable } from '@nestjs/common';
import Client from 'ioredis';
import Redlock, { Lock } from 'redlock';

import { config } from '../../config/app.config';
const { host, port } = config.redis;
@Injectable()
export class RedLockService {
  private redlock: Redlock;

  constructor() {
    const redisClient = new Client({
      host,
      port: +port,
    });
    this.redlock = new Redlock([redisClient]);
  }

  async lock(resource: string, ttl: number): Promise<Lock> {
    return await this.redlock.acquire([resource], ttl);
  }

  async unlock(lock: Lock): Promise<any> {
    return await lock.release();
  }

  async using<T>(key: string[], ttl: number, fn: any): Promise<T> {
    return await this.redlock.using<T>(key, ttl, fn);
  }
}
