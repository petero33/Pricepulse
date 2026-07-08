import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { PrismaModule } from './prisma/prisma.module';
import { ReceiptProcessor, RECEIPT_QUEUE } from './processors/receipt.processor';
import { PriceAlertProcessor, PRICE_ALERT_QUEUE } from './processors/price-alert.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: config.get('REDIS_URL', 'redis://localhost:6379'),
      }),
    }),
    BullModule.registerQueue(
      { name: RECEIPT_QUEUE },
      { name: PRICE_ALERT_QUEUE },
    ),
    PrismaModule,
  ],
  providers: [ReceiptProcessor, PriceAlertProcessor],
})
export class WorkerModule {}
