import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private isEsConnected = false;
  private readonly indexName = 'products';

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    try {
      // Check Elasticsearch connection status
      const ping = await this.elasticsearchService.ping();
      if (ping) {
        this.isEsConnected = true;
        this.logger.log('✅ Connected to Elasticsearch');
        await this.createIndexIfNotExists();
      }
    } catch (err) {
      this.logger.warn(
        '⚠️ Elasticsearch not reachable. Falling back to PostgreSQL for search.',
      );
      this.isEsConnected = false;
    }
  }

  private async createIndexIfNotExists() {
    try {
      const exists = await this.elasticsearchService.indices.exists({
        index: this.indexName,
      });

      if (!exists) {
        await this.elasticsearchService.indices.create({
          index: this.indexName,
          settings: {
            analysis: {
              analyzer: {
                autocomplete: {
                  type: 'custom',
                  tokenizer: 'autocomplete',
                  filter: ['lowercase'],
                },
              },
              tokenizer: {
                autocomplete: {
                  type: 'edge_ngram',
                  min_gram: 2,
                  max_gram: 10,
                  token_chars: ['letter', 'digit'],
                },
              },
            },
          },
          mappings: {
            properties: {
              id: { type: 'keyword' },
              name: {
                type: 'text',
                analyzer: 'autocomplete',
                search_analyzer: 'standard',
              },
              description: { type: 'text' },
              barcode: { type: 'keyword' },
              categoryName: { type: 'text' },
              brandName: { type: 'text' },
            },
          },
        });
        this.logger.log(`Created Elasticsearch index: ${this.indexName}`);
      }
    } catch (err) {
      this.logger.error('Failed to create Elasticsearch index:', err);
    }
  }

  async indexProduct(product: any) {
    if (!this.isEsConnected) return;

    try {
      await this.elasticsearchService.index({
        index: this.indexName,
        id: product.id,
        body: {
          id: product.id,
          name: product.name,
          description: product.description || '',
          barcode: product.barcode || '',
          categoryName: product?.category?.name || '',
          brandName: product?.brand?.name || '',
        },
      });
    } catch (err) {
      this.logger.error(`Failed to index product ${product.id} in ES:`, err);
    }
  }

  async searchProducts(query: string, limit = 15) {
    if (!this.isEsConnected) {
      // Fallback search in PostgreSQL via Prisma
      return this.prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { barcode: query },
          ],
        },
        include: {
          category: true,
          brand: true,
        },
        take: limit,
      });
    }

    try {
      const result = await this.elasticsearchService.search<any>({
        index: this.indexName,
        size: limit,
        query: {
          multi_match: {
            query,
            fields: [
              'name^3',
              'description',
              'brandName^2',
              'categoryName',
              'barcode',
            ],
            fuzziness: 'AUTO',
          },
        },
      });

      const hits = result.hits.hits;
      const productIds = hits.map((hit: any) => hit._source.id);

      if (productIds.length === 0) return [];

      // Fetch full records from PostgreSQL preserving the order from Elasticsearch hits
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
        include: {
          category: true,
          brand: true,
        },
      });

      return productIds
        .map((id) => products.find((p) => p.id === id))
        .filter((p) => !!p);
    } catch (err) {
      this.logger.error('Elasticsearch search request failed:', err);
      // Fallback search in PostgreSQL via Prisma on failure
      return this.prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        },
        include: {
          category: true,
          brand: true,
        },
        take: limit,
      });
    }
  }
}
