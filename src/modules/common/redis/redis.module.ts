import {
  DynamicModule,
  FactoryProvider,
  Global,
  Inject,
  Injectable,
  ModuleMetadata,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Module } from '@nestjs/common';
import IORedis, { Redis, RedisOptions } from 'ioredis';

export const IORedisKey = 'IORedis';

type RedisModuleOptions = {
  connectionOptions: RedisOptions;
  onClientReady?: (client: Redis) => void;
};

type RedisAsyncModuleOptions = {
  useFactory: (
    ...args: any[]
  ) => Promise<RedisModuleOptions> | RedisModuleOptions;
} & Pick<ModuleMetadata, 'imports'> &
  Pick<FactoryProvider, 'inject'>;

@Injectable()
class RedisLifecycleService implements OnApplicationShutdown {
  constructor(@Inject(IORedisKey) private readonly redisClient: Redis) {}

  async onApplicationShutdown() {
    if (!this.redisClient || this.redisClient.status === 'end') {
      return;
    }

    try {
      await this.redisClient.quit();
    } catch {
      this.redisClient.disconnect();
    }
  }
}

@Global()
@Module({})
export class RedisModule {
  static registerAsync({
    useFactory,
    imports,
    inject,
  }: RedisAsyncModuleOptions): DynamicModule {
    const redisProvider = {
      provide: IORedisKey,
      useFactory: async (...args: unknown[]) => {
        const { connectionOptions, onClientReady } = await useFactory(...args);

        const client = new IORedis(connectionOptions);

        if (onClientReady) {
          onClientReady(client);
        }

        return client;
      },
      inject,
    };

    return {
      module: RedisModule,
      imports,
      providers: [redisProvider, RedisLifecycleService],
      exports: [redisProvider],
    };
  }
}
