import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class UpdateSystemProfileDto {
  @ApiPropertyOptional({
    example: { priority: 'medium' },
    description: 'Arbitrary key-value pairs to merge into the user system profile',
    type: Object,
    additionalProperties: true,
  })
  @IsObject()
  @IsOptional()
  systemProfile?: Record<string, any>;
}
