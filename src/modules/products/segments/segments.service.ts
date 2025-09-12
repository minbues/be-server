import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SegmentEntity } from '../../../entities/segments.entity';
import { Brackets, Repository } from 'typeorm';
import {
  CreateSegmentDto,
  GetSegmentDto,
  UpdateSegmentDto,
} from '../dto/segment.dto';
import { convertToSlug } from '../../../utils/transformers/slug.transformer';
import { removeVietnameseTones } from '../../../utils/transformers/vietnamese.transformer';
import { Errors } from '../../../errors/errors';
import { IPagination } from '../../../utils/pagination/pagination.interface';
import { PaginationHeaderHelper } from '../../../utils/pagination/pagination.helper';

@Injectable()
export class SegmentsService {
  constructor(
    @InjectRepository(SegmentEntity)
    private readonly segmentRepository: Repository<SegmentEntity>,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  async findAll() {
    return this.segmentRepository.find();
  }

  async findAllWithRelations() {
    return this.segmentRepository
      .createQueryBuilder('segment')
      .leftJoinAndSelect('segment.categories', 'categories')
      .leftJoinAndSelect('categories.subCategories', 'subCategories')
      .orderBy('segment.createdAt', 'DESC')
      .getMany();
  }

  async findAllActiveCategories() {
    const segments = await this.segmentRepository
      .createQueryBuilder('segment')
      .leftJoinAndSelect(
        'segment.categories',
        'categories',
        'categories.isActive = :categoryActive',
        { categoryActive: true },
      )
      .leftJoinAndSelect(
        'categories.subCategories',
        'subCategories',
        'subCategories.isActive = :subCategoryActive',
        { subCategoryActive: true },
      )
      .where('segment.isActive = :segmentActive', { segmentActive: true })
      .orderBy('segment.createdAt', 'DESC')
      .getMany();

    const filteredSegments = segments.filter(
      (segment) =>
        segment.categories &&
        segment.categories.length > 0 &&
        segment.categories.every((category) => category.subCategories),
    );

    const mappedData = filteredSegments.flatMap((segment) =>
      segment.categories
        .filter(
          (category) =>
            Array.isArray(category.subCategories) &&
            category.subCategories.length > 0,
        )
        .map((category) => ({
          id: category.id,
          name: `${segment.name} - ${category.name}`,
          children: category.subCategories.map((sub) => ({
            id: sub.id,
            name: sub.name,
          })),
        })),
    );

    return mappedData;
  }

  async findAllWithRelationForCms(
    query: GetSegmentDto,
    pagination: IPagination,
  ) {
    const { name } = query;
    console.log('nameLogs', name);

    const queryBuilder = this.segmentRepository
      .createQueryBuilder('segment')
      .leftJoinAndSelect('segment.categories', 'categories')
      .leftJoinAndSelect('categories.subCategories', 'subCategories');

    if (name) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('segment.name ILIKE :name', {
            name: `%${name}%`,
          })
            .orWhere('categories.name ILIKE :name', {
              name: `%${name}%`,
            })
            .orWhere('subCategories.name ILIKE :name', {
              name: `%${name}%`,
            });
        }),
      );
    }

    queryBuilder.skip(pagination.startIndex).take(pagination.perPage);

    queryBuilder.orderBy('segment.createdAt', 'DESC');

    const segments = await queryBuilder.getMany();

    const total = await queryBuilder.getCount();

    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      total,
    );

    return {
      headers: responseHeaders,
      items: segments,
    };
  }

  async findById(id: string) {
    return this.segmentRepository.findOne({ where: { id } });
  }

  async create(dto: CreateSegmentDto) {
    const slug = convertToSlug(removeVietnameseTones(dto.name));

    const exitingSegment = await this.segmentRepository.findOne({
      where: { slug },
    });

    if (exitingSegment) {
      throw new BadRequestException(Errors.SEGMENT_EXISTED);
    }

    return this.segmentRepository.save({
      ...dto,
      slug,
    });
  }

  async update(id: string, dto: UpdateSegmentDto) {
    const slug = convertToSlug(removeVietnameseTones(dto.name));

    const existingSegment = await this.segmentRepository.findOne({
      where: { slug },
    });

    if (existingSegment && existingSegment.id !== id) {
      throw new BadRequestException(Errors.SEGMENT_EXISTED);
    }

    await this.segmentRepository.update(id, {
      ...dto,
      slug,
    });

    return this.findById(id);
  }
}
