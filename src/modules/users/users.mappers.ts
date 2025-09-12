import { RoleEntity } from '../../entities/roles.entity';
import { UserEntity } from '../../entities/users.entity';
import { StatusEntity } from '../../entities/status.entity';
import { CreateUserByAdminDto, CreateUserDto } from './dto/create-user.dto';
import { AuthProvidersEnum, StatusEnum } from '../../utils/enum';
import { joinFullName, splitFullName } from '../../utils/helpers/common.helper';

export class UserMapper {
  static toDomain(raw: UserEntity) {
    return {
      id: raw.id,
      email: raw.email,
      firstName: raw.firstName,
      lastName: raw.lastName,
      fullName: raw.fullName,
      provider: raw.provider,
      socialId: raw.socialId,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      point: raw.point,
      role: raw.role ? { id: raw.role.id, name: raw.role.name } : null,
      status: raw.status ? { id: raw.status.id, name: raw.status.name } : null,
      addresses: raw.addresses
        ? raw.addresses.map((address) => ({
            id: address.id,
            street: address.street,
            city: address.city,
            ward: address.ward,
            country: address.country,
            isDefault: address.isDefault,
          }))
        : [],
    };
  }

  static toDomainList(rawList: UserEntity[] | null) {
    if (!rawList || rawList.length === 0) return [];
    return rawList.map((raw) => this.toDomain(raw));
  }

  static toPersistence(dto: CreateUserDto): UserEntity {
    const entity = new UserEntity();
    entity.email = dto.email;
    entity.password = dto.password;
    entity.firstName = dto.firstName;
    entity.lastName = dto.lastName;
    entity.provider = dto.provider;
    entity.socialId = dto.socialId;
    entity.fullName = joinFullName(dto.lastName, dto.firstName);
    if (dto.role) {
      entity.role = new RoleEntity();
      entity.role.id = dto.role;
    }

    if (dto.status) {
      entity.status = new StatusEntity();
      entity.status.id = dto.status;
    }

    return entity;
  }

  static createByAdminToPersistence(dto: CreateUserByAdminDto): UserEntity {
    const { firstName, lastName } = splitFullName(dto.fullName);
    const entity = new UserEntity();
    entity.email = dto.email;
    entity.password = dto.password;
    entity.firstName = firstName;
    entity.lastName = lastName;
    entity.provider = AuthProvidersEnum.EMAIL;
    entity.fullName = dto.fullName;
    if (dto.role) {
      entity.role = new RoleEntity();
      entity.role.id = dto.role;
    }

    entity.status = new StatusEntity();
    entity.status.id = Number(StatusEnum.ACTIVE);

    return entity;
  }
}
