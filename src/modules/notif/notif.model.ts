import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotifDocument = Notif & Document;

@Schema({ timestamps: true })
export class Notif extends Document {
  @ApiProperty({
    example: '6530f9a5c2bd9f7c8c1e1b99',
    description: 'Identifier of the user who owns this notification',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({
    example: 'Ticket updated',
    description: 'Short title for the notification',
  })
  @Prop({ required: true, trim: true })
  title: string;

  @ApiProperty({
    example: 'Your support ticket status has changed to in progress.',
    description: 'Detailed notification text for the user',
  })
  @Prop({ required: true })
  message: string;

  @ApiProperty({
    example: false,
    description: 'Indicates whether the user has read the notification',
  })
  @Prop({ type: Boolean, default: false, index: true })
  isRead: boolean;

  @ApiProperty({
    example: '2026-02-23T08:15:00.000Z',
    description: 'Timestamp when the notification was marked as read',
    required: false,
    nullable: true,
  })
  @Prop({ type: Date, default: null })
  readAt?: Date | null;

  @ApiProperty({
    example: { ticketId: '6530f9a5c2bd9f7c8c1e1b23', status: 'in_progress' },
    description: 'Optional metadata payload associated with notification',
    required: false,
  })
  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const NotifSchema = SchemaFactory.createForClass(Notif);
NotifSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
