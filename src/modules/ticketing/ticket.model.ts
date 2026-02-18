import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TicketStatus } from './enums/ticket-status.enum';

export type TicketDocument = Ticket & Document;

class TicketResponse {
  @ApiProperty({
    example: 'We are currently investigating the issue.',
    description: 'Message content supplied as a response on the ticket',
  })
  message: string;

  @ApiProperty({
    example: 'operator',
    enum: ['operator', 'user'],
    description: 'Indicates whether the operator or the user sent the response',
  })
  createdBy: 'operator' | 'user';

  @ApiProperty({
    example: '2025-10-27T14:32:11.000Z',
    description: 'Timestamp indicating when the response was added',
  })
  createdAt: Date;

  @ApiProperty({
    example: '6530f9a5c2bd9f7c8c1e1b99',
    description: 'Identifier of the operator who posted the response',
    required: false,
    nullable: true,
    type: String,
  })
  operatorId?: Types.ObjectId | null;
}

@Schema({ timestamps: true })
export class Ticket extends Document {
  @ApiProperty({
    example: 'Unable to access account',
    description: 'Short summary describing the support request',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    example: 'I receive an error when trying to login to my dashboard.',
    description: 'Detailed information about the issue the user is facing',
  })
  @Prop({ default: '' })
  description: string;

  @ApiProperty({
    example: TicketStatus.OPEN,
    enum: TicketStatus,
    default: TicketStatus.OPEN,
    description: 'Current lifecycle status of the support ticket',
  })
  @Prop({
    type: String,
    enum: TicketStatus,
    default: TicketStatus.OPEN,
  })
  status: TicketStatus;

  @ApiProperty({
    example: '6530f9a5c2bd9f7c8c1e1b23',
    description: 'Identifier of the user who created the ticket',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty({
    example: '6530f9a5c2bd9f7c8c1e1b99',
    description: 'Identifier of the operator currently assigned to the ticket',
    required: false,
  })
  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTo: Types.ObjectId | null;

  @ApiProperty({
    example: ['6530f9a5c2bd9f7c8c1e1c45'],
    description: 'List of answer identifiers attached to this ticket',
    type: [String],
  })
  @Prop({
    type: [{ type: Types.ObjectId, ref: 'Answer' }],
    default: [],
  })
  answers: Types.ObjectId[];

  @ApiProperty({
    type: () => [TicketResponse],
    description: 'Chronological list of responses exchanged on the ticket',
  })
  @Prop({
    type: [
      {
        _id: false,
        message: { type: String, required: true },
        createdBy: {
          type: String,
          enum: ['operator', 'user'],
          default: 'operator',
        },
        createdAt: { type: Date, default: Date.now },
        operatorId: { type: Types.ObjectId, ref: 'User', default: null },
      },
    ],
    default: [],
  })
  responses: Array<{
    message: string;
    createdBy: 'operator' | 'user';
    createdAt: Date;
    operatorId?: Types.ObjectId | null;
  }>;
}

export const TicketSchema = SchemaFactory.createForClass(Ticket);
