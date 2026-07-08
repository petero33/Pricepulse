import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Param,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PricesService } from './prices.service';
import { SubmitPriceDto } from './dto/submit-price.dto';
import { VerifyPriceDto } from './dto/verify-price.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('prices')
@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService) {}

  @Post('submit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit an observed retail price report' })
  @ApiResponse({
    status: 201,
    description: 'Price reported and verified through scoring engine',
  })
  @ApiResponse({ status: 400, description: 'Invalid input parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  submit(
    @GetUser('id') userId: string,
    @Body() submitPriceDto: SubmitPriceDto,
  ) {
    return this.pricesService.submitPrice(userId, submitPriceDto);
  }

  @Post('vote')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Confirm or dispute a pending price submission' })
  @ApiResponse({ status: 200, description: 'Verification vote recorded' })
  @ApiResponse({
    status: 400,
    description: 'Self-voting or double voting attempt',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  vote(@GetUser('id') userId: string, @Body() verifyPriceDto: VerifyPriceDto) {
    return this.pricesService.vote(userId, verifyPriceDto);
  }

  @Get('history/:productId')
  @ApiOperation({ summary: 'Get price history trends for a product' })
  @ApiResponse({ status: 200, description: 'Price history points returned' })
  getHistory(
    @Param('productId') productId: string,
    @Query('days') days?: number,
  ) {
    return this.pricesService.getPriceHistory(
      productId,
      days ? Number(days) : 30,
    );
  }

  @Get('latest/:productId')
  @ApiOperation({
    summary: 'Get latest accepted price at every branch for a product',
  })
  @ApiResponse({ status: 200, description: 'Latest prices list returned' })
  getLatestPrices(@Param('productId') productId: string) {
    return this.pricesService.getLatestPricesForProduct(productId);
  }
}
