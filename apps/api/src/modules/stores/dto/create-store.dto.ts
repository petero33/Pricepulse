import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsHexColor } from 'class-validator';

export class CreateStoreDto {
  @ApiProperty({
    description: 'Name of the supermarket chain',
    example: 'Naivas',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Supermarket brand logo URL',
    example: 'https://example.com/naivas-logo.png',
  })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Official website URL',
    example: 'https://naivas.co.ke',
  })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional({
    description: 'Primary branding hex color code',
    example: '#E63946',
  })
  @IsOptional()
  @IsString()
  @IsHexColor({
    message: 'Branding color must be a valid hex color code (e.g. #E63946)',
  })
  color?: string;
}
