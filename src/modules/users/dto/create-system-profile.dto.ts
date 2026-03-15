import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class CreateSystemProfileDto {
  @ApiProperty({
    example: { priority: 'high', notes: 'internal user' },
    description: 'Arbitrary key-value pairs for the user system profile',
    type: Object,
    additionalProperties: true,
  })
  @IsObject()
  systemProfile: Record<string, any>;
}
