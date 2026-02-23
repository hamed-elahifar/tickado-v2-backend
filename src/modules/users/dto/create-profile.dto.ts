import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    example: { bio: 'Software Engineer', interests: ['coding', 'hiking'] },
    description: 'Arbitrary key-value pairs for the user profile',
    type: Object,
    additionalProperties: true,
  })
  @IsObject()
  profile: Record<string, any>;
}
