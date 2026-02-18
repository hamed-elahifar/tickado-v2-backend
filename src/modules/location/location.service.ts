import { Injectable } from '@nestjs/common';
import axios from 'axios';

export interface NeshanReverseGeocodeResponse {
  status: string;
  formatted_address: string;
  route_name: string;
  route_type: string;
  neighbourhood: string;
  city: string;
  state: string;
  place: string | null;
  municipality_zone: string;
  in_traffic_zone: string;
  in_odd_even_zone: string;
  village: string | null;
  county: string;
  district: string;
}

@Injectable()
export class LocationService {
  async reverseGeocode(
    lat: number,
    lng: number,
  ): Promise<NeshanReverseGeocodeResponse> {
    const apiKey = process.env.NESHAN_API_KEY;
    if (!apiKey) {
      throw new Error('Neshan API key is not configured');
    }

    try {
      const response = await axios.get<NeshanReverseGeocodeResponse>(
        'https://api.neshan.org/v5/reverse',
        {
          params: { lat, lng },
          headers: { 'Api-Key': apiKey },
        },
      );
      if (response.data.status === 'OK') {
        return response.data;
      } else {
        throw new Error(`Neshan API error: ${response.data.status}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Failed to fetch reverse geocode: ${error.message}`);
      } else {
        throw new Error('Failed to fetch reverse geocode: Unknown error');
      }
    }
  }
}
