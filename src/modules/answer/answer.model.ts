import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AnswerDocument = Answer & Document;

@Schema({ timestamps: true })
export class Answer extends Document {
  @ApiProperty({
    example: '6530f9a5c2bd9f7c8c1e1b23',
    description: 'Related questionnaire id',
  })
  @Prop({ type: Types.ObjectId, ref: 'Questionnaire', required: true })
  questionnaireId: Types.ObjectId;

  @ApiProperty({
    example: '6530f9a5c2bd9f7c8c1e1b99',
    description: 'Related user id',
  })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @ApiProperty({
    example: { q1: 'Yes', q2: 'No' },
    description: 'Object containing the answers to the questionnaire',
  })
  @Prop({ type: Object, default: {} })
  answers: Record<string, any>;
}

export const AnswerSchema = SchemaFactory.createForClass(Answer);
