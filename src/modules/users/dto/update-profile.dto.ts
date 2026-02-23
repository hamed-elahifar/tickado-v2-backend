import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: { bio: 'Senior Engineer', website: 'https://example.com' },
    description: 'Arbitrary key-value pairs to merge into the user profile',
    type: Object,
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  profile?: Record<string, any>;
}
