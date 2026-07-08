import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { OcrStatus } from '@prisma/client';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(private readonly prisma: PrismaService) {}

  async uploadAndProcessReceipt(
    userId: string,
    fileBuffer: Buffer,
    fileName: string,
  ) {
    this.logger.log(
      `Processing receipt upload for user ${userId}: ${fileName}`,
    );

    // In Phase 1, we save a mock receipt record
    const receipt = await this.prisma.receipt.create({
      data: {
        uploadedById: userId,
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/pricepulse/o/${fileName}`,
        status: OcrStatus.COMPLETED,
        rawOcrText:
          'BROOKSIDE MILK 500ML - 60.00\nJOGOO MAIZE 2KG - 160.00\nTOTAL - 220.00',
        totalAmount: 220.0,
        processedAt: new Date(),
      },
    });

    // Seed mock receipt items for testing matching later
    await this.prisma.receiptItem.createMany({
      data: [
        {
          receiptId: receipt.id,
          rawText: 'BROOKSIDE MILK 500ML',
          price: 60.0,
          quantity: 1,
          confidence: 0.95,
        },
        {
          receiptId: receipt.id,
          rawText: 'JOGOO MAIZE 2KG',
          price: 160.0,
          quantity: 1,
          confidence: 0.9,
        },
      ],
    });

    return receipt;
  }

  async getReceiptDetails(receiptId: string) {
    const receipt = await this.prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        items: true,
      },
    });
    return receipt;
  }
}
