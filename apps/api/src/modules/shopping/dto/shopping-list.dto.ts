import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class AddToBasketDto {
  @ApiProperty({
    description: 'ID of the product to add',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsNotEmpty()
  @IsString()
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product',
    default: 1,
    example: 2,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number = 1;
}

export class UpdateBasketItemDto {
  @ApiProperty({ description: 'Quantity of the product', example: 3 })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  quantity: number;
}
