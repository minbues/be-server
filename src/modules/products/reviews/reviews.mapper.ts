import { ProductReviewEntity } from '../../../entities/product-review.entity';

export class ReviewMapper {
  static toDomain(raw: ProductReviewEntity) {
    return {
      id: raw.id,
      rating: raw.rating,
      comment: raw.comment,
      createdAt: raw.createdAt,
      user: raw.user
        ? {
            id: raw.user.id,
            fullName: raw.user.fullName,
            email: raw.user.email,
          }
        : null,
      orderItem: raw.orderItem
        ? {
            id: raw.orderItem.id,
            productName: raw.orderItem.productName,
            variantId: raw.orderItem.variantId,
            color: raw.orderItem.color,
            size: raw.orderItem.sizeValue,
            quantity: raw.orderItem.quantity,
          }
        : null,
    };
  }

  static toDomainList(rawList: ProductReviewEntity[] | null) {
    if (!rawList || rawList.length === 0) return [];
    return rawList.map((raw) => this.toDomain(raw));
  }
}
