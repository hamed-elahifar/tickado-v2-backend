import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/generic/base.service';
import { QuestionnaireDocument } from './questionnaire.model';
import { CreateQuestionnaireDto, UpdateQuestionnaireDto } from './dto';
import { QuestionnaireRepository } from './questionnaire.repository';

@Injectable()
export class QuestionnaireService extends BaseService<
  QuestionnaireDocument,
  CreateQuestionnaireDto,
  UpdateQuestionnaireDto
> {
  constructor(repository: QuestionnaireRepository) {
    super(repository, 'Questionnaire');
  }
}
