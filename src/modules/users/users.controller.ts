import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  Patch,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CreateUserByAdminDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from './users.service';
import { RolesGuard } from '../roles/roles.guard';
import { RoleEnum } from '../../utils/enum';
import { UserMapper } from './users.mappers';
import {
  ApiPagination,
  IPagination,
} from '../../utils/pagination/pagination.interface';
import { FilterUserDto } from './dto/query-user.dto';
import { Pagination } from '../../utils/pagination/pagination.decorator';
import { Errors } from '../../errors/errors';

@ApiTags('Users')
@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createProfileDto: CreateUserDto) {
    return this.usersService.create(createProfileDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiPagination()
  async findAll(
    @Query() query: FilterUserDto,
    @Pagination() pagination: IPagination,
  ) {
    return await this.usersService.findManyWithPagination(query, pagination);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(Number(id));
    if (!user) {
      throw new NotFoundException(Errors.USER_NOT_FOUND);
    }
    return UserMapper.toDomain(user);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.ADMIN, RoleEnum.USER)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch('me')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateUserDto,
  ) {
    const userId = req.user.id;
    const user = await this.usersService.update(
      Number(userId),
      updateProfileDto,
    );
    if (!user) {
      throw new NotFoundException(Errors.USER_NOT_FOUND);
    }
    return UserMapper.toDomain(user);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  update(@Param('id') id: string, @Body() updateProfileDto: UpdateUserDto) {
    return this.usersService.update(Number(id), updateProfileDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(Number(id));
  }

  @Post('by-admin')
  @HttpCode(HttpStatus.CREATED)
  createByAdmin(@Body() dto: CreateUserByAdminDto) {
    return this.usersService.createByAdmin(dto);
  }

  @Get(':id/point')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  getPoint(@Param('id') id: string) {
    return this.usersService.getPoint(Number(id));
  }
}
