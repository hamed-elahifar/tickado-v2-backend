import { BaseRepository } from '../common/generic/base.repository';
import { User as Entity, UserDocument as EntityDocument } from './users.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserRepository extends BaseRepository<EntityDocument> {
  constructor(@InjectModel(Entity.name) model: Model<EntityDocument>) {
    super(model);
  }
}
