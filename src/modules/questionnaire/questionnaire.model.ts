import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
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
  isActive: boolean; // Computed or legacy? Keep for compatibility or replace with status?
  // I'll keep it as legacy or mapped to status=ACTIVE. For now keep prop if needed, or remove.
  // Code might rely on it. I'll keep it but optional/deprecated?

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
  // Using status field if available, otherwise legacy check
  if (this.status) {
    return this.status === QuestionnaireStatus.ACTIVE;
  }
  return this.enabled && now >= this.startTime && now <= this.endTime;
});
