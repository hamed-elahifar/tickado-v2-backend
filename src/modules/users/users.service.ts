import { Injectable } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from './dto';
import { UserDocument } from './users.model';
import { UserRepository } from './users.repository';
import { BaseService } from '../common/generic/base.service';
import { UsersRedisRepository } from './users.redis-repository';

@Injectable()
export class UserService extends BaseService<
  UserDocument,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(
    repository: UserRepository,
    private readonly redisRepository: UsersRedisRepository,
  ) {
    super(repository, 'User');
  }

  async me(userID: string): Promise<UserDocument> {
    return this.findOneSafe({ _id: userID }, ['-__v']);
  }
}
