import { BaseRepository } from '../common/generic/base.repository';
import {
  Answer as Entity,
  AnswerDocument as EntityDocument,
} from './answer.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AnswerRepository extends BaseRepository<EntityDocument> {
  constructor(@InjectModel(Entity.name) model: Model<EntityDocument>) {
    super(model);
  }
}
