import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Type,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseController } from '../common/generic/base.controller';
import { UserService } from './users.service';
import { User, UserDocument } from './users.model';
import { CreateUserDto, UpdateUserDto } from './dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesEnum } from '../auth/enums/roles.enum';
import { GetJwt } from '../auth/decorators/jwt.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Types } from 'mongoose';

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

  @Get(':id')
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: 'Get a User by id (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiQuery({ name: 'projection', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Return the User.',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async findOne(
    @Param('id') id: string,
    @Query('projection') projection?: string | string[],
  ): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException(`User ${id} not found`);
    }

    const user = await this.userService.findOne({ _id: id }, projection);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }
}
