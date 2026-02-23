import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: { bio: 'Software Engineer', interests: ['coding', 'hiking'] },
    description: 'Arbitrary key-value pairs for the user profile',
    required: false,
    type: Object,
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  profile?: Record<string, any>;
}
