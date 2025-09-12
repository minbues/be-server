import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../../entities/products.entity';
import { In, Repository } from 'typeorm';
import { CategoriesService } from './categories/categories.service';
import { SegmentsService } from './segments/segments.service';
import { SubCategoriesService } from './subcategories/subcategories.service';
import { VariantEntity } from '../../entities/variants.entity';
import { VariantSizeEntity } from '../../entities/variant-size.entity';
import { VariantImageEntity } from '../../entities/variant-image.entity';
import {
  CreateProductDto,
  GetProductDto,
  UpdateDiscountBulk,
  UpdateProductDto,
} from './dto/product.dto';
import { Errors } from '../../errors/errors';
import { IPagination } from '../../utils/pagination/pagination.interface';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';
import { replaceQuerySearch } from '../../utils/helpers/common.helper';
import removeAccents from 'remove-accents';
import { ProductMapper } from './products.mapper';
import { validate as isUuid } from 'uuid';
import { DiscountEventEntity } from '../../entities/discount-event.entity';
import { SocketGateway } from '../wss/socket.gateway';
import { SocketEvent } from '../wss/wss.enum';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    @InjectRepository(VariantEntity)
    private readonly variantRepository: Repository<VariantEntity>,
    @InjectRepository(VariantSizeEntity)
    private readonly variantSizeRepository: Repository<VariantSizeEntity>,
    private readonly segmentsService: SegmentsService,
    private readonly categoriesService: CategoriesService,
    private readonly subCategoriesService: SubCategoriesService,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
    private readonly socketGateway: SocketGateway,
  ) {}
  async create(dto: CreateProductDto) {
    // Kiểm tra và lấy thông tin danh mục (category)
    const category = await this.categoriesService.findById(dto.categoryId);
    if (!category) {
      throw new BadRequestException(Errors.CATEGORY_NOT_FOUND);
    }

    // Kiểm tra và lấy thông tin danh mục con (subCategory)
    const subCategory = await this.subCategoriesService.findById(
      dto.subCategoryId,
    );
    if (!subCategory) {
      throw new BadRequestException(Errors.SUBCATEGORY_NOT_FOUND);
    }

    // Kiểm tra và lấy thông tin phân khúc (segment)
    const segment = await this.segmentsService.findById(dto.segmentId);
    if (!segment) {
      throw new BadRequestException(Errors.SEGMENT_NOT_FOUND);
    }

    // Chuẩn bị dữ liệu sản phẩm
    const payload = this.prepareProductToCreate(dto);

    // Tạo thực thể sản phẩm
    const product = this.productsRepository.create({
      ...payload,
      segmentId: segment.id,
      categoryId: category.id,
      subCategoryId: subCategory.id,
    });

    // Lưu sản phẩm vào cơ sở dữ liệu
    const savedProduct = await this.productsRepository.save(product);

    // Xử lý variants (biến thể)
    if (dto.variants && dto.variants.length > 0) {
      for (const variantDto of dto.variants) {
        const variant = this.productsRepository.manager.create(VariantEntity, {
          color: variantDto.color,
          isActive: variantDto.isActive ?? true,
          productId: savedProduct.id,
        });

        // Lưu biến thể
        const savedVariant =
          await this.productsRepository.manager.save(variant);

        // Xử lý sizes (kích thước) của biến thể
        if (variantDto.sizes && variantDto.sizes.length > 0) {
          for (const sizeDto of variantDto.sizes) {
            const variantSize = this.productsRepository.manager.create(
              VariantSizeEntity,
              {
                size: sizeDto.size,
                quantity: sizeDto.quantity,
                soldQuantity: sizeDto.soldQuantity ?? 0,
                inventory: sizeDto.inventory ?? sizeDto.quantity,
                isActive: sizeDto.isActive ?? true,
                variantId: savedVariant.id,
              },
            );

            // Lưu kích thước
            await this.productsRepository.manager.save(variantSize);
          }
        }

        // Xử lý images (hình ảnh) của biến thể
        if (variantDto.images && variantDto.images.length > 0) {
          for (const imageDto of variantDto.images) {
            const variantImage = this.productsRepository.manager.create(
              VariantImageEntity,
              {
                url: imageDto.url,
                variantId: savedVariant.id,
              },
            );

            await this.productsRepository.manager.save(variantImage);
          }
        }
      }
    }

    return this.findByIdWithRelations(savedProduct.id);
  }

  async findByIdWithRelations(id: string) {
    return this.productsRepository.findOne({
      where: { id },
      relations: [
        'variants',
        'variants.sizes',
        'variants.images',
        'segment',
        'category',
        'subCategory',
      ],
    });
  }

  async findAllWithRelations() {
    return this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.sizes', 'sizes')
      .leftJoinAndSelect('variants.images', 'images')
      .getMany();
  }

  private prepareProductToCreate(dto: CreateProductDto) {
    let totalQuantity = 0;
    let totalSoldQuantity = 0;

    // Tính toán tổng số lượng và số lượng đã bán
    if (dto.variants?.length) {
      dto.variants.forEach((variant) => {
        if (variant.sizes?.length) {
          variant.sizes.forEach((size) => {
            size.soldQuantity = size.soldQuantity ?? 0; // Mặc định chưa bán
            size.inventory = size.inventory ?? size.quantity; // Ban đầu, inventory = quantity

            totalQuantity += size.quantity;
            totalSoldQuantity += size.soldQuantity;
          });
        }
      });
    }

    // Tính tổng tồn kho
    const totalInventory = totalQuantity - totalSoldQuantity;

    return {
      ...dto,
      totalQuantity,
      totalSoldQuantity,
      totalInventory,
    };
  }

  async findNewArrivals(pagination: IPagination) {
    return this.findProducts(pagination, 'createdAt', 'DESC');
  }

  async findBestSellers(pagination: IPagination) {
    return this.findProducts(pagination, 'totalSoldQuantity', 'DESC');
  }

  async findProducts(
    pagination: IPagination,
    sortField: string,
    sortOrder: 'ASC' | 'DESC',
  ) {
    const queryBuilder = this.productsRepository.createQueryBuilder('product');
    queryBuilder
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.sizes', 'sizes')
      .leftJoinAndSelect('variants.images', 'images')
      .leftJoinAndSelect('product.segment', 'segment')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory');

    queryBuilder.where('product.isArchived = :isArchived', {
      isArchived: false,
    });
    queryBuilder.andWhere('product.isActive = :isActive', { isActive: true });
    queryBuilder.andWhere('segment.isActive = :isActive', { isActive: true });
    queryBuilder.andWhere('category.isActive = :isActive', { isActive: true });
    queryBuilder.andWhere('subCategory.isActive = :isActive', {
      isActive: true,
    });

    queryBuilder.orderBy(`product.${sortField}`, sortOrder);

    queryBuilder.skip(pagination.startIndex);
    queryBuilder.take(pagination.perPage);

    const products = await queryBuilder.getMany();

    const total = await queryBuilder.getCount();

    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      total,
    );

    return {
      headers: responseHeaders,
      items: ProductMapper.toDomainList(products),
    };
  }

  async findAllProductCms(query: GetProductDto, pagination: IPagination) {
    const queryBuilder = this.productsRepository.createQueryBuilder('product');

    queryBuilder
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.sizes', 'sizes')
      .leftJoinAndSelect('variants.images', 'images')
      .leftJoinAndSelect('product.segment', 'segment')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory');

    if (query?.name) {
      const name = removeAccents(replaceQuerySearch(query.name));
      queryBuilder.andWhere('LOWER(product.name) ILIKE LOWER(:name)', {
        name: `%${name.toLowerCase()}%`,
      });
    }

    if (query?.isArchived !== undefined) {
      queryBuilder.andWhere('product.isArchived = :isArchived', {
        isArchived: query.isArchived,
      });
    } else {
      queryBuilder.andWhere('product.isArchived = :isArchived', {
        isArchived: false,
      });
    }

    if (query?.isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    queryBuilder.orderBy('product.createdAt', 'DESC');

    queryBuilder.skip(pagination.startIndex);
    queryBuilder.take(pagination.perPage);

    const products = await queryBuilder.getMany();

    const total = await queryBuilder.getCount();

    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      total,
    );

    return {
      headers: responseHeaders,
      items: ProductMapper.toDomainList(products),
    };
  }

  async archive(productId: string) {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
      relations: ['variants', 'variants.sizes'],
    });

    if (!product) {
      throw new BadRequestException(Errors.PRODUCT_NOT_FOUND);
    }

    for (const variant of product.variants) {
      variant.isActive = false;

      for (const size of variant.sizes) {
        size.isActive = false;
      }

      await this.productsRepository.manager.save(variant);
    }

    product.isArchived = true;
    product.isActive = false;

    // Lưu sản phẩm
    await this.productsRepository.save(product);

    // Trả về sản phẩm đã cập nhật
    return await this.findByIdWithRelations(productId);
  }

  async delete(productId: string) {
    return await this.productsRepository.softDelete({ id: productId });
  }

  private calculateProductInventory(product: ProductEntity) {
    let totalQuantity = 0;
    let totalSoldQuantity = 0;

    product.variants.forEach((variant) => {
      variant.sizes.forEach((size) => {
        totalQuantity += size.quantity;
        totalSoldQuantity += size.soldQuantity;
      });
    });

    const totalInventory = totalQuantity - totalSoldQuantity;

    return { totalQuantity, totalSoldQuantity, totalInventory };
  }

  async update(productId: string, dto: UpdateProductDto) {
    // Tìm sản phẩm hiện tại
    const existingProduct = await this.productsRepository.findOne({
      where: { id: productId },
      relations: ['variants', 'variants.sizes', 'variants.images'],
    });

    if (!existingProduct) {
      throw new BadRequestException(Errors.PRODUCT_NOT_FOUND);
    }

    let newSegmentId = existingProduct.segmentId;

    // Nếu segment hoặc categories thay đổi, tìm segment mới
    if (
      dto.segmentId !== existingProduct.segmentId ||
      dto.categoryId !== existingProduct.categoryId ||
      dto.subCategoryId !== existingProduct.subCategoryId
    ) {
      const category = await this.categoriesService.findById(dto.categoryId);
      if (!category) {
        throw new BadRequestException(Errors.CATEGORY_NOT_FOUND);
      }

      const subCategory = await this.subCategoriesService.findById(
        dto.subCategoryId,
      );
      if (!subCategory) {
        throw new BadRequestException(Errors.SUBCATEGORY_NOT_FOUND);
      }

      const segment = await this.segmentsService.findById(dto.segmentId);
      if (!segment) {
        throw new BadRequestException(Errors.SEGMENT_NOT_FOUND);
      }

      newSegmentId = segment.id;
    }

    const priceChanged = dto.price !== existingProduct.price;

    // Cập nhật thông tin sản phẩm
    Object.assign(existingProduct, {
      name: dto.name,
      description: dto.description,
      price: dto.price,
      isActive: dto.isActive,
      isArchived: dto.isArchived,
      segmentId: newSegmentId,
      categoryId: dto.categoryId,
      subCategoryId: dto.subCategoryId,
      discount: dto.discount,
    });

    let existingVariant;
    // Xử lý variants (biến thể)
    if (dto.variants && dto.variants.length > 0) {
      for (const newVariant of dto.variants) {
        existingVariant = existingProduct.variants.find(
          (v) => v.id === newVariant.id,
        );

        if (existingVariant) {
          // Cập nhật trạng thái và danh sách size
          existingVariant.isActive = newVariant.isActive;
          await this.productsRepository.manager.save(existingVariant);

          let existingSize;
          for (const newSize of newVariant.sizes) {
            existingSize = existingVariant.sizes.find(
              (s) => s.id === newSize.id || s.size === newSize.size,
            );

            if (existingSize) {
              existingSize.quantity = newSize.quantity;
              existingSize.isActive = newSize.isActive;
              existingSize.inventory =
                newSize.quantity - existingSize.soldQuantity;

              await this.productsRepository.manager.save(existingSize);
            } else {
              const variantSize = this.productsRepository.manager.create(
                VariantSizeEntity,
                {
                  size: newSize.size,
                  quantity: newSize.quantity,
                  soldQuantity: 0,
                  inventory: newSize.quantity,
                  isActive: newSize.isActive ?? true,
                  variantId: existingVariant.id,
                },
              );
              await this.productsRepository.manager.save(variantSize);
            }
          }

          // Xử lý images (hình ảnh) của biến thể
          if (newVariant.images && newVariant.images.length > 0) {
            for (const newImage of newVariant.images) {
              const existingImage = existingVariant.images.find(
                (img) => img.id === newImage.id,
              );

              if (existingImage) {
                // Cập nhật hình ảnh nếu đã tồn tại
                existingImage.url = newImage.url;
                await this.productsRepository.manager.save(existingImage);
              } else {
                // Tạo mới hình ảnh nếu chưa tồn tại
                const variantImage = this.productsRepository.manager.create(
                  VariantImageEntity,
                  {
                    url: newImage.url,
                    variantId: existingVariant.id,
                  },
                );
                await this.productsRepository.manager.save(variantImage);
              }
            }
          }
        } else {
          // Nếu variant mới, thêm vào danh sách
          const variant = this.productsRepository.manager.create(
            VariantEntity,
            {
              color: newVariant.color,
              isActive: newVariant.isActive ?? true,
              productId: existingProduct.id,
              product: existingProduct,
            },
          );

          const savedVariant =
            await this.productsRepository.manager.save(variant);

          for (const size of newVariant.sizes) {
            const variantSize = this.productsRepository.manager.create(
              VariantSizeEntity,
              {
                size: size.size,
                quantity: size.quantity,
                soldQuantity: 0,
                inventory: size.quantity,
                isActive: size.isActive ?? true,
                variantId: savedVariant.id,
              },
            );
            await this.productsRepository.manager.save(variantSize);
          }

          for (const image of newVariant.images) {
            const variantImage = this.productsRepository.manager.create(
              VariantImageEntity,
              {
                url: image.url,
                variantId: savedVariant.id,
              },
            );
            await this.productsRepository.manager.save(variantImage);
          }
        }
      }
    }

    // Tính toán tổng số lượng tồn kho
    const { totalQuantity, totalSoldQuantity, totalInventory } =
      this.calculateProductInventory(existingProduct);

    existingProduct.totalQuantity = totalQuantity;
    existingProduct.totalSoldQuantity = totalSoldQuantity;
    existingProduct.totalInventory = totalInventory;

    // Lưu thay đổi vào DB
    await this.productsRepository.save(existingProduct);

    // Trả về sản phẩm đã cập nhật
    const product = await this.findByIdWithRelations(productId);

    if (!product) {
      throw new BadRequestException(Errors.PRODUCT_NOT_FOUND);
    }

    if (priceChanged) {
      this.socketGateway.emitProductPriceChangedToAll(productId, dto.price);
    }

    return ProductMapper.toDomain(product);
  }

  async findProductByIdCms(id: string) {
    const product = await this.findByIdWithRelations(id);
    if (!product) {
      throw new BadRequestException(Errors.PRODUCT_NOT_FOUND);
    }
    return ProductMapper.toDomain(product);
  }

  async validateProduct(productId: string): Promise<ProductEntity> {
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Sản phẩm không tồn tại');
    if (!product.isActive)
      throw new BadRequestException('Sản phẩm đã ngừng bán');
    return product;
  }

  async validateVariant(variantId: string): Promise<VariantEntity> {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId },
      relations: ['images'],
    });
    if (!variant) throw new NotFoundException('Màu sản phẩm không tồn tại');
    if (!variant.isActive)
      throw new BadRequestException('Màu sản phẩm đã ngừng bán');
    return variant;
  }

  async validateSize(sizeId: string): Promise<VariantSizeEntity> {
    const size = await this.variantSizeRepository.findOne({
      where: { id: sizeId },
    });
    if (!size) throw new NotFoundException('Kích thước không tồn tại');
    if (!size.isActive)
      throw new BadRequestException('Kích thước đã ngừng bán');
    return size;
  }

  async findProductsWithCondition(
    pagination: IPagination,
    filters: {
      tag?: 'best-seller' | 'new-arrival' | 'event';
      search?: string;
      color?: string[];
      size?: string[];
    },
  ) {
    const { tag, search, color, size } = filters;

    let sortField = 'createdAt';
    const sortOrder: 'ASC' | 'DESC' = 'DESC';

    if (tag === 'best-seller') {
      sortField = 'totalSoldQuantity';
    }

    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.sizes', 'sizes')
      .leftJoinAndSelect('variants.images', 'images')
      .leftJoinAndSelect('product.segment', 'segment')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.subCategory', 'subCategory')
      .where('product.isArchived = false')
      .andWhere('product.isActive = true');

    if (search) {
      if (isUuid(search)) {
        queryBuilder.andWhere(
          `(product.id = :search OR 
            product.segmentId = :search OR 
            category.id = :search OR 
            subCategory.id = :search)`,
          { search },
        );
      } else {
        queryBuilder.andWhere(
          `(product.name ILIKE :search OR 
            segment.name ILIKE :search OR 
            category.name ILIKE :search OR 
            subCategory.name ILIKE :search)`,
          { search: `%${search}%` },
        );
      }
    }

    // Nếu color là một mảng, sử dụng IN để lọc
    if (color && color.length > 0) {
      queryBuilder.andWhere('variants.color ILIKE ANY (:colors)', {
        colors: color.map((c) => `%${c}%`), // Chuyển các màu thành dạng LIKE
      });
    }

    // Nếu size là một mảng, sử dụng IN để lọc
    if (size && size.length > 0) {
      queryBuilder.andWhere('sizes.size ILIKE ANY (:sizes)', {
        sizes: size.map((s) => `%${s}%`), // Chuyển các kích thước thành dạng LIKE
      });
    }

    queryBuilder.orderBy(`product.${sortField}`, sortOrder);
    queryBuilder.skip(pagination.startIndex).take(pagination.perPage);

    const [products, total] = await queryBuilder.getManyAndCount();

    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      total,
    );

    return {
      headers: responseHeaders,
      items: ProductMapper.toDomainList(products),
    };
  }

  async applyAllShopDiscount(event: DiscountEventEntity) {
    await this.productsRepository.update(
      {},
      {
        discount: event.discount,
      },
    );
    return { message: 'Đã áp dụng giảm giá toàn shop' };
  }

  async applyCategoryDiscount(event: DiscountEventEntity) {
    if (!event.pid) {
      throw new BadRequestException('Thiếu thông tin category id (pid)');
    }

    await this.productsRepository.update(
      { category: { id: event.pid } },
      {
        discount: event.discount,
      },
    );
    return { message: `Đã áp dụng giảm giá cho danh mục ${event.pid}` };
  }

  async applySubCategoryDiscount(event: DiscountEventEntity) {
    if (!event.pid) {
      throw new BadRequestException('Thiếu thông tin subcategory id (pid)');
    }

    await this.productsRepository.update(
      { subCategory: { id: event.pid } },
      {
        discount: event.discount,
      },
    );
    return { message: `Đã áp dụng giảm giá cho danh mục con ${event.pid}` };
  }

  async bulkUpdateDiscount(dto: UpdateDiscountBulk) {
    const { ids, discount } = dto;

    await this.productsRepository.update({ id: In(ids) }, { discount });

    const result = await this.productsRepository.find({
      where: { id: In(ids) },
    });

    return result;
  }
}
