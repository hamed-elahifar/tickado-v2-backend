import {
  DynamicModule,
  FactoryProvider,
  Global,
  ModuleMetadata,
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
      providers: [redisProvider],
      exports: [redisProvider],
    };
  }
}
