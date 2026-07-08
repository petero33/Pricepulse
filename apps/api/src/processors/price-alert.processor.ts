import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const PRICE_ALERT_QUEUE = 'price-alerts';

@Processor(PRICE_ALERT_QUEUE)
export class PriceAlertProcessor {
  private readonly logger = new Logger(PriceAlertProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('check')
  async handlePriceAlert(job: Job<{ productId: string; newPrice: number; branchId: string }>) {
    const { productId, newPrice, branchId } = job.data;
    this.logger.log(`Checking price alerts for product ${productId} at KES ${newPrice}`);

    const activeAlerts = await this.prisma.priceAlert.findMany({
      where: {
        productId,
        isActive: true,
        triggeredAt: null,
        targetPrice: { gte: newPrice },
      },
      include: { user: true },
    });

    for (const alert of activeAlerts) {
      this.logger.log(`Triggering price alert ${alert.id} for user ${alert.userId}`);

      await this.prisma.priceAlert.update({
        where: { id: alert.id },
        data: { triggeredAt: new Date() },
      });

      // TODO: send push notification via FCM
    }

    return { checked: activeAlerts.length, triggered: activeAlerts.length };
  }
}
