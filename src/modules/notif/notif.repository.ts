import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { BaseRepository } from '../common/generic/base.repository';
import {
  Notif as Entity,
  NotifDocument as EntityDocument,
} from './notif.model';

@Injectable()
export class NotifRepository extends BaseRepository<EntityDocument> {
  constructor(@InjectModel(Entity.name) model: Model<EntityDocument>) {
    super(model);
  }

  async findByUserId(
    userId: string,
    options: {
      isRead?: boolean;
      projection?: string[];
      limit?: number;
      offset?: number;
    },
  ): Promise<EntityDocument[]> {
    const filter: FilterQuery<EntityDocument> = { userId };

    if (typeof options.isRead === 'boolean') {
      filter.isRead = options.isRead;
    }

    const query = this.entityModel.find(filter).sort({ createdAt: -1 });

    if (options.projection) {
      query.select(options.projection);
    }

    if (options.limit) {
      query.limit(options.limit);
    }

    if (options.offset) {
      query.skip(options.offset);
    }

    const documents = await query.exec();
    return documents as EntityDocument[];
  }

  async findOneByIdAndUser(
    id: string,
    userId: string,
  ): Promise<EntityDocument | null> {
    return this.entityModel.findOne({ _id: id, userId }).exec();
  }

  async markReadState(
    id: string,
    userId: string,
    isRead: boolean,
  ): Promise<EntityDocument | null> {
    return this.entityModel
      .findOneAndUpdate(
        { _id: id, userId },
        {
          isRead,
          readAt: isRead ? new Date() : null,
        },
        { new: true },
      )
      .exec();
  }

  async markAllAsReadByUser(userId: string): Promise<number> {
    const result = await this.entityModel.updateMany(
      { userId, isRead: false },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      },
    );

    return result.modifiedCount;
  }

  async countUnreadByUser(userId: string): Promise<number> {
    return this.entityModel.countDocuments({ userId, isRead: false }).exec();
  }
}
