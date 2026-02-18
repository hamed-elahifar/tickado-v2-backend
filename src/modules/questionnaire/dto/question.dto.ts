import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuestionOptionDto {
  @IsString()
  id: string;

  @IsString()
  text: string;

  @IsString()
  @IsOptional()
  value?: string;

  @IsNumber()
  @IsOptional()
  score?: number;

  @IsString()
  @IsOptional()
  media?: string;
}

export class QuestionDto {
  @IsString()
  id: string;

  @IsString()
  type: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options?: QuestionOptionDto[]; // Choices or Columns

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  rows?: QuestionOptionDto[]; // Matrix Rows

  @IsOptional()
  logic?: any;

  @IsOptional()
  validation?: any;

  @IsOptional()
  settings?: any;
}
