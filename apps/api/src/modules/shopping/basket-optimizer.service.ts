import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StoresService } from '../stores/stores.service';
import { Prisma } from '@prisma/client';

export interface BasketItemInput {
  productId: string;
  quantity: number;
}

@Injectable()
export class BasketOptimizerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storesService: StoresService,
  ) {}

  async optimizeBasket(
    items: BasketItemInput[],
    lat?: number,
    lng?: number,
    maxDistanceKm = 15,
  ) {
    if (items.length === 0) {
      return [];
    }

    const productIds = items.map((i) => i.productId);
    const itemMap = new Map<string, number>();
    items.forEach((i) => itemMap.set(i.productId, i.quantity));

    // Step 1: Find branches
    let branches: any[] = [];
    if (lat !== undefined && lng !== undefined) {
      branches = await this.storesService.findNearbyBranches(
        lat,
        lng,
        maxDistanceKm,
      );
    } else {
      branches = await this.prisma.branch.findMany({
        where: { isActive: true },
        include: { store: true },
      });
    }

    if (branches.length === 0) {
      return [];
    }

    const branchIds = branches.map((b) => b.id);

    // Step 2: Fetch the latest ACCEPTED price for each product at each branch
    // Use Postgres DISTINCT ON for high performance
    const priceReports: any[] = await this.prisma.$queryRaw`
      SELECT DISTINCT ON (pr."branchId", pr."productId")
        pr."branchId", pr."productId", pr.price, pr."reportedAt"
      FROM price_reports pr
      WHERE pr."productId" IN (${Prisma.join(productIds)})
        AND pr."branchId" IN (${Prisma.join(branchIds)})
        AND pr.status = 'ACCEPTED'
      ORDER BY pr."branchId", pr."productId", pr."reportedAt" DESC
    `;

    // Step 3: Group prices by branchId -> productId -> price
    const branchPricesMap = new Map<string, Map<string, number>>();
    priceReports.forEach((report) => {
      if (!branchPricesMap.has(report.branchId)) {
        branchPricesMap.set(report.branchId, new Map<string, number>());
      }
      branchPricesMap
        .get(report.branchId)!
        .set(report.productId, Number(report.price));
    });

    // Fetch product details for matching names/metadata
    const productsInBasket = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, unit: true, imageUrl: true },
    });

    const productMetaMap = new Map(productsInBasket.map((p) => [p.id, p]));

    // Step 4: Calculate cost for each branch
    const results = branches.map((branch) => {
      const prices =
        branchPricesMap.get(branch.id) || new Map<string, number>();
      let totalCost = 0;
      let availableItemsCount = 0;
      const details: any[] = [];

      items.forEach((item) => {
        const unitPrice = prices.get(item.productId);
        const productMeta = productMetaMap.get(item.productId);

        if (unitPrice !== undefined) {
          const itemTotal = unitPrice * item.quantity;
          totalCost += itemTotal;
          availableItemsCount++;
          details.push({
            productId: item.productId,
            name: productMeta?.name || 'Unknown Product',
            unit: productMeta?.unit || '',
            imageUrl: productMeta?.imageUrl || null,
            quantity: item.quantity,
            unitPrice,
            totalPrice: itemTotal,
            available: true,
          });
        } else {
          details.push({
            productId: item.productId,
            name: productMeta?.name || 'Unknown Product',
            unit: productMeta?.unit || '',
            imageUrl: productMeta?.imageUrl || null,
            quantity: item.quantity,
            unitPrice: null,
            totalPrice: null,
            available: false,
          });
        }
      });

      const availabilityRate =
        items.length > 0 ? availableItemsCount / items.length : 0;

      return {
        branchId: branch.id,
        branchName: branch.name,
        storeName: branch.store.name,
        storeSlug: branch.store.slug,
        storeLogo: branch.store.logoUrl,
        storeColor: branch.store.color || '#999999',
        distance: branch.distance !== undefined ? branch.distance : null,
        totalCost:
          availabilityRate > 0 ? Math.round(totalCost * 100) / 100 : null,
        availableItemsCount,
        totalItemsCount: items.length,
        availabilityRate,
        items: details,
      };
    });

    // Step 5 & 6: Filter branches with at least 1 match, and sort
    return results
      .filter((res) => res.availableItemsCount > 0)
      .sort((a, b) => {
        // 1. Completeness of basket (descending availabilityRate)
        if (b.availabilityRate !== a.availabilityRate) {
          return b.availabilityRate - a.availabilityRate;
        }
        // 2. Cost (ascending totalCost)
        if (
          a.totalCost !== null &&
          b.totalCost !== null &&
          a.totalCost !== b.totalCost
        ) {
          return a.totalCost - b.totalCost;
        }
        // 3. Proximity (ascending distance)
        if (a.distance !== null && b.distance !== null) {
          return a.distance - b.distance;
        }
        return 0;
      });
  }
}
