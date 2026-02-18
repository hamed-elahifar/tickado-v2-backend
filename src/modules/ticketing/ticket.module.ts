import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Ticket, TicketSchema } from './ticket.model';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';
import { TicketRepository } from './ticket.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Ticket.name,
        schema: TicketSchema,
      },
    ]),
  ],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository],
  exports: [TicketService, TicketRepository, MongooseModule],
})
export class TicketModule {}
