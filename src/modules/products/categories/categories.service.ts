import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from '../../../entities/categories.entity';
import { Errors } from '../../../errors/errors';
import { convertToSlug } from '../../../utils/transformers/slug.transformer';
import { removeVietnameseTones } from '../../../utils/transformers/vietnamese.transformer';
import { Repository } from 'typeorm';
import { CreateCategoryDto, UpdateCategoryDto } from '../dto/category.dto';
import { SegmentsService } from '../segments/segments.service';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private readonly segmentService: SegmentsService,
  ) {}

  async findAll() {
    return this.categoryRepository.find();
  }

  async findById(id: string) {
    return this.categoryRepository.findOne({ where: { id } });
  }

  async create(dto: CreateCategoryDto) {
    const segment = await this.segmentService.findById(dto.segmentId);
    if (!segment) {
      throw new BadRequestException(Errors.SEGMENT_NOT_FOUND);
    }

    const cateSlug = convertToSlug(removeVietnameseTones(dto.name));

    const exitingCategory = await this.categoryRepository.findOne({
      where: { cateSlug, segmentId: dto.segmentId },
    });

    if (exitingCategory) {
      throw new BadRequestException(Errors.PRODUCT_CATEGORY_EXISTED);
    }

    return this.categoryRepository.save({
      ...dto,
      cateSlug,
      segmentId: dto.segmentId,
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const segment = await this.segmentService.findById(dto.segmentId);
    if (!segment) {
      throw new BadRequestException(Errors.SEGMENT_NOT_FOUND);
    }

    const cateSlug = convertToSlug(removeVietnameseTones(dto.name));

    await this.categoryRepository.update(id, {
      ...dto,
      cateSlug,
    });

    return this.findById(id);
  }

  async findAllForEvent() {
    const categories = await this.categoryRepository.find({
      relations: ['segment'],
      where: {
        isActive: true,
      },
    });
    return categories.map(({ segment, ...rest }) => ({
      ...rest,
      name: `${segment.name} - ${rest.name}`,
    }));
  }
}
