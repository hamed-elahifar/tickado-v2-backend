import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseService } from '../common/generic/base.service';
import { NotifDocument } from './notif.model';
import { CreateNotifDto, GetMyNotifsQueryDto, UpdateNotifDto } from './dto';
import { NotifRepository } from './notif.repository';

@Injectable()
export class NotifService extends BaseService<
  NotifDocument,
  CreateNotifDto,
  UpdateNotifDto
> {
  constructor(private readonly notifRepository: NotifRepository) {
    super(notifRepository, 'Notification');
  }

  async getMyNotifications(
    userId: string,
    query: GetMyNotifsQueryDto,
    projection?: string | string[],
  ): Promise<NotifDocument[]> {
    const normalizedProjection = this.parseProjection(projection);
    const { limit = 10, offset = 0, isRead } = query || {};

    return this.notifRepository.findByUserId(userId, {
      isRead,
      limit,
      offset,
      projection: normalizedProjection,
    });
  }

  async markAsRead(id: string, userId: string): Promise<NotifDocument> {
    const notif = await this.notifRepository.markReadState(id, userId, true);

    if (!notif) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    return notif;
  }

  async markAsUnread(id: string, userId: string): Promise<NotifDocument> {
    const notif = await this.notifRepository.markReadState(id, userId, false);

    if (!notif) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    return notif;
  }

  async markAllAsRead(userId: string): Promise<{ modifiedCount: number }> {
    const modifiedCount =
      await this.notifRepository.markAllAsReadByUser(userId);
    return { modifiedCount };
  }

  async getUnreadCount(userId: string): Promise<{ unreadCount: number }> {
    const unreadCount = await this.notifRepository.countUnreadByUser(userId);
    return { unreadCount };
  }

  private parseProjection(
    projection?: string[] | string,
  ): string[] | undefined {
    if (!projection) {
      return undefined;
    }

    const fields = Array.isArray(projection)
      ? projection
      : projection.split(',');

    const normalized = fields
      .map((field) => field.trim())
      .filter((field) => field.length > 0);

    return normalized.length > 0 ? normalized : undefined;
  }
}
