import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserByAdminDto, CreateUserDto } from './dto/create-user.dto';
import bcrypt from 'bcryptjs';
import { UserEntity } from '../../entities/users.entity';
import { UserMapper } from './users.mappers';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleEntity } from '../../entities/roles.entity';
import { StatusEntity } from '../../entities/status.entity';
import { FilterUserDto } from './dto/query-user.dto';
import { IPagination } from '../../utils/pagination/pagination.interface';
import { PaginationHeaderHelper } from '../../utils/pagination/pagination.helper';
import removeAccents from 'remove-accents';
import { Errors } from '../../errors/errors';
import {
  joinFullName,
  replaceQuerySearch,
  splitFullName,
} from '../../utils/helpers/common.helper';
import { PointModeEnum } from '../../utils/enum';
import { config } from '../../config/app.config';

const { email } = config.root;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (createUserDto.password) {
      const salt = await bcrypt.genSalt();
      createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException(Errors.EMAIL_ALREADY_EXISTS);
    }

    const user = await this.usersRepository.save(
      UserMapper.toPersistence(createUserDto),
    );

    return UserMapper.toDomain(user);
  }

  async findManyWithPagination(
    filterOptions: FilterUserDto,
    pagination: IPagination,
  ) {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');
    queryBuilder
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.status', 'status')
      .leftJoinAndSelect('user.addresses', 'user-address');
    if (filterOptions?.role) {
      queryBuilder.andWhere('user.roleId = :roleId', {
        roleId: filterOptions.role,
      });
    }

    if (filterOptions?.search) {
      const search = removeAccents(replaceQuerySearch(filterOptions.search));
      queryBuilder.andWhere(
        'LOWER(user.email) ILIKE LOWER(:search) OR LOWER(user.firstName) ILIKE LOWER(:search) OR LOWER(user.lastName) ILIKE LOWER(:search) OR LOWER(user.fullName) ILIKE LOWER(:search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    const total = await queryBuilder.getCount();
    queryBuilder.orderBy('user.id', 'ASC');
    queryBuilder.skip(pagination.startIndex).take(pagination.perPage);

    const items = await queryBuilder.getMany();

    const headers = this.paginationHeaderHelper.getHeaders(pagination, total);

    return {
      headers,
      items: UserMapper.toDomainList(items),
    };
  }

  async findById(id: number) {
    return await this.usersRepository.findOne({ where: { id } });
  }

  async findByIdWithRelations(id: number) {
    return await this.usersRepository.findOne({
      where: { id },
      relations: ['role', 'status', 'addresses'],
    });
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) return null;

    if (updateUserDto.password && user.password !== updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    const updateData: any = { ...updateUserDto };

    if (updateUserDto.role) {
      updateData.role = { id: updateUserDto.role } as RoleEntity;
    }
    if (updateUserDto.status) {
      updateData.status = { id: updateUserDto.status } as StatusEntity;
    }

    if (updateUserDto.firstName && updateUserDto.lastName) {
      updateData.firstName = updateUserDto.firstName;
      updateData.lastName = updateUserDto.lastName;
      updateData.fullName = joinFullName(
        updateUserDto.lastName,
        updateUserDto.firstName,
      );
    } else if (updateUserDto.fullName) {
      const { firstName, lastName } = splitFullName(updateUserDto.fullName);
      updateData.firstName = firstName;
      updateData.lastName = lastName;
      updateData.fullName = updateUserDto.fullName;
    }

    await this.usersRepository.update(id, updateData);
    return this.findByIdWithRelations(id);
  }

  async remove(id: number) {
    await this.usersRepository.softDelete(id);
  }

  async createByAdmin(dto: CreateUserByAdminDto) {
    //Log check performance
    const start = Date.now();
    this.logger.log('Creating user by admin...');

    const salt = await bcrypt.genSalt();
    dto.password = await bcrypt.hash(dto.password, salt);

    const existingUser = await this.usersRepository.findOne({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException(Errors.EMAIL_ALREADY_EXISTS);
    }

    if (dto.fullName) {
      const { firstName, lastName } = splitFullName(dto.fullName);
      dto.firstName = firstName;
      dto.lastName = lastName;
    }

    const user = await this.usersRepository.save(
      UserMapper.createByAdminToPersistence(dto),
    );

    const userWithRelations = await this.findByIdWithRelations(Number(user.id));

    if (!userWithRelations) {
      throw new BadRequestException(Errors.USER_NOT_FOUND);
    }
    const end = Date.now();
    this.logger.log(`User created in ${end - start}ms`);
    return UserMapper.toDomain(userWithRelations);
  }

  async findAll() {
    return await this.usersRepository.find();
  }

  async updatePoint(
    userId: number,
    point: number | string,
    mode: PointModeEnum,
  ) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new BadRequestException(Errors.USER_NOT_FOUND);
    }

    const parsedPoint = Math.floor(Number(point));

    if (mode === PointModeEnum.SUBTRACT) {
      if (user.point < parsedPoint) {
        throw new BadRequestException('Không đủ điểm để sử dụng');
      }
      user.point -= parsedPoint;
    } else if (mode === PointModeEnum.ADD) {
      user.point += parsedPoint;
    }

    await this.usersRepository.save(user);
  }

  async getPoint(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException(Errors.USER_NOT_FOUND);
    }
    return user.point;
  }

  async findRootAdmin() {
    return await this.usersRepository.findOne({
      where: {
        email: email,
      },
    });
  }
}
