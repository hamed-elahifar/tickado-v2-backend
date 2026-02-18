import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsPhoneNumber, IsString } from 'class-validator';

export class LogInDto {
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
    example: '12345',
    description: 'The Sms Code',
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({ description: 'Password' })
  @IsString()
  @IsOptional()
  password?: string;
}
