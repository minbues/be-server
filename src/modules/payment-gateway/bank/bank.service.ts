import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankEntity } from '../../../entities/banks.entity';
import { CreateBankDto, GetBankDto } from '../dto/bank.dto';
import { PaginationHeaderHelper } from '../../../utils/pagination/pagination.helper';
import { replaceQuerySearch } from '../../../utils/helpers/common.helper';
import removeAccents from 'remove-accents';
import { IPagination } from '../../../utils/pagination/pagination.interface';

@Injectable()
export class BankService {
  constructor(
    @InjectRepository(BankEntity)
    private readonly bankRepository: Repository<BankEntity>,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  async create(dto: CreateBankDto) {
    const existingBank = await this.bankRepository.findOne({
      where: { accountNo: dto.accountNo },
    });

    if (existingBank) {
      throw new BadRequestException('Số tài khoản đã tồn tại trong hệ thống');
    }

    const bank = this.bankRepository.create(dto);
    return this.bankRepository.save(bank);
  }

  async findBanksWithConditions(query: GetBankDto, pagination: IPagination) {
    const queryBuilder = this.bankRepository.createQueryBuilder('bank');

    // Search theo accountName hoặc accountNo
    if (query?.search) {
      const search = removeAccents(replaceQuerySearch(query.search));
      queryBuilder.andWhere(
        `(LOWER(bank.accountName) ILIKE LOWER(:search) OR LOWER(bank.accountNo) ILIKE LOWER(:search))`,
        { search: `%${search.toLowerCase()}%` },
      );
    }

    // Filter theo isActive
    if (query?.isActive !== undefined) {
      queryBuilder.andWhere('bank.isActive = :isActive', {
        isActive: query.isActive,
      });
    }

    queryBuilder.orderBy('bank.createdAt', 'DESC');

    queryBuilder.skip(pagination.startIndex);
    queryBuilder.take(pagination.perPage);

    const [items, total] = await queryBuilder.getManyAndCount();

    const headers = this.paginationHeaderHelper.getHeaders(pagination, total);

    return {
      headers,
      items,
    };
  }

  async findOne(id: string) {
    const bank = await this.bankRepository.findOne({
      where: { id },
    });

    if (!bank) {
      throw new BadRequestException('Số tài khoản không tồn tại');
    }

    return bank;
  }

  async update(id: string, dto: CreateBankDto) {
    const bank = await this.findOne(id);

    if (dto.accountNo !== bank.accountNo) {
      const existingBank = await this.bankRepository.findOne({
        where: { accountNo: dto.accountNo },
      });

      if (existingBank) {
        throw new BadRequestException('Số tài khoản đã tồn tại trong hệ thống');
      }
    }

    Object.assign(bank, dto);
    return await this.bankRepository.save(bank);
  }

  async delete(id: string) {
    const bank = await this.findOne(id);
    bank.isActive = false;
    await this.bankRepository.save(bank); // cập nhật trạng thái isActive trước
    return await this.bankRepository.softDelete(id); // soft delete bằng id
  }

  async getBankWithFurthestLastOrder() {
    const bank = await this.bankRepository.findOne({
      where: { isActive: true },
      order: { lastOrder: 'ASC' },
    });

    if (!bank) {
      return null;
    }

    bank.lastOrder = new Date();
    await this.bankRepository.save(bank);

    return bank;
  }
}
