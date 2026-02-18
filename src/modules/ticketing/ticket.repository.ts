import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../common/generic/base.repository';
import { Ticket, TicketDocument } from './ticket.model';

@Injectable()
export class TicketRepository extends BaseRepository<TicketDocument> {
  constructor(@InjectModel(Ticket.name) model: Model<TicketDocument>) {
    super(model);
  }
}
