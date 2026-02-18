import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users.model';
import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { UsersRedisRepository } from './users.redis-repository';
import { redisModule } from '../common/redis/redis-module.config';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UserService, UserRepository, UsersRedisRepository],
  exports: [UserService, UserRepository, MongooseModule],
})
export class UsersModule {}
