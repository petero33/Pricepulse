import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Brookside Full Cream Milk 500ml',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'EAN-13 / UPC barcode',
    example: '6281007026014',
  })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({
    description: 'Category ID of the product',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiPropertyOptional({
    description: 'Brand ID of the product',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsOptional()
  @IsString()
  brandId?: string;

  @ApiPropertyOptional({
    description: 'Unit of measure',
    example: '500ml',
  })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'Fresh pasteurized full cream milk from Brookside Dairies.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Product image URL',
    example: 'https://example.com/images/brookside-500.jpg',
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}
