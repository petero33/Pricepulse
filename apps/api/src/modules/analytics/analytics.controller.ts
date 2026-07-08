import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('price-trends/:productId')
  @ApiOperation({ summary: 'Get price trends for a product (all branches)' })
  @ApiResponse({ status: 200, description: 'Price trend data returned' })
  async getPriceTrends(@Param('productId') productId: string) {
    return this.analyticsService.getPriceTrends(productId);
  }

  @Get('top-contributors')
  @ApiOperation({ summary: 'Get top contributing users' })
  @ApiResponse({ status: 200, description: 'Contributor list returned' })
  async getTopContributors() {
    return this.analyticsService.getTopContributors();
  }
}
