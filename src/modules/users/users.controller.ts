import { Controller, Type } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../common/generic/base.controller';
import { UserService } from './users.service';
import { User, UserDocument } from './users.model';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesEnum } from '../auth/enums/roles.enum';

@ApiTags('users')
@Controller('users')
export class UsersController extends BaseController<
  UserDocument,
  Type<CreateUserDto>,
  Type<UpdateUserDto>
>(User, CreateUserDto, UpdateUserDto, 'User') {
  constructor(private readonly userService: UserService) {
    super(userService);
  }

  @Roles(RolesEnum.ADMIN)
  findOne(id: string) {
    return super.findOne(id);
  }
}
