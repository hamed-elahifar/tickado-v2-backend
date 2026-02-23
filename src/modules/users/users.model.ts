import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { randomNumber } from '../common/utils/random-number';
import { RolesEnum } from '../auth/enums/roles.enum';
import { Exclude } from 'class-transformer';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User extends Document {
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @Prop()
  name: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the user',
  })
  @Prop({ index: true, unique: true, sparse: true })
  phone: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @Prop({ index: true, unique: true, sparse: true })
  email?: string;

  @Exclude()
  @Prop()
  password?: string;

  @ApiProperty({ example: '/avatar.jpg', description: 'The avatar URL' })
  @Prop()
  avatar: string;

  @Exclude()
  @ApiHideProperty()
  @Prop({
    default: () => randomNumber(),
  })
  phoneValidation: string;

  @ApiHideProperty()
  @Prop({ type: Date })
  lastSentSMS: Date;

  @ApiHideProperty()
  @Prop({ type: String, enum: ['en', 'fa'], default: 'en' })
  locale: string;

  @ApiHideProperty()
  @Prop({ type: String, enum: RolesEnum, default: undefined })
  roles: RolesEnum;

  @Prop({ type: String, default: '' })
  lastGameID: string;

  @ApiProperty({
    example: { bio: 'Software Engineer', interests: ['coding', 'hiking'] },
    description: 'The user profile containing arbitrary key-value pairs',
  })
  @Prop({ type: Object, default: {} })
  profile: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);
// UserSchema.index({ phone: 1, name: -1 }); // 1 is ascending, -1 is descending
