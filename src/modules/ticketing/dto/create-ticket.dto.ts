import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TicketStatus } from '../enums/ticket-status.enum';

const RESPONSE_AUTHORS = ['operator', 'user'] as const;
type ResponseAuthor = (typeof RESPONSE_AUTHORS)[number];

export class TicketResponseDto {
  @ApiProperty({
    example: 'We are currently investigating the issue.',
    description: 'Message content supplied as a response on the ticket',
  })
  @IsString()
  message: string;

  @ApiProperty({
    example: 'operator',
    enum: RESPONSE_AUTHORS,
    description: 'Indicates whether the operator or the user sent the response',
  })
  @IsIn(RESPONSE_AUTHORS)
  createdBy: ResponseAuthor;

  @ApiProperty({
    example: '6530f9a5c2bd9f7c8c1e1b99',
    description: 'Identifier of the operator who posted the response',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsMongoId()
  operatorId?: string | null;
}

export class CreateTicketDto {
  @ApiProperty({
    example: 'Unable to access account',
    description: 'Short summary describing the support request',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: '6530f9a5c2bd9f7c8c1e1b23',
    description: 'Identifier of the user who created the ticket',
  })
  @IsMongoId()
  userId: string;

  @ApiProperty({
    example: 'I receive an error when trying to login to my dashboard.',
    description: 'Detailed description of the issue the user is facing',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: TicketStatus,
    example: TicketStatus.OPEN,
    default: TicketStatus.OPEN,
    required: false,
    description: 'Lifecycle status of the support ticket',
  })
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @ApiProperty({
    example: '6530f9a5c2bd9f7c8c1e1b99',
    description: 'Identifier of the operator currently handling the ticket',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsMongoId()
  assignedTo?: string | null;

  @ApiProperty({
    example: ['6530f9a5c2bd9f7c8c1e1c45'],
    description: 'List of answer identifiers attached to this ticket',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  answers?: string[];

  @ApiProperty({
    type: () => [TicketResponseDto],
    description: 'Chronological list of responses exchanged on the ticket',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TicketResponseDto)
  responses?: TicketResponseDto[];
}
