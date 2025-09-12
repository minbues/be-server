import { UserEntity } from '../../entities/users.entity';
import { UserAddressEntity } from '../../entities/user-address.entity';

export class UserAddressMapper {
  static toDomain(raw: UserAddressEntity | null) {
    if (!raw) return null;

    return {
      id: raw.id,
      fullName: raw.fullName,
      phone: raw.phone,
      street: raw.street,
      ward: raw.ward,
      district: raw.district,
      city: raw.city,
      country: raw.country,
      isDefault: raw.isDefault,
    };
  }

  static toDomainList(rawList: UserAddressEntity[] | null) {
    if (!rawList?.length) return [];
    return rawList.map((raw) => this.toDomain(raw));
  }

  static toUserInfo(user: UserEntity | null) {
    if (!user) return {};

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    };
  }

  static toResponse(userAddresses: UserAddressEntity[] | null) {
    if (!userAddresses?.length) {
      return {
        user: {},
        addresses: [],
      };
    }

    const userInfo = this.toUserInfo(userAddresses[0].user);

    return {
      user: userInfo,
      addresses: this.toDomainList(userAddresses),
    };
  }
}
