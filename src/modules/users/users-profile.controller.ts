import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersProfileService } from './users-profile.service';
import {
  CreateProfileDto,
  UpdateProfileDto,
  CreateSystemProfileDto,
  UpdateSystemProfileDto,
} from './dto';
import { GetJwt } from '../auth/decorators/jwt.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesEnum } from '../auth/enums/roles.enum';

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

  // System Profile endpoints (Admin Only)

  @Post(':id/system-profile')
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: 'Create system profile for a user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 201,
    description: 'System profile has been created successfully.',
  })
  createSystem(
    @Param('id') id: string,
    @Body() createSystemProfileDto: CreateSystemProfileDto,
  ): Promise<Record<string, any>> {
    return this.usersProfileService.createSystem(id, createSystemProfileDto);
  }

  @Get(':id/system-profile')
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: 'Get system profile of a user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Return user system profile.' })
  findOneSystem(@Param('id') id: string): Promise<Record<string, any>> {
    return this.usersProfileService.findOneSystem(id);
  }

  @Patch(':id/system-profile')
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: 'Update system profile of a user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'System profile has been updated successfully.',
  })
  updateSystem(
    @Param('id') id: string,
    @Body() updateSystemProfileDto: UpdateSystemProfileDto,
  ): Promise<Record<string, any>> {
    return this.usersProfileService.updateSystem(id, updateSystemProfileDto);
  }

  @Delete(':id/system-profile')
  @Roles(RolesEnum.ADMIN)
  @ApiOperation({ summary: 'Delete system profile of a user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'System profile has been deleted successfully.',
  })
  removeSystem(@Param('id') id: string): Promise<Record<string, any>> {
    return this.usersProfileService.removeSystem(id);
  }
}
