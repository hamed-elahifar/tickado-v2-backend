import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsPhoneNumber,
  IsOptional,
  IsEmail,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    example: '+989123456789',
    description: 'The phone number of the user',
  })
  @IsPhoneNumber()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    example: 'password123',
    description: 'The password of the user',
  })
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    example: 'en',
    description: 'The locale of the user',
  })
  @IsString()
  @IsOptional()
  locale?: string;
}
