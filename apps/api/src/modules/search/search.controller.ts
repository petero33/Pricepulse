import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Fuzzy search products via Elasticsearch (with SQL fallback)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of matching products returned',
  })
  search(@Query('q') q: string) {
    if (!q || q.trim() === '') {
      return [];
    }
    return this.searchService.searchProducts(q);
  }
}
