import { ApiProperty } from '@nestjs/swagger';
import {
  IsObject,
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionDto } from './question.dto';
import { QuestionnaireStatus } from '../questionnaire.model';

export class CreateQuestionnaireDto {
  @ApiProperty({
    example: 'Customer Satisfaction',
    description: 'Questionnaire title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Survey about product satisfaction',
    description: 'Questionnaire description',
  })
  @IsString()
  description: string;

  @ApiProperty({ type: [QuestionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  elements: QuestionDto[];

  @ApiProperty({ enum: QuestionnaireStatus, required: false })
  @IsEnum(QuestionnaireStatus)
  @IsOptional()
  status?: QuestionnaireStatus;

  @ApiProperty({
    example: '2025-10-18T09:00:00.000Z',
    description: 'Start time when the questionnaire becomes active',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    example: '2025-12-31T23:59:59.999Z',
    description: 'End time when the questionnaire becomes inactive',
  })
  @IsDateString()
  endTime: string;

  @ApiProperty({
    example: true,
    description: 'Manual switch to enable or disable the questionnaire',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  enabled: boolean = true;
}
