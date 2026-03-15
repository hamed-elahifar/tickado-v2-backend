import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersProfileService } from './users-profile.service';
import { CreateProfileDto, UpdateProfileDto } from './dto';
import { GetJwt } from '../auth/decorators/jwt.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('users-profile')
@Controller('users')
export class UsersProfileController {
  constructor(private readonly usersProfileService: UsersProfileService) {}

  @Post('me/profile')
  @ApiOperation({ summary: 'Create profile for authenticated user' })
  @ApiResponse({
    status: 201,
    description: 'Profile has been created successfully.',
  })
  create(
    @GetJwt() jwt: JwtPayload,
    @Body() createProfileDto: CreateProfileDto,
  ): Promise<Record<string, any>> {
    return this.usersProfileService.create(jwt.userID, createProfileDto);
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Get profile of authenticated user' })
  @ApiResponse({ status: 200, description: 'Return user profile.' })
  findOne(@GetJwt() jwt: JwtPayload): Promise<Record<string, any>> {
    return this.usersProfileService.findOne(jwt.userID);
  }

  @Patch('me/profile')
  @ApiOperation({ summary: 'Update profile of authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Profile has been updated successfully.',
  })
  update(
    @GetJwt() jwt: JwtPayload,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Record<string, any>> {
    return this.usersProfileService.update(jwt.userID, updateProfileDto);
  }

  @Delete('me/profile')
  @ApiOperation({ summary: 'Delete profile of authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Profile has been deleted successfully.',
  })
  remove(@GetJwt() jwt: JwtPayload): Promise<Record<string, any>> {
    return this.usersProfileService.remove(jwt.userID);
  }
}
