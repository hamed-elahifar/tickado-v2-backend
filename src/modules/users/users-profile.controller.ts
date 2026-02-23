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
import { CreateProfileDto, UpdateProfileDto } from './dto';

@ApiTags('users-profile')
@Controller('users')
export class UsersProfileController {
  constructor(private readonly usersProfileService: UsersProfileService) {}

  @Post(':id/profile')
  @ApiOperation({ summary: 'Create profile for a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 201,
    description: 'Profile has been created successfully.',
  })
  create(
    @Param('id') id: string,
    @Body() createProfileDto: CreateProfileDto,
  ): Promise<Record<string, any>> {
    return this.usersProfileService.create(id, createProfileDto);
  }

  @Get(':id/profile')
  @ApiOperation({ summary: 'Get profile of a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Return user profile.' })
  findOne(@Param('id') id: string): Promise<Record<string, any>> {
    return this.usersProfileService.findOne(id);
  }

  @Patch(':id/profile')
  @ApiOperation({ summary: 'Update profile of a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Profile has been updated successfully.',
  })
  update(
    @Param('id') id: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Record<string, any>> {
    return this.usersProfileService.update(id, updateProfileDto);
  }

  @Delete(':id/profile')
  @ApiOperation({ summary: 'Delete profile of a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Profile has been deleted successfully.',
  })
  remove(@Param('id') id: string): Promise<Record<string, any>> {
    return this.usersProfileService.remove(id);
  }
}
