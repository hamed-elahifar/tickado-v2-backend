import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserService } from './users.service';
import { User, UserDocument } from './users.model';
import { GetJwt } from '../auth/decorators/jwt.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Return authenticated user from database.',
    type: User,
  })
  me(@GetJwt() jwt: JwtPayload): Promise<UserDocument> {
    return this.userService.me(jwt.userID);
  }
}
