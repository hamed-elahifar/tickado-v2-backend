import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Questionnaire, QuestionnaireSchema } from './questionnaire.model';
import { QuestionnaireController } from './questionnaire.controller';
import { QuestionnaireService } from './questionnaire.service';
import { QuestionnaireRepository } from './questionnaire.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Questionnaire.name,
        schema: QuestionnaireSchema,
      },
    ]),
  ],
  controllers: [QuestionnaireController],
  providers: [QuestionnaireService, QuestionnaireRepository],
  exports: [QuestionnaireService, QuestionnaireRepository, MongooseModule],
})
export class QuestionnaireModule {}
