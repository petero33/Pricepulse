import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class OptimizeBasketDto {
  @ApiPropertyOptional({
    description: 'User latitude for store proximity calculation',
    example: -1.2921,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'User longitude for store proximity calculation',
    example: 36.8219,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Max radius distance in kilometers to include stores',
    default: 15,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxDistanceKm?: number = 15;
}
