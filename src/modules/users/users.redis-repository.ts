import { Inject, Injectable } from '@nestjs/common';
import { BaseRedisRepository } from '../common/redis/redis.repository';
import { User } from './users.model';
import { IORedisKey } from '../common/redis/redis.module';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersRedisRepository extends BaseRedisRepository<User> {
  protected readonly channelPrefix = 'user';

  constructor(
    @Inject(IORedisKey) redisClient: Redis,
    configService: ConfigService,
  ) {
    super('users', redisClient, configService);
  }
}
