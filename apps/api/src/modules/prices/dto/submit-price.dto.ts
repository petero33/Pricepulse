import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PriceSource } from '@prisma/client';

export class SubmitPriceDto {
  @ApiProperty({
    description: 'ID of the product being priced',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'ID of the branch where price was spotted',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsNotEmpty()
  @IsString()
  branchId: string;

  @ApiProperty({ description: 'Observed price in KES', example: 120.0 })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  price: number;

  @ApiProperty({
    description: 'Source of the price data',
    enum: PriceSource,
    example: PriceSource.MANUAL,
  })
  @IsNotEmpty()
  @IsString()
  source: PriceSource;

  @ApiPropertyOptional({
    description: 'Is this price part of a promotion/offer?',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPromotion?: boolean = false;

  @ApiPropertyOptional({ description: 'Optional end date of promotion' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  promotionEndsAt?: Date;

  @ApiPropertyOptional({
    description: 'Associated receipt ID (if from OCR upload)',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsOptional()
  @IsString()
  receiptId?: string;

  @ApiPropertyOptional({
    description: 'User comments or context',
    example: 'Buy-one-get-one-free deal spotted on shelf.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
