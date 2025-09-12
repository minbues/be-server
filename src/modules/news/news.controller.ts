import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateNewDto } from './dto/update-new.dto';
import { NewService } from './news.service';

// @UseGuards(CmsGuard)
@ApiTags('News')
@Controller('news')
// @ApiBearerAuth()
// @UseGuards(JWTAuthGuard)
export class NewsController {
  constructor(private readonly newService: NewService) {}

  @Post('update')
  // @Roles(ERole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async updateOrCreateNew(@Body() dto: UpdateNewDto) {
    return await this.newService.updateOrCreateNew(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findNew() {
    return await this.newService.findNew();
  }
}
