import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateNotifDto {
  @ApiProperty({
    example: '6530f9a5c2bd9f7c8c1e1b99',
    description: 'Identifier of the user who should receive this notification',
  })
  @IsMongoId()
  userId: string;

  @ApiProperty({
    example: 'Ticket updated',
    description: 'Short title of the notification',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Your support ticket status has changed to in progress.',
    description: 'Detailed notification message shown to the user',
  })
  @IsString()
  message: string;

  @ApiProperty({
    example: { ticketId: '6530f9a5c2bd9f7c8c1e1b23', status: 'in_progress' },
    description: 'Optional metadata payload associated with the notification',
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
