import { Controller, Get, Query } from '@nestjs/common';
import {
  LocationService,
  NeshanReverseGeocodeResponse,
} from './location.service';
import { ReverseGeocodeDto } from './dto/reverse-geocode.dto';

@Controller('location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Get('reverse')
  reverseGeocode(
    @Query() query: ReverseGeocodeDto,
  ): Promise<NeshanReverseGeocodeResponse> {
    return this.locationService.reverseGeocode(query.lat, query.lng);
  }
}
