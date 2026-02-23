import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto';

export class GetMyNotifsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter notifications by read/unread state',
  })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
