import { Controller, Get, Type } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseController } from '../common/generic/base.controller';
import { UserService } from './users.service';
import { User, UserDocument } from './users.model';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesEnum } from '../auth/enums/roles.enum';
import { GetJwt } from '../auth/decorators/jwt.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

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

  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Return authenticated user from database.',
    type: User,
  })
  me(@GetJwt() jwt: JwtPayload): Promise<UserDocument> {
    return this.userService.me(jwt.userID) as Promise<UserDocument>;
  }

  @Roles(RolesEnum.ADMIN)
  findOne(
    id: string,
    projection?: string | string[],
  ): Promise<UserDocument | null> {
    return this.userService.findOne({ _id: id }, projection);
  }
}
