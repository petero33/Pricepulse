import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { OcrService } from './ocr.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';

@ApiTags('ocr')
@Controller('ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('receipt'))
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        receipt: {
          type: 'string',
          format: 'binary',
          description: 'Receipt image file (jpg, png, pdf)',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload a receipt image for OCR processing' })
  @ApiResponse({ status: 201, description: 'Receipt uploaded and processed' })
  @ApiResponse({ status: 400, description: 'No file uploaded' })
  async uploadReceipt(
    @GetUser('id') userId: string,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No receipt file uploaded');
    }
    return this.ocrService.uploadAndProcessReceipt(
      userId,
      file.buffer,
      file.originalname,
    );
  }

  @Get('receipts/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get receipt details and OCR results' })
  @ApiResponse({ status: 200, description: 'Receipt details returned' })
  @ApiResponse({ status: 404, description: 'Receipt not found' })
  async getReceipt(@Param('id') id: string) {
    return this.ocrService.getReceiptDetails(id);
  }
}
