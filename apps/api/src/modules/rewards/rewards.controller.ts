import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('rewards')
@Controller('rewards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('history')
  @ApiOperation({ summary: 'Get reward/points history for current user' })
  @ApiResponse({ status: 200, description: 'Points history returned' })
  async getHistory(@GetUser('id') userId: string) {
    return this.rewardsService.getHistory(userId);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get points summary and streak info' })
  @ApiResponse({ status: 200, description: 'Points summary returned' })
  async getSummary(@GetUser('id') userId: string) {
    return this.rewardsService.getSummary(userId);
  }
}
