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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BankService } from './bank.service';
import { CreateBankDto, GetBankDto } from '../dto/bank.dto';
import {
  ApiPagination,
  IPagination,
} from '../../../utils/pagination/pagination.interface';
import { Pagination } from '../../../utils/pagination/pagination.decorator';

// @UseGuards(CmsGuard)
@ApiTags('Bank')
@Controller('bank')
// @ApiBearerAuth()
// @UseGuards(JWTAuthGuard)
export class BankController {
  constructor(private readonly bankService: BankService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBankDto) {
    return await this.bankService.create(dto);
  }

  @Get()
  @ApiPagination()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: GetBankDto,
    @Pagination() pagination: IPagination,
  ) {
    return await this.bankService.findBanksWithConditions(query, pagination);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.bankService.findOne(id);
  }

  @Patch(':id')
  //   @UseGuards(JwtAuthGuard, RolesGuard)
  //   @Roles(RoleEnum.ADMIN)
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateBankDto: CreateBankDto) {
    return await this.bankService.update(id, updateBankDto);
  }

  @Delete(':id')
  //   @UseGuards(JwtAuthGuard, RolesGuard)
  //   @Roles(RoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return await this.bankService.delete(id);
  }
}
