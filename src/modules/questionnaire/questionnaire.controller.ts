import { Controller, Type } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../common/generic/base.controller';
import { QuestionnaireService } from './questionnaire.service';
import { Questionnaire, QuestionnaireDocument } from './questionnaire.model';
import { CreateQuestionnaireDto, UpdateQuestionnaireDto } from './dto';

@ApiTags('questionnaires')
@Controller('questionnaires')
export class QuestionnaireController extends BaseController<
  QuestionnaireDocument,
  Type<CreateQuestionnaireDto>,
  Type<UpdateQuestionnaireDto>
>(
  Questionnaire,
  CreateQuestionnaireDto,
  UpdateQuestionnaireDto,
  'Questionnaire',
) {
  constructor(private readonly questionnaireService: QuestionnaireService) {
    super(questionnaireService);
  }
}
