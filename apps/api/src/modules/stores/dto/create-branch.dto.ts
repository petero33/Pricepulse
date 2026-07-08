import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateBranchDto {
  @ApiProperty({
    description: 'Parent Store ID',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsNotEmpty()
  @IsString()
  storeId: string;

  @ApiProperty({ description: 'Branch name', example: 'Naivas Westgate' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Physical street address / Mall location',
    example: 'Westgate Mall, Westlands',
  })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiPropertyOptional({
    description: 'City / Town name',
    default: 'Nairobi',
    example: 'Nairobi',
  })
  @IsOptional()
  @IsString()
  city?: string = 'Nairobi';

  @ApiPropertyOptional({
    description: 'County name',
    default: 'Nairobi',
    example: 'Nairobi',
  })
  @IsOptional()
  @IsString()
  county?: string = 'Nairobi';

  @ApiPropertyOptional({
    description: 'Branch latitude coordinate',
    example: -1.2638,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Branch longitude coordinate',
    example: 36.8034,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Optional support phone number',
    example: '+254712345678',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Opening hours (HH:MM format)',
    example: '08:00',
  })
  @IsOptional()
  @IsString()
  openingTime?: string;

  @ApiPropertyOptional({
    description: 'Closing hours (HH:MM format)',
    example: '21:00',
  })
  @IsOptional()
  @IsString()
  closingTime?: string;
}
