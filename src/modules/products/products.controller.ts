import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SegmentsService } from './segments/segments.service';
import {
  CreateSegmentDto,
  GetSegmentDto,
  UpdateSegmentDto,
} from './dto/segment.dto';
import { CategoriesService } from './categories/categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { SubCategoriesService } from './subcategories/subcategories.service';
import {
  CreateSubCategoryDto,
  UpdateSubCategoryDto,
} from './dto/subcategory.dto';
import {
  CreateProductDto,
  GetProductDto,
  UpdateDiscountBulk,
  UpdateProductDto,
} from './dto/product.dto';
import { ProductsService } from './products.service';
import { Pagination } from '../../utils/pagination/pagination.decorator';
import {
  ApiPagination,
  IPagination,
} from '../../utils/pagination/pagination.interface';

@ApiTags('Products')
@Controller({
  path: 'products',
  version: '1',
})
export class ProductsController {
  constructor(
    private readonly segmentsService: SegmentsService,
    private readonly categoriesService: CategoriesService,
    private readonly subCategoriesService: SubCategoriesService,
    private readonly productsService: ProductsService,
  ) {}

  @Post('create-segment')
  @HttpCode(HttpStatus.CREATED)
  async createSegment(@Body() dto: CreateSegmentDto) {
    return await this.segmentsService.create(dto);
  }

  @Post('create-category')
  @HttpCode(HttpStatus.CREATED)
  async createCategory(@Body() dto: CreateCategoryDto) {
    return await this.categoriesService.create(dto);
  }

  @Post('create-subcategory')
  @HttpCode(HttpStatus.CREATED)
  async createSubcategory(@Body() dto: CreateSubCategoryDto) {
    return await this.subCategoriesService.create(dto);
  }

  @Post('create-product')
  @HttpCode(HttpStatus.CREATED)
  async createProduct(@Body() dto: CreateProductDto) {
    return await this.productsService.create(dto);
  }

  @Patch('archive/:id')
  @HttpCode(HttpStatus.OK)
  async archiveProduct(@Param('id') productId: string) {
    return await this.productsService.archive(productId);
  }

  @Patch('update-product/:id')
  @HttpCode(HttpStatus.OK)
  async updateBasicProduct(
    @Param('id') productId: string,
    @Body() dto: UpdateProductDto,
  ) {
    return await this.productsService.update(productId, dto);
  }

  @Get('all')
  @ApiPagination()
  @HttpCode(HttpStatus.OK)
  async findAllProduct(
    @Query() query: GetProductDto,
    @Pagination() pagination: IPagination,
  ) {
    return await this.productsService.findAllProductCms(query, pagination);
  }

  @Get('all-category')
  @HttpCode(HttpStatus.OK)
  async getAllCategory() {
    return await this.categoriesService.findAllForEvent();
  }

  @Get('all-subcategory')
  @HttpCode(HttpStatus.OK)
  async getAllSubCategory() {
    return await this.subCategoriesService.findAllForEvent();
  }

  @Get('segments-paging')
  @ApiPagination()
  @HttpCode(HttpStatus.OK)
  async getSegments(
    @Query() query: GetSegmentDto,
    @Pagination() pagination: IPagination,
  ) {
    return await this.segmentsService.findAllWithRelationForCms(
      query,
      pagination,
    );
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async findProductByIdCms(@Param('id') productId: string) {
    return await this.productsService.findProductByIdCms(productId);
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  async deleteProduct(@Param('id') productId: string) {
    return await this.productsService.delete(productId);
  }

  @Patch('update-segment/:id')
  @HttpCode(HttpStatus.OK)
  async updateSegment(
    @Param('id') segmentId: string,
    @Body() dto: UpdateSegmentDto,
  ) {
    return await this.segmentsService.update(segmentId, dto);
  }

  @Patch('update-category/:id')
  @HttpCode(HttpStatus.OK)
  async updateCategory(
    @Param('id') categoryId: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return await this.categoriesService.update(categoryId, dto);
  }

  @Patch('update-subcategory/:id')
  @HttpCode(HttpStatus.OK)
  async updateSubCategory(
    @Param('id') subCategoryId: string,
    @Body() dto: UpdateSubCategoryDto,
  ) {
    return await this.subCategoriesService.update(subCategoryId, dto);
  }

  @Patch('discount/bulk-update')
  @HttpCode(HttpStatus.OK)
  async bulkUpdateDiscount(@Body() dto: UpdateDiscountBulk) {
    return await this.productsService.bulkUpdateDiscount(dto);
  }
}
