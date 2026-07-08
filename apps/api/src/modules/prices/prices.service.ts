import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubmitPriceDto } from './dto/submit-price.dto';
import { VerifyPriceDto } from './dto/verify-price.dto';
import {
  PriceSource,
  VerificationStatus,
  VoteType,
  RewardReason,
} from '@prisma/client';
import { Prisma } from '@prisma/client';

@Injectable()
export class PricesService {
  constructor(private readonly prisma: PrismaService) {}

  async submitPrice(userId: string, dto: SubmitPriceDto) {
    const {
      productId,
      branchId,
      price,
      source,
      isPromotion,
      promotionEndsAt,
      receiptId,
      notes,
    } = dto;

    // Verify product and branch exist
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product)
      throw new NotFoundException(`Product with ID ${productId} not found`);

    const branch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!branch)
      throw new NotFoundException(`Branch with ID ${branchId} not found`);

    // Fetch user reputation
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

    // Prevent duplicate submission within the last 15 minutes by same user for same product + branch
    const recentDuplicate = await this.prisma.priceReport.findFirst({
      where: {
        productId,
        branchId,
        reportedById: userId,
        reportedAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
      },
    });
    if (recentDuplicate) {
      throw new ConflictException(
        'You have already submitted a price report for this product at this branch in the last 15 minutes',
      );
    }

    // ─── VERIFICATION SCORING ENGINE ──────────────────────────────────────────
    let score = 0;

    // Source weights
    if (source === PriceSource.RECEIPT_OCR) {
      score += 50;
    } else if (source === PriceSource.BARCODE_SCAN) {
      score += 30;
    } else if (source === PriceSource.ADMIN) {
      score += 100; // auto-verify admin submissions
    } else {
      score += 10; // manual entry baseline
    }

    // User reputation weights
    if (user.reputationScore >= 0.8) {
      score += 15;
    } else if (user.reputationScore < 0.3) {
      score -= 15;
    }

    // Price variance checks against historical averages
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const history = await this.prisma.priceReport.aggregate({
      where: {
        productId,
        status: VerificationStatus.ACCEPTED,
        reportedAt: { gte: thirtyDaysAgo },
      },
      _avg: { price: true },
    });

    if (history._avg.price) {
      const avgPrice = Number(history._avg.price);
      const variance = Math.abs(price - avgPrice) / avgPrice;

      if (variance <= 0.2) {
        score += 10; // within 20%
      } else if (variance > 0.4) {
        score -= 15; // wild variance (>40%)
      }
    } else {
      score += 10; // first price report, give benefit of doubt
    }

    // Cap verification score range
    score = Math.max(-50, Math.min(100, score));

    // Determine status thresholds
    let status: VerificationStatus = VerificationStatus.PENDING;
    if (source === PriceSource.ADMIN || score >= 60) {
      status = VerificationStatus.ACCEPTED;
    } else if (score < 30) {
      status = VerificationStatus.REJECTED;
    }

    const priceReport = await this.prisma.priceReport.create({
      data: {
        productId,
        branchId,
        reportedById: userId,
        price,
        source,
        verificationScore: score,
        status,
        isPromotion,
        promotionEndsAt,
        receiptId,
        notes,
      },
      include: {
        product: true,
        branch: { include: { store: true } },
      },
    });

    // Handle user rewards and stats
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totalSubmissions: { increment: 1 },
      },
    });

    // Submit base points if accepted immediately
    if (status === VerificationStatus.ACCEPTED) {
      await this.awardPoints(
        userId,
        10,
        RewardReason.PRICE_SUBMISSION,
        priceReport.id,
      );
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          verifiedSubmissions: { increment: 1 },
          reputationScore: Math.min(1.0, user.reputationScore + 0.02),
        },
      });
    }

    return priceReport;
  }

  async vote(userId: string, dto: VerifyPriceDto) {
    const { priceReportId, vote } = dto;

    const report = await this.prisma.priceReport.findUnique({
      where: { id: priceReportId },
      include: { reportedBy: true },
    });
    if (!report)
      throw new NotFoundException(
        `Price report with ID ${priceReportId} not found`,
      );

    if (report.reportedById === userId) {
      throw new BadRequestException(
        'You cannot vote on your own price submission',
      );
    }

    // Check if already voted
    const existingVote = await this.prisma.verificationVote.findUnique({
      where: {
        priceReportId_userId: { priceReportId, userId },
      },
    });
    if (existingVote) {
      throw new BadRequestException(
        'You have already voted on this price report',
      );
    }

    // Save vote
    await this.prisma.verificationVote.create({
      data: {
        priceReportId,
        userId,
        vote,
      },
    });

    // Recalculate verification score
    const voteWeight = vote === VoteType.CONFIRM ? 20 : -20;
    let newScore = report.verificationScore + voteWeight;
    newScore = Math.max(-50, Math.min(100, newScore));

    let newStatus = report.status;
    if (newScore >= 60 && report.status !== VerificationStatus.ACCEPTED) {
      newStatus = VerificationStatus.ACCEPTED;
    } else if (newScore < 30 && report.status !== VerificationStatus.REJECTED) {
      newStatus = VerificationStatus.REJECTED;
    }

    await this.prisma.priceReport.update({
      where: { id: priceReportId },
      data: {
        verificationScore: newScore,
        status: newStatus,
      },
    });

    // Award voter points
    await this.awardPoints(
      userId,
      5,
      RewardReason.VERIFICATION_VOTE,
      priceReportId,
    );

    // If status changed to verified/rejected, update reporter reputation + bonus points
    if (newStatus !== report.status) {
      const reporterId = report.reportedById;
      const reporter = report.reportedBy;

      if (newStatus === VerificationStatus.ACCEPTED) {
        // Submitter gets bonus
        await this.awardPoints(
          reporterId,
          20,
          RewardReason.SUBMISSION_VERIFIED,
          priceReportId,
        );
        await this.prisma.user.update({
          where: { id: reporterId },
          data: {
            verifiedSubmissions: { increment: 1 },
            reputationScore: Math.min(1.0, reporter.reputationScore + 0.05),
          },
        });
      } else if (newStatus === VerificationStatus.REJECTED) {
        await this.prisma.user.update({
          where: { id: reporterId },
          data: {
            reputationScore: Math.max(0.0, reporter.reputationScore - 0.1),
          },
        });
      }
    }

    return { message: 'Vote recorded successfully', newScore, newStatus };
  }

  async getPriceHistory(productId: string, days = 30) {
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    // Fetch reports
    const reports = await this.prisma.priceReport.findMany({
      where: {
        productId,
        status: VerificationStatus.ACCEPTED,
        reportedAt: { gte: dateLimit },
      },
      include: {
        branch: { include: { store: true } },
      },
      orderBy: { reportedAt: 'desc' },
    });

    // Group by branch to give trending/history charts
    const historyByBranch: Record<
      string,
      { branchName: string; storeColor: string; data: any[] }
    > = {};

    reports.forEach((rep) => {
      const branchId = rep.branchId;
      if (!historyByBranch[branchId]) {
        historyByBranch[branchId] = {
          branchName: rep.branch.name,
          storeColor: rep.branch.store.color || '#999999',
          data: [],
        };
      }
      historyByBranch[branchId].data.push({
        price: Number(rep.price),
        date: rep.reportedAt,
      });
    });

    return Object.values(historyByBranch);
  }

  async getLatestPricesForProduct(productId: string) {
    // We want the single latest accepted price per branch for this product
    const latestReports = await this.prisma.$queryRaw`
      SELECT DISTINCT ON ("branchId") 
        pr.id, pr."productId", pr."branchId", pr.price, pr."reportedAt",
        b.name as "branchName", s.name as "storeName", s.slug as "storeSlug", s.color as "storeColor"
      FROM price_reports pr
      JOIN branches b ON pr."branchId" = b.id
      JOIN stores s ON b."storeId" = s.id
      WHERE pr."productId" = ${productId} AND pr.status = 'ACCEPTED'
      ORDER BY pr."branchId", pr."reportedAt" DESC
    `;

    return latestReports;
  }

  private async awardPoints(
    userId: string,
    points: number,
    reason: RewardReason,
    referenceId: string,
  ) {
    await this.prisma.reward.create({
      data: {
        userId,
        points,
        reason,
        referenceId,
      },
    });

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: points },
      },
    });
  }
}
