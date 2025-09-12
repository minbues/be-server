import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Errors } from '../../../errors/errors';
import { convertToSlug } from '../../../utils/transformers/slug.transformer';
import { removeVietnameseTones } from '../../../utils/transformers/vietnamese.transformer';
import { Repository } from 'typeorm';
import { SegmentsService } from '../segments/segments.service';
import { SubCategoryEntity } from '../../../entities/sub-categories.entity';
import { CategoriesService } from '../categories/categories.service';
import {
  CreateSubCategoryDto,
  UpdateSubCategoryDto,
} from '../dto/subcategory.dto';

@Injectable()
export class SubCategoriesService {
  constructor(
    @InjectRepository(SubCategoryEntity)
    private readonly subCategoryRepository: Repository<SubCategoryEntity>,
    private readonly segmentService: SegmentsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  async findAll() {
    return this.subCategoryRepository.find();
  }

  async findById(id: string) {
    return this.subCategoryRepository.findOne({ where: { id } });
  }

  async create(dto: CreateSubCategoryDto) {
    const segment = await this.segmentService.findById(dto.segmentId);
    if (!segment) {
      throw new BadRequestException(Errors.SEGMENT_NOT_FOUND);
    }

    const category = await this.categoriesService.findById(dto.categoryId);
    if (!category) {
      throw new BadRequestException(Errors.PRODUCT_CATEGORY_NOT_FOUND);
    }

    const subCateSlug = convertToSlug(removeVietnameseTones(dto.name));

    const exitingSubCategory = await this.subCategoryRepository.findOne({
      where: { subCateSlug, categoryId: dto.categoryId },
    });

    if (exitingSubCategory) {
      throw new BadRequestException(Errors.SUBCATEGORY_EXISTED);
    }

    return this.subCategoryRepository.save({
      ...dto,
      subCateSlug,
      segmentId: dto.segmentId,
      categoryId: dto.categoryId,
    });
  }

  async update(id: string, dto: UpdateSubCategoryDto) {
    const segment = await this.segmentService.findById(dto.segmentId);
    if (!segment) {
      throw new BadRequestException(Errors.SEGMENT_NOT_FOUND);
    }

    const category = await this.categoriesService.findById(dto.categoryId);
    if (!category) {
      throw new BadRequestException(Errors.PRODUCT_CATEGORY_NOT_FOUND);
    }

    const subCateSlug = convertToSlug(removeVietnameseTones(dto.name));

    await this.subCategoryRepository.update(id, {
      categoryId: dto.categoryId,
      isActive: dto.isActive,
      name: dto.name,
      subCateSlug,
    });

    return this.findById(id);
  }

  async findAllForEvent() {
    const subCategories = await this.subCategoryRepository.find({
      relations: ['category', 'category.segment'],
      where: {
        isActive: true,
      },
    });

    return subCategories.map(({ category, ...rest }) => ({
      ...rest,
      name: `${category.segment.name} - ${category.name} - ${rest.name}`,
    }));
  }
}
