import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderItemEntity } from '../../entities/order-items.entity';
import { ProductEntity } from '../../entities/products.entity';
import { VariantSizeEntity } from '../../entities/variant-size.entity';
import { Repository } from 'typeorm';
import { InventoryModeEnum } from '../../utils/enum';

@Injectable()
export class InventoryHelper {
  constructor(
    @InjectRepository(VariantSizeEntity)
    private readonly variantSizeRepository: Repository<VariantSizeEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async updateInventoryQuantities(
    orderItems: OrderItemEntity[],
    mode: InventoryModeEnum,
  ) {
    console.log('orderItems', orderItems);
    for (const item of orderItems) {
      const variantSize = await this.variantSizeRepository.findOneBy({
        id: item.sizeId,
      });

      const product = await this.productRepository.findOneBy({
        id: item.productId,
      });

      if (!variantSize || !product) {
        throw new BadRequestException('Sản phẩm hoặc size không tồn tại');
      }

      const quantityChange = item.quantity;

      if (mode === InventoryModeEnum.DECREASE) {
        variantSize.inventory -= quantityChange;
        product.totalInventory -= quantityChange;

        variantSize.soldQuantity += quantityChange;
        product.totalSoldQuantity += quantityChange;
      } else {
        variantSize.inventory += quantityChange;
        product.totalInventory += quantityChange;

        variantSize.soldQuantity -= quantityChange;
        product.totalSoldQuantity -= quantityChange;
      }

      if (variantSize.inventory < 0 || product.totalInventory < 0) {
        throw new BadRequestException('Số lượng tồn kho không đủ');
      }

      await this.variantSizeRepository.save(variantSize);
      await this.productRepository.save(product);
    }
  }
}
