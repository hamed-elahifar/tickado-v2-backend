import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/generic/base.service';
import { AnswerDocument } from './answer.model';
import { CreateAnswerDto, UpdateAnswerDto } from './dto';
import { AnswerRepository } from './answer.repository';

@Injectable()
export class AnswerService extends BaseService<
  AnswerDocument,
  CreateAnswerDto,
  UpdateAnswerDto
> {
  constructor(repository: AnswerRepository) {
    super(repository, 'Answer');
  }
}
