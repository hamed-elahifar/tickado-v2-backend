import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Question, QuestionSchema } from './question.model';

export type QuestionnaireDocument = Questionnaire & Document;

export enum QuestionnaireStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

@Schema({
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Questionnaire extends Document {
  @ApiProperty({
    enum: QuestionnaireStatus,
    default: QuestionnaireStatus.DRAFT,
  })
  @Prop({
    type: String,
    enum: QuestionnaireStatus,
    default: QuestionnaireStatus.DRAFT,
  })
  status: QuestionnaireStatus;

  @ApiProperty({
    example: true,
    description:
      'Whether the questionnaire is currently active based on start and end times',
  })
  isActive: boolean;

  @ApiProperty({
    example: 'Customer Satisfaction',
    description: 'Questionnaire title',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    example: 'Survey about product satisfaction',
    description: 'Questionnaire description',
  })
  @Prop({ default: '' })
  description: string;

  @ApiProperty({ type: [Question] })
  @Prop({ type: [QuestionSchema], default: [] })
  elements: Question[];

  @ApiProperty({
    example: 'https://cdn.example.com/questionnaires/cover.jpg',
    description: 'Questionnaire cover image URL',
  })
  @Prop({ default: '' })
  imageUrl: string;

  @ApiProperty({
    example: 12,
    description: 'Number of questions in the questionnaire',
  })
  @Prop({ type: Number, default: 0 })
  questionCount: number;

  @ApiPropertyOptional({
    example: [{ name: 'General' }],
    description: 'Optional questionnaire groups definition',
  })
  @Prop({ type: [Object], default: [] })
  groups?: Record<string, any>[];

  @ApiPropertyOptional({
    example: [{ title: 'How satisfied are you?' }],
    description: 'Optional legacy questions array',
  })
  @Prop({ type: [Object], default: [] })
  questions?: Record<string, any>[];

  @ApiProperty({
    example: { type: 'coins', amount: 10 },
    description: 'Reward configuration of the questionnaire',
  })
  @Prop({ type: Object, default: {} })
  reward: Record<string, any>;

  @ApiProperty({
    example: { durationInMinutes: 20 },
    description: 'Timing configuration of the questionnaire',
  })
  @Prop({ type: Object, default: {} })
  timing: Record<string, any>;

  @ApiPropertyOptional({
    example: { title: 'Welcome' },
    description: 'Optional start page configuration',
  })
  @Prop({ type: Object, default: null })
  startPage?: Record<string, any> | null;

  @ApiPropertyOptional({
    example: { title: 'Finished' },
    description: 'Optional end page configuration',
  })
  @Prop({ type: Object, default: null })
  endPage?: Record<string, any> | null;

  @ApiPropertyOptional({
    example: [{ title: 'Thanks for your feedback' }],
    description: 'Optional thank-you pages list',
  })
  @Prop({ type: [Object], default: [] })
  thankYouPages?: Record<string, any>[];

  @ApiProperty({
    example: [{ type: 'info', text: 'This questionnaire may be updated.' }],
    description: 'List of notices displayed to participants',
  })
  @Prop({ type: [Object], default: [] })
  notices: Record<string, any>[];

  @ApiPropertyOptional({
    example: { enabled: true, message: 'Survey closed early' },
    description: 'Optional early termination configuration',
  })
  @Prop({ type: Object, default: null })
  earlyTermination?: Record<string, any> | null;

  @ApiProperty({
    example: '2025-10-18T09:00:00.000Z',
    description: 'Start time when the questionnaire becomes active',
  })
  @Prop({ type: Date })
  startTime: Date;

  @ApiProperty({
    example: '2025-12-31T23:59:59.999Z',
    description: 'End time when the questionnaire becomes inactive',
  })
  @Prop({ type: Date })
  endTime: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId: Types.ObjectId;

  @ApiProperty({
    example: true,
    description: 'Manual switch to enable or disable the questionnaire',
  })
  @Prop({ type: Boolean, default: true })
  enabled: boolean;
}

export const QuestionnaireSchema = SchemaFactory.createForClass(Questionnaire);

QuestionnaireSchema.virtual('isActive').get(function () {
  const now = new Date();
  if (this.status) {
    return this.status === QuestionnaireStatus.ACTIVE;
  }
  return this.enabled && now >= this.startTime && now <= this.endTime;
});
