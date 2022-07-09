import { createClient, RedisClientType } from 'redis';

class Redis {
  public client: RedisClientType;

  public expirationDefault: number;

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      this.client = createClient({
        url: 'redis://redis:6379',
        password: process.env.REDIS_PASSWORD,
      });
    } else {
      this.client = createClient({
        url: 'redis://redis:6379',
      });
    }

    this.expirationDefault = 86400000;
  }

  async init() {
    await this.client.connect();
  }

  async kill() {
    await this.client.quit();
  }
}

export const RedisClient = new Redis();
