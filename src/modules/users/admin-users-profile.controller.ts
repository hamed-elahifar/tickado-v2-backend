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
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesEnum } from '../auth/enums/roles.enum';
import { CreateSystemProfileDto, UpdateSystemProfileDto } from './dto';
import { UsersProfileService } from './users-profile.service';

@ApiTags('admin-users-profile')
@Roles(RolesEnum.ADMIN)
@Controller('admin/users')
export class AdminUsersProfileController {
  constructor(private readonly usersProfileService: UsersProfileService) {}

  @Post(':id/system-profile')
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
  @ApiOperation({ summary: 'Get system profile of a user (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Return user system profile.' })
  findOneSystem(@Param('id') id: string): Promise<Record<string, any>> {
    return this.usersProfileService.findOneSystem(id);
  }

  @Patch(':id/system-profile')
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
