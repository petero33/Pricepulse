import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OcrStatus } from '@prisma/client';

export const RECEIPT_QUEUE = 'receipt-processing';

@Processor(RECEIPT_QUEUE)
export class ReceiptProcessor {
  private readonly logger = new Logger(ReceiptProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('ocr')
  async handleOcr(job: Job<{ receiptId: string; imageUrl: string }>) {
    const { receiptId } = job.data;
    this.logger.log(`Processing receipt OCR job: ${receiptId}`);

    await this.prisma.receipt.update({
      where: { id: receiptId },
      data: { status: OcrStatus.PROCESSING },
    });

    try {
      // Phase 1: Mock OCR processing
      // Phase 2+ : Integrate Tesseract.js or Google Cloud Vision
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await this.prisma.receipt.update({
        where: { id: receiptId },
        data: {
          status: OcrStatus.COMPLETED,
          rawOcrText: 'BROOKSIDE MILK 500ML - 60.00\nJOGOO MAIZE 2KG - 160.00\nTOTAL - 220.00',
          processedAt: new Date(),
          totalAmount: 220.0,
        },
      });

      this.logger.log(`Receipt ${receiptId} processed successfully`);
    } catch (err) {
      this.logger.error(`Failed to process receipt ${receiptId}`, err);
      await this.prisma.receipt.update({
        where: { id: receiptId },
        data: { status: OcrStatus.FAILED },
      });
    }
  }
}
