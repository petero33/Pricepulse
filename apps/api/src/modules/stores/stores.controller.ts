import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { CreateBranchDto } from './dto/create-branch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('stores')
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  // ─── STORES ────────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new store chain (Admin only)' })
  @ApiResponse({ status: 201, description: 'Store created successfully' })
  createStore(@Body() createStoreDto: CreateStoreDto) {
    return this.storesService.createStore(createStoreDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all store chains' })
  @ApiResponse({ status: 200, description: 'Stores list retrieved' })
  findAllStores() {
    return this.storesService.findAllStores();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get store details and its branches' })
  @ApiResponse({ status: 200, description: 'Store details retrieved' })
  @ApiResponse({ status: 404, description: 'Store not found' })
  findOneStore(@Param('id') id: string) {
    return this.storesService.findOneStore(id);
  }

  // ─── BRANCHES ──────────────────────────────────────────────────────────────

  @Post('branches')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MODERATOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new branch location (Admin/Moderator only)',
  })
  @ApiResponse({ status: 201, description: 'Branch created successfully' })
  createBranch(@Body() createBranchDto: CreateBranchDto) {
    return this.storesService.createBranch(createBranchDto);
  }

  @Get('branches/list')
  @ApiOperation({ summary: 'Get list of all active branches' })
  @ApiResponse({ status: 200, description: 'Branches list retrieved' })
  findAllBranches(@Query('city') city?: string) {
    return this.storesService.findAllBranches(city);
  }

  @Get('branches/nearby')
  @ApiOperation({
    summary: 'Find nearby branches sorted by distance (Haversine)',
  })
  @ApiResponse({ status: 200, description: 'Nearby branches returned' })
  findNearbyBranches(
    @Query('lat') lat: number,
    @Query('lng') lng: number,
    @Query('maxDistance') maxDistance?: number,
  ) {
    return this.storesService.findNearbyBranches(
      Number(lat),
      Number(lng),
      maxDistance ? Number(maxDistance) : 15,
    );
  }

  @Get('branches/:id')
  @ApiOperation({ summary: 'Get branch details by ID' })
  @ApiResponse({ status: 200, description: 'Branch details retrieved' })
  @ApiResponse({ status: 404, description: 'Branch not found' })
  findOneBranch(@Param('id') id: string) {
    return this.storesService.findOneBranch(id);
  }
}
