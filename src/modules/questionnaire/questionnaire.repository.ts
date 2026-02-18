import { BaseRepository } from '../common/generic/base.repository';
import {
  Questionnaire as Entity,
  QuestionnaireDocument as EntityDocument,
} from './questionnaire.model';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QuestionnaireRepository extends BaseRepository<EntityDocument> {
  constructor(@InjectModel(Entity.name) model: Model<EntityDocument>) {
    super(model);
  }
}
