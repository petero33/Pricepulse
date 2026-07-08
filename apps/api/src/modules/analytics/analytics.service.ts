import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPriceTrends(productId: string) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const reports = await this.prisma.priceReport.findMany({
      where: {
        productId,
        status: 'ACCEPTED',
        reportedAt: { gte: thirtyDaysAgo },
      },
      include: { branch: { include: { store: true } } },
      orderBy: { reportedAt: 'asc' },
    });

    return {
      productId,
      dataPoints: reports.length,
      stores: [...new Set(reports.map((r) => r.branch.store.name))],
      history: reports.map((r) => ({
        price: Number(r.price),
        store: r.branch.store.name,
        branch: r.branch.name,
        date: r.reportedAt,
      })),
    };
  }

  async getTopContributors(limit = 10) {
    return this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { verifiedSubmissions: 'desc' },
      take: limit,
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        reputationScore: true,
        verifiedSubmissions: true,
        totalPoints: true,
      },
    });
  }
}
