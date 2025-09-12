import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAddressEntity } from '../../entities/user-address.entity';
import { UserEntity } from '../../entities/users.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UserAddressMapper } from './user-address.mapper';

@Injectable()
export class UserAddressService {
  constructor(
    @InjectRepository(UserAddressEntity)
    private readonly addressRepo: Repository<UserAddressEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async create(userId: number, dto: CreateAddressDto) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const address = this.addressRepo.create({ ...dto, user });
    await this.addressRepo.save(address);

    return await this.getAddressAllWithRelations(userId);
  }

  async update(addressId: string, dto: UpdateAddressDto) {
    const address = await this.addressRepo.findOne({
      where: { id: addressId },
      relations: ['user'],
    });
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');

    Object.assign(address, dto);
    await this.addressRepo.save(address);

    return await this.getAddressAllWithRelations(address.user.id);
  }

  async delete(addressId: string) {
    const address = await this.addressRepo.findOne({
      where: { id: addressId },
      relations: ['user'],
    });
    if (!address) throw new NotFoundException('Địa chỉ không tồn tại');

    await this.addressRepo.softDelete(addressId);

    return await this.getAddressAllWithRelations(address.user.id);
  }

  async getUserAddresses(userId: number) {
    return await this.getAddressAllWithRelations(userId);
  }

  async setDefault(userId: number, addressId: string) {
    await this.addressRepo.update(
      { user: { id: userId } },
      { isDefault: false },
    );

    await this.addressRepo.update({ id: addressId }, { isDefault: true });

    return await this.getAddressAllWithRelations(userId);
  }

  async getAddressAllWithRelations(userId: number) {
    const addresses = await this.addressRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    if (!addresses) throw new NotFoundException('Địa chỉ không tồn tại');

    return UserAddressMapper.toResponse(addresses);
  }

  async findOne(addressId: string) {
    const address = await this.addressRepo.findOne({
      where: { id: addressId },
    });

    return address;
  }
}
