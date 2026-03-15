import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersProfileController } from './admin-users-profile.controller';
import { UsersProfileController } from './users-profile.controller';
import { UsersProfileService } from './users-profile.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './users.model';
import { UsersRedisRepository } from './users.redis-repository';
import { UserRepository } from './users.repository';
import { UserService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [
    UsersController,
    UsersProfileController,
    AdminUsersController,
    AdminUsersProfileController,
  ],
  providers: [
    UserService,
    UserRepository,
    UsersRedisRepository,
    UsersProfileService,
  ],
  exports: [UserService, UserRepository, MongooseModule],
})
export class UsersModule {}
