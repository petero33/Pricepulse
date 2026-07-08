import { Module } from '@nestjs/common';
import { ShoppingService } from './shopping.service';
import { ShoppingController } from './shopping.controller';
import { BasketOptimizerService } from './basket-optimizer.service';
import { StoresModule } from '../stores/stores.module';

@Module({
  imports: [StoresModule],
  controllers: [ShoppingController],
  providers: [ShoppingService, BasketOptimizerService],
  exports: [ShoppingService, BasketOptimizerService],
})
export class ShoppingModule {}
