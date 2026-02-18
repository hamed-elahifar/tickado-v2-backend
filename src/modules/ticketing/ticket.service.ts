import { Injectable } from '@nestjs/common';
import { BaseService } from '../common/generic/base.service';
import { TicketDocument } from './ticket.model';
import { CreateTicketDto, UpdateTicketDto } from './dto';
import { TicketRepository } from './ticket.repository';

@Injectable()
export class TicketService extends BaseService<
  TicketDocument,
  CreateTicketDto,
  UpdateTicketDto
> {
  constructor(repository: TicketRepository) {
    super(repository, 'Ticket');
  }
}
