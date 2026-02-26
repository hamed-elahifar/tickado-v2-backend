import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteS3FileDto {
  @ApiProperty({
    example: 'tickets/7de68044-438d-4ca5-958f-1ba5fc4a3f91.jpg',
    description: 'Object key in S3 bucket to delete',
  })
  @IsString()
  @IsNotEmpty()
  key: string;
}
