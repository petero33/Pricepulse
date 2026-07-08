import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { CreateBranchDto } from './dto/create-branch.dto';

@Injectable()
export class StoresService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── STORES (Chains) ────────────────────────────────────────────────────────

  async createStore(createStoreDto: CreateStoreDto) {
    const slug = createStoreDto.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const exists = await this.prisma.store.findUnique({ where: { slug } });
    if (exists) {
      throw new ConflictException(
        `Store with name ${createStoreDto.name} already exists`,
      );
    }

    return this.prisma.store.create({
      data: {
        ...createStoreDto,
        slug,
      },
    });
  }

  async findAllStores() {
    return this.prisma.store.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { branches: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOneStore(id: string) {
    const store = await this.prisma.store.findUnique({
      where: { id },
      include: {
        branches: {
          where: { isActive: true },
        },
      },
    });

    if (!store || !store.isActive) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return store;
  }

  // ─── BRANCHES ──────────────────────────────────────────────────────────────

  async createBranch(createBranchDto: CreateBranchDto) {
    const parentStore = await this.prisma.store.findUnique({
      where: { id: createBranchDto.storeId },
    });
    if (!parentStore) {
      throw new NotFoundException(
        `Parent Store with ID ${createBranchDto.storeId} not found`,
      );
    }

    const slug = `${parentStore.slug}-${createBranchDto.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')}`;

    const exists = await this.prisma.branch.findUnique({ where: { slug } });
    if (exists) {
      throw new ConflictException(
        `Branch location ${createBranchDto.name} already exists for this store`,
      );
    }

    return this.prisma.branch.create({
      data: {
        ...createBranchDto,
        slug,
      },
    });
  }

  async findAllBranches(city?: string) {
    return this.prisma.branch.findMany({
      where: {
        isActive: true,
        ...(city ? { city: { equals: city, mode: 'insensitive' } } : {}),
      },
      include: {
        store: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOneBranch(id: string) {
    const branch = await this.prisma.branch.findUnique({
      where: { id },
      include: {
        store: true,
      },
    });

    if (!branch || !branch.isActive) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }

    return branch;
  }

  // Haversine sorting helper
  async findNearbyBranches(lat: number, lng: number, maxDistanceKm = 15) {
    const branches = await this.prisma.branch.findMany({
      where: { isActive: true },
      include: { store: true },
    });

    return branches
      .map((branch) => {
        if (!branch.latitude || !branch.longitude) {
          return { ...branch, distance: null };
        }
        const dist = this.calculateDistance(
          lat,
          lng,
          branch.latitude,
          branch.longitude,
        );
        return { ...branch, distance: Math.round(dist * 100) / 100 }; // 2 decimal places
      })
      .filter(
        (branch) =>
          branch.distance !== null && branch.distance <= maxDistanceKm,
      )
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371; // Earth radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}
