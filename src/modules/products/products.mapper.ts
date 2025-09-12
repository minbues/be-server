import { ProductEntity } from '../../entities/products.entity';

export class ProductMapper {
  static toDomain(raw: ProductEntity) {
    const pantsSizeOrder = [
      '28',
      '29',
      '30',
      '31',
      '32',
      '33',
      '34',
      '35',
      '36',
      '37',
      '38',
      '39',
      '40',
      '41',
    ];

    const shirtSizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
    return {
      id: raw.id,
      name: raw.name,
      price: raw.price,
      description: raw.description,
      isActive: raw.isActive,
      isArchived: raw.isArchived,
      discount: raw.discount,
      totalQuantity: raw.totalQuantity,
      totalSoldQuantity: raw.totalSoldQuantity,
      totalInventory: raw.totalInventory,
      averageRating: Number(raw.averageRating),
      totalReviews: raw.totalReviews,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      segment: raw.segment
        ? {
            id: raw.segment.id,
            name: raw.segment.name,
            slug: raw.segment.slug,
            category: raw.category
              ? {
                  id: raw.category.id,
                  name: raw.category.name,
                  cateSlug: raw.category.cateSlug,
                  subCategory: raw.subCategory
                    ? {
                        id: raw.subCategory.id,
                        name: raw.subCategory.name,
                        subCateSlug: raw.subCategory.subCateSlug,
                      }
                    : null,
                }
              : null,
          }
        : null,
      variants: raw.variants
        ? raw.variants.map((variant) => ({
            id: variant.id,
            color: variant.color,
            isActive: variant.isActive,
            sizes: variant.sizes
              ? variant.sizes
                  .slice() // tạo copy để tránh mutate
                  .sort((a, b) => {
                    const aIndex =
                      pantsSizeOrder.indexOf(a.size) !== -1
                        ? pantsSizeOrder.indexOf(a.size)
                        : shirtSizeOrder.indexOf(a.size);
                    const bIndex =
                      pantsSizeOrder.indexOf(b.size) !== -1
                        ? pantsSizeOrder.indexOf(b.size)
                        : shirtSizeOrder.indexOf(b.size);
                    return aIndex - bIndex;
                  })
                  .map((size) => ({
                    id: size.id,
                    size: size.size,
                    quantity: size.quantity,
                    soldQuantity: size.soldQuantity,
                    inventory: size.inventory,
                    isActive: size.isActive,
                  }))
              : [],
            images: variant.images
              ? variant.images.map((image) => ({
                  id: image.id,
                  url: image.url,
                }))
              : [],
          }))
        : [],
    };
  }

  static toDomainList(rawList: ProductEntity[] | null) {
    if (!rawList || rawList.length === 0) return [];
    return rawList.map((raw) => this.toDomain(raw));
  }
}
