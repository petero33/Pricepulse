import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { VoteType } from '@prisma/client';

export class VerifyPriceDto {
  @ApiProperty({
    description: 'ID of the price report to vote on',
    example: 'clxxxxxxxxxxxxxxxxxxxxxxx',
  })
  @IsNotEmpty()
  @IsString()
  priceReportId: string;

  @ApiProperty({
    description: 'Vote action: CONFIRM or DISPUTE',
    enum: VoteType,
    example: VoteType.CONFIRM,
  })
  @IsNotEmpty()
  @IsEnum(VoteType)
  vote: VoteType;
}
