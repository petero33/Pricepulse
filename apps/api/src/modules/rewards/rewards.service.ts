import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RewardsService {
  constructor(private readonly prisma: PrismaService) {}

  async getHistory(userId: string) {
    return this.prisma.reward.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        totalPoints: true,
        currentStreak: true,
        reputationScore: true,
        verifiedSubmissions: true,
        totalSubmissions: true,
      },
    });

    const recentRewards = await this.prisma.reward.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      ...user,
      recentRewards,
    };
  }
}
