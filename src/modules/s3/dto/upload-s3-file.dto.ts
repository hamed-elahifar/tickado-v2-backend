import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadS3FileDto {
  @ApiPropertyOptional({
    example: 'tickets',
    description: 'Optional folder path inside the S3 bucket',
  })
  @IsOptional()
  @IsString()
  folder?: string;

  @ApiPropertyOptional({
    example: 'my-custom-file-name.jpg',
    description: 'Optional custom filename including extension',
  })
  @IsOptional()
  @IsString()
  customFilename?: string;
}
