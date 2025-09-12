import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SegmentsService } from './segments/segments.service';
import { ProductsService } from './products.service';
import {
  ApiPagination,
  IPagination,
} from '../../utils/pagination/pagination.interface';
import { Pagination } from '../../utils/pagination/pagination.decorator';
import { CreateReviewDto } from './dto/review.dto';
import { ReviewService } from './reviews/reviews.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleEnum } from '../../utils/enum';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';

@ApiTags('Products-Public')
@Controller({
  path: 'products-public',
})
export class ProductsPublicController {
  constructor(
    private readonly segmentsService: SegmentsService,
    private readonly productsService: ProductsService,
    private readonly reviewService: ReviewService,
  ) {}

  @Get('segments')
  async getSegments() {
    return await this.segmentsService.findAllWithRelations();
  }

  @Get('categories')
  async getCategories() {
    return await this.segmentsService.findAllActiveCategories();
  }

  @Get('new-arrivals')
  @ApiPagination()
  async getNewArrivals(@Pagination() pagination: IPagination) {
    return await this.productsService.findNewArrivals(pagination);
  }

  @Get('best-sellers')
  @ApiPagination()
  async getBestSellers(@Pagination() pagination: IPagination) {
    return await this.productsService.findBestSellers(pagination);
  }

  @Get('products-with-condition')
  @ApiPagination()
  async getProductsWithCondition(
    @Pagination() pagination: IPagination,
    @Query('tag') tag?: 'best-seller' | 'new-arrival',
    @Query('search') search?: string,
    @Query('color') color?: string | string[], // cho phép color là chuỗi hoặc mảng chuỗi
    @Query('size') size?: string | string[], // cho phép size là chuỗi hoặc mảng chuỗi
  ) {
    const colorArray = Array.isArray(color) ? color : color ? [color] : [];
    const sizeArray = Array.isArray(size) ? size : size ? [size] : [];

    return await this.productsService.findProductsWithCondition(pagination, {
      tag,
      search,
      color: colorArray,
      size: sizeArray,
    });
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Post('create-review')
  async createReview(@Body() dto: CreateReviewDto, @Req() req: any) {
    const userId = req.user.id;
    return this.reviewService.createReview(dto, userId);
  }

  @Get('review-by-productId/:id')
  @ApiPagination()
  async getReviews(
    @Param('id') id: string,
    @Pagination() pagination: IPagination,
  ) {
    return this.reviewService.getReviewsByProduct(id, pagination);
  }
}
