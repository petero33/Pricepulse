import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        phone: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        reputationScore: true,
        totalSubmissions: true,
        verifiedSubmissions: true,
        totalPoints: true,
        currentStreak: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        email: true,
        phone: true,
        displayName: true,
        avatarUrl: true,
        role: true,
        reputationScore: true,
        totalSubmissions: true,
        verifiedSubmissions: true,
        totalPoints: true,
        currentStreak: true,
        updatedAt: true,
      },
    });
  }

  async getLeaderboard(limit = 10) {
    return this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: [{ totalPoints: 'desc' }, { reputationScore: 'desc' }],
      take: limit,
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        totalPoints: true,
        reputationScore: true,
        verifiedSubmissions: true,
      },
    });
  }
}
