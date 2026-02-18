import { Controller, Type } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseController } from '../common/generic/base.controller';
import { Ticket, TicketDocument } from './ticket.model';
import { CreateTicketDto, UpdateTicketDto } from './dto';
import { TicketService } from './ticket.service';

@ApiTags('tickets')
@Controller('tickets')
export class TicketController extends BaseController<
  TicketDocument,
  Type<CreateTicketDto>,
  Type<UpdateTicketDto>
>(Ticket, CreateTicketDto, UpdateTicketDto, 'Ticket') {
  constructor(private readonly ticketService: TicketService) {
    super(ticketService);
  }
}
