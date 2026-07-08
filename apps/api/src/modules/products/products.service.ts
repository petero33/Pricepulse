import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
import { SearchService } from '../search/search.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly searchService: SearchService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    if (createProductDto.barcode) {
      const exists = await this.prisma.product.findUnique({
        where: { barcode: createProductDto.barcode },
      });
      if (exists) {
        throw new ConflictException(
          `Product with barcode ${createProductDto.barcode} already exists`,
        );
      }
    }

    const slug = createProductDto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const slugExists = await this.prisma.product.findUnique({
      where: { slug },
    });
    const finalSlug = slugExists
      ? `${slug}-${Date.now().toString().slice(-4)}`
      : slug;

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        slug: finalSlug,
      },
      include: {
        category: true,
        brand: true,
      },
    });

    // Index product in Elasticsearch
    await this.searchService.indexProduct(product);

    return product;
  }

  async findAll(query: ProductQueryDto) {
    const {
      categoryId,
      brandId,
      barcode,
      search,
      page = 1,
      limit = 20,
    } = query;
    const skip = (page - 1) * limit;

    const whereClause: any = { isActive: true };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }
    if (brandId) {
      whereClause.brandId = brandId;
    }
    if (barcode) {
      whereClause.barcode = barcode;
    }

    // Standard database search fallback
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      this.prisma.product.count({ where: whereClause }),
      this.prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          brand: true,
        },
        orderBy: { viewCount: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
      },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Increment view count asynchronously
    this.prisma.product
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
      .catch((err) => console.error('Failed to increment viewCount:', err));

    return product;
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getBrands() {
    return this.prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findByBarcode(barcode: string) {
    const product = await this.prisma.product.findUnique({
      where: { barcode },
      include: {
        category: true,
        brand: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with barcode ${barcode} not found`);
    }

    return product;
  }
}
