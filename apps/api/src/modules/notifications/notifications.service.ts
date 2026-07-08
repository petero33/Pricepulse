import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async registerFcmToken(userId: string, fcmToken: string) {
    // In production, upsert into a FcmToken table
    this.logger.log(`FCM token registered for user ${userId}`);
    return { success: true, message: 'Token registered' };
  }

  async getPreferences(userId: string) {
    return {
      priceAlerts: true,
      weeklyDigest: true,
      leaderboardUpdates: false,
      promotionalOffers: true,
    };
  }

  async sendPushNotification(
    fcmToken: string,
    title: string,
    body: string,
    data?: any,
  ) {
    this.logger.log(
      `[Push Notification Mock] Sending to token ${fcmToken}: ${title} - ${body}`,
    );
    return { success: true, messageId: `mock-msg-${Date.now()}` };
  }

  async sendPriceAlert(
    email: string,
    productName: string,
    oldPrice: number,
    newPrice: number,
  ) {
    this.logger.log(
      `[Price Alert Email Mock] Sending to ${email}: ${productName} price changed from KES ${oldPrice} to KES ${newPrice}`,
    );
    return { success: true };
  }
}
