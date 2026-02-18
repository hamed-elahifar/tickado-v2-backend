import { IsNumber, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class ReverseGeocodeDto {
  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  lat: number;

  @IsDefined()
  @Type(() => Number)
  @IsNumber()
  lng: number;
}
