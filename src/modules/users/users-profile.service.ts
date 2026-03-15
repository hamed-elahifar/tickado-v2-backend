import { ConflictException, Injectable } from '@nestjs/common';
import { UserService } from './users.service';
import {
  CreateProfileDto,
  UpdateProfileDto,
  CreateSystemProfileDto,
  UpdateSystemProfileDto,
} from './dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersProfileService {
  constructor(private readonly userService: UserService) {}

  async create(
    userId: string,
    dto: CreateProfileDto,
  ): Promise<Record<string, any>> {
    const user = await this.userService.findOneSafe({ _id: userId }, [
      'profile',
    ]);
    const existingProfile = user.profile || {};

    if (Object.keys(existingProfile).length > 0) {
      throw new ConflictException('Profile already exists for this user');
    }

    const updatedUser = await this.userService.update(userId, {
      profile: dto.profile || {},
    } as UpdateUserDto);

    return updatedUser.profile || {};
  }

  async findOne(userId: string): Promise<Record<string, any>> {
    const user = await this.userService.findOneSafe({ _id: userId }, [
      'profile',
    ]);
    return user.profile || {};
  }

  async update(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<Record<string, any>> {
    const user = await this.userService.findOneSafe({ _id: userId }, [
      'profile',
    ]);
    const currentProfile = user.profile || {};
    const patchProfile = dto.profile || {};

    const mergedProfile = {
      ...currentProfile,
      ...patchProfile,
    };

    const updatedUser = await this.userService.update(userId, {
      profile: mergedProfile,
    } as UpdateUserDto);

    return updatedUser.profile || {};
  }

  async remove(userId: string): Promise<Record<string, any>> {
    await this.userService.findOneSafe({ _id: userId }, ['profile']);

    const updatedUser = await this.userService.update(userId, {
      profile: {},
    } as UpdateUserDto);

    return updatedUser.profile || {};
  }

  async createSystem(
    userId: string,
    dto: CreateSystemProfileDto,
  ): Promise<Record<string, any>> {
    const user = await this.userService.findOneSafe({ _id: userId }, [
      'systemProfile',
    ]);
    const existingProfile = user.systemProfile || {};

    if (Object.keys(existingProfile).length > 0) {
      throw new ConflictException(
        'System profile already exists for this user',
      );
    }

    const updatedUser = await this.userService.update(userId, {
      systemProfile: dto.systemProfile || {},
    } as UpdateUserDto);

    return updatedUser.systemProfile || {};
  }

  async findOneSystem(userId: string): Promise<Record<string, any>> {
    const user = await this.userService.findOneSafe({ _id: userId }, [
      'systemProfile',
    ]);
    return user.systemProfile || {};
  }

  async updateSystem(
    userId: string,
    dto: UpdateSystemProfileDto,
  ): Promise<Record<string, any>> {
    const user = await this.userService.findOneSafe({ _id: userId }, [
      'systemProfile',
    ]);
    const currentProfile = user.systemProfile || {};
    const patchProfile = dto.systemProfile || {};

    const mergedProfile = {
      ...currentProfile,
      ...patchProfile,
    };

    const updatedUser = await this.userService.update(userId, {
      systemProfile: mergedProfile,
    } as UpdateUserDto);

    return updatedUser.systemProfile || {};
  }

  async removeSystem(userId: string): Promise<Record<string, any>> {
    await this.userService.findOneSafe({ _id: userId }, ['systemProfile']);

    const updatedUser = await this.userService.update(userId, {
      systemProfile: {},
    } as UpdateUserDto);

    return updatedUser.systemProfile || {};
  }
}
