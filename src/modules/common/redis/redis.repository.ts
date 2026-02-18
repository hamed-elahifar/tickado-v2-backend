import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { IORedisKey } from './redis.module';
import { Observable, Subject } from 'rxjs';

@Injectable()
export abstract class BaseRedisRepository<T extends object> {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly ttl: number;
  protected abstract readonly channelPrefix: string;
  protected readonly messageSubject = new Subject<any>();
  private readonly subscribers: Map<string, Redis> = new Map();

  constructor(
    protected readonly prefix: string,
    @Inject(IORedisKey) protected readonly redisClient: Redis,
    protected readonly configService: ConfigService,
    protected readonly defaultTTL: number = 3 * 60 * 60, // 3 hour default
  ) {
    this.ttl = this.configService.get('REDIS_TTL') || defaultTTL;
  }

  protected getKey(id: string): string {
    return `${this.prefix}:${id}`;
  }

  async set(id: string, data: Partial<T>, customTTL?: number): Promise<void> {
    const key = this.getKey(id);
    try {
      await this.redisClient
        .multi([
          ['set', key, JSON.stringify(data)],
          ['expire', key, customTTL || this.ttl],
        ])
        .exec();
      this.logger.debug(`Set ${key} with TTL ${customTTL || this.ttl}`);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      this.logger.error(`Failed to set ${key}: ${errorMessage}`);
      throw e;
    }
  }

  async get(id: string): Promise<Partial<T> | null> {
    const key = this.getKey(id);
    try {
      const data = await this.redisClient.get(key);
      if (!data) return null;
      return JSON.parse(data) as Partial<T>;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      this.logger.error(`Failed to get ${key}: ${errorMessage}`);
      throw e;
    }
  }

  async delete(id: string): Promise<boolean> {
    const key = this.getKey(id);
    try {
      const result = await this.redisClient.del(key);
      return result === 1;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      this.logger.error(`Failed to delete ${key}: ${errorMessage}`);
      throw e;
    }
  }

  async exists(id: string): Promise<boolean> {
    const key = this.getKey(id);
    try {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      this.logger.error(`Failed to check exists ${key}: ${errorMessage}`);
      throw e;
    }
  }

  async setHash(
    id: string,
    field: string,
    value: Partial<T>[keyof T],
  ): Promise<void> {
    const key = this.getKey(id);
    try {
      await this.redisClient
        .multi([
          ['hset', key, field, JSON.stringify(value)],
          ['expire', key, this.ttl],
        ])
        .exec();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      this.logger.error(`Failed to set hash ${key}: ${errorMessage}`);
      throw e;
    }
  }

  async getHash(
    id: string,
    field: string,
  ): Promise<Partial<T>[keyof T] | null> {
    const key = this.getKey(id);
    try {
      const value = await this.redisClient.hget(key, field);
      if (!value) return null;
      return JSON.parse(value) as Partial<T>[keyof T];
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      this.logger.error(`Failed to get hash ${key}: ${errorMessage}`);
      throw e;
    }
  }

  async getAllHash(
    id: string,
  ): Promise<Partial<Record<keyof T, Partial<T>[keyof T]>> | null> {
    const key = this.getKey(id);
    try {
      const data = await this.redisClient.hgetall(key);
      if (!data || Object.keys(data).length === 0) return null;

      return Object.entries(data).reduce(
        (acc, [field, value]) => {
          acc[field as keyof T] = JSON.parse(value) as Partial<T>[keyof T];
          return acc;
        },
        {} as Partial<Record<keyof T, Partial<T>[keyof T]>>,
      );
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      this.logger.error(`Failed to get all hash ${key}: ${errorMessage}`);
      throw e;
    }
  }

  async publish(channel: string, message: any): Promise<void> {
    const fullChannel = `${this.channelPrefix}:${channel}`;
    await this.redisClient.publish(fullChannel, JSON.stringify(message));
  }

  subscribe(channel: string): Observable<any> {
    const fullChannel = `${this.channelPrefix}:${channel}`;

    // Create a new subscriber for this channel
    const subscriber = this.redisClient.duplicate();
    this.subscribers.set(fullChannel, subscriber);

    subscriber.subscribe(fullChannel).catch((err) => {
      console.error(`Error subscribing to channel ${fullChannel}:`, err);
    });

    // Handle incoming messages
    subscriber.on('message', (chan, message) => {
      if (chan === fullChannel) {
        try {
          const parsedMessage: unknown = JSON.parse(message);
          this.messageSubject.next(parsedMessage as T);
        } catch (error) {
          console.error(`Error parsing message from ${fullChannel}:`, error);
        }
      }
    });

    return this.messageSubject.asObservable();
  }

  async unsubscribe(channel: string): Promise<void> {
    const fullChannel = `${this.channelPrefix}:${channel}`;
    const subscriber = this.subscribers.get(fullChannel);

    if (subscriber) {
      await subscriber.unsubscribe(fullChannel);
      await subscriber.quit();
      this.subscribers.delete(fullChannel);
    }
  }

  async publishAndSubscribe(
    channel: string,
    message: any,
  ): Promise<Observable<any>> {
    await this.publish(channel, message);
    return this.subscribe(channel);
  }

  async onDestroy(): Promise<void> {
    // Unsubscribe from all channels
    for (const [channel, subscriber] of this.subscribers.entries()) {
      await subscriber.unsubscribe(channel);
      await subscriber.quit();
    }
    this.subscribers.clear();
    this.messageSubject.complete();
  }
}
