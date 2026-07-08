import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { BasketOptimizerService } from './basket-optimizer.service';
import { AddToBasketDto, UpdateBasketItemDto } from './dto/shopping-list.dto';
import { OptimizeBasketDto } from './dto/optimize-basket.dto';

@Injectable()
export class ShoppingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly basketOptimizerService: BasketOptimizerService,
  ) {}

  private async getOrCreateDefaultList(userId: string) {
    let list = await this.prisma.shoppingList.findFirst({
      where: { userId, isDefault: true },
    });

    if (!list) {
      list = await this.prisma.shoppingList.create({
        data: {
          userId,
          name: 'My Basket',
          isDefault: true,
        },
      });
    }

    return list;
  }

  async getBasket(userId: string) {
    const list = await this.getOrCreateDefaultList(userId);
    return this.prisma.shoppingList.findUnique({
      where: { id: list.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
                brand: true,
              },
            },
          },
          orderBy: { addedAt: 'desc' },
        },
      },
    });
  }

  async addToBasket(userId: string, dto: AddToBasketDto) {
    const list = await this.getOrCreateDefaultList(userId);

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${dto.productId} not found`);
    }

    // Upsert item
    const existingItem = await this.prisma.shoppingListItem.findUnique({
      where: {
        shoppingListId_productId: {
          shoppingListId: list.id,
          productId: dto.productId,
        },
      },
    });

    if (existingItem) {
      return this.prisma.shoppingListItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });
    }

    return this.prisma.shoppingListItem.create({
      data: {
        shoppingListId: list.id,
        productId: dto.productId,
        quantity: dto.quantity,
      },
    });
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    dto: UpdateBasketItemDto,
  ) {
    const list = await this.getOrCreateDefaultList(userId);

    const item = await this.prisma.shoppingListItem.findUnique({
      where: {
        shoppingListId_productId: {
          shoppingListId: list.id,
          productId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Product not found in your shopping basket`);
    }

    return this.prisma.shoppingListItem.update({
      where: { id: item.id },
      data: { quantity: dto.quantity },
    });
  }

  async removeItem(userId: string, productId: string) {
    const list = await this.getOrCreateDefaultList(userId);

    const item = await this.prisma.shoppingListItem.findUnique({
      where: {
        shoppingListId_productId: {
          shoppingListId: list.id,
          productId,
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Product not found in your shopping basket`);
    }

    await this.prisma.shoppingListItem.delete({
      where: { id: item.id },
    });

    return { message: 'Item removed from basket' };
  }

  async clearBasket(userId: string) {
    const list = await this.getOrCreateDefaultList(userId);
    await this.prisma.shoppingListItem.deleteMany({
      where: { shoppingListId: list.id },
    });
    return { message: 'Basket cleared' };
  }

  async compareBasketPrices(userId: string, dto: OptimizeBasketDto) {
    const basket = await this.getBasket(userId);
    if (!basket || basket.items.length === 0) {
      return [];
    }

    const items = basket.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    return this.basketOptimizerService.optimizeBasket(
      items,
      dto.latitude,
      dto.longitude,
      dto.maxDistanceKm,
    );
  }
}
