import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { ShoppingService } from './shopping.service';
import { AddToBasketDto, UpdateBasketItemDto } from './dto/shopping-list.dto';
import { OptimizeBasketDto } from './dto/optimize-basket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('shopping')
@Controller('shopping')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Get('basket')
  @ApiOperation({ summary: 'Retrieve the active user shopping basket' })
  @ApiResponse({ status: 200, description: 'Basket data returned' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getBasket(@GetUser('id') userId: string) {
    return this.shoppingService.getBasket(userId);
  }

  @Post('basket/add')
  @ApiOperation({ summary: 'Add a product to the shopping basket' })
  @ApiResponse({
    status: 201,
    description: 'Product added / quantity incremented',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  addToBasket(@GetUser('id') userId: string, @Body() dto: AddToBasketDto) {
    return this.shoppingService.addToBasket(userId, dto);
  }

  @Patch('basket/items/:productId')
  @ApiOperation({ summary: 'Update product quantity in the basket' })
  @ApiResponse({ status: 200, description: 'Quantity updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Item not in basket' })
  updateItemQuantity(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
    @Body() dto: UpdateBasketItemDto,
  ) {
    return this.shoppingService.updateItemQuantity(userId, productId, dto);
  }

  @Delete('basket/items/:productId')
  @ApiOperation({ summary: 'Remove an item from the shopping basket' })
  @ApiResponse({ status: 200, description: 'Item removed successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Item not in basket' })
  removeItem(
    @GetUser('id') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.shoppingService.removeItem(userId, productId);
  }

  @Delete('basket/clear')
  @ApiOperation({ summary: 'Clear all items from the shopping basket' })
  @ApiResponse({ status: 200, description: 'Basket cleared successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  clearBasket(@GetUser('id') userId: string) {
    return this.shoppingService.clearBasket(userId);
  }

  @Get('basket/compare')
  @ApiOperation({
    summary: 'Compare basket prices across branches (core feature)',
  })
  @ApiResponse({
    status: 200,
    description: 'Optimized comparison results returned',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  compareBasket(
    @GetUser('id') userId: string,
    @Query() query: OptimizeBasketDto,
  ) {
    return this.shoppingService.compareBasketPrices(userId, query);
  }
}
