import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuestionDocument = Question & Document;

@Schema({ _id: false })
export class QuestionOption {
  @ApiProperty({ example: 'opt_1', description: 'Option id' })
  @Prop()
  id: string;

  @ApiProperty({ example: 'Option text', description: 'Option label' })
  @Prop()
  text: string;

  @ApiPropertyOptional({ example: 'A', description: 'Option value' })
  @Prop()
  value?: string;

  @ApiPropertyOptional({ example: 10, description: 'Option score' })
  @Prop()
  score?: number;

  @ApiPropertyOptional({
    example: 'https://cdn/app/image.png',
    description: 'Media URL',
  })
  @Prop()
  media?: string; // URL
}

export const QuestionOptionSchema =
  SchemaFactory.createForClass(QuestionOption);

@Schema({ timestamps: true })
export class Question extends Document {
  @ApiProperty({ example: 'q_1', description: 'Question id' })
  @Prop({ required: true, type: String })
  id: string;

  @ApiProperty({
    example: 'single_choice',
    description:
      "Question type: 'text', 'single_choice', 'multiple_choice', 'matrix', 'rate', 'slider', 'file', 'date', 'location'",
  })
  @Prop({ required: true })
  type: string;

  @ApiProperty({ example: 'What is your age?', description: 'Question title' })
  @Prop({ required: true })
  title: string;

  @ApiPropertyOptional({
    example: 'Select one option',
    description: 'Question description',
  })
  @Prop()
  description?: string;

  @ApiProperty({
    example: false,
    description: 'Whether this question is required',
  })
  @Prop({ default: false })
  required: boolean;

  @ApiPropertyOptional({
    type: [QuestionOption],
    description: 'Choices or columns',
  })
  @Prop({ type: [QuestionOptionSchema] })
  options?: QuestionOption[]; // Choices or Columns

  @ApiPropertyOptional({
    type: [QuestionOption],
    description: 'Rows for matrix',
  })
  @Prop({ type: [QuestionOptionSchema] })
  rows?: QuestionOption[]; // For Matrix

  @ApiPropertyOptional({ description: 'Conditional logic config' })
  @Prop({ type: Object })
  logic?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Validation rules' })
  @Prop({ type: Object })
  validation?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Additional settings' })
  @Prop({ type: Object })
  settings?: Record<string, unknown>; // Extra settings
}
export const QuestionSchema = SchemaFactory.createForClass(Question);
