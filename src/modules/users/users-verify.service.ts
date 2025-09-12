import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserVerifyEntity } from '../../entities/user-verify.entity';
import { Repository } from 'typeorm';
import { CreateUserVerifyDto } from './dto/create-user-verify';
import { UserEntity } from '../../entities/users.entity';
import { AuthVerifyEmailDto } from '../auth/dto/auth-confirm-email.dto';
import { VerifyCodeEnum } from '../../utils/enum';

@Injectable()
export class UsersVerifyService {
  constructor(
    @InjectRepository(UserVerifyEntity)
    private readonly usersVerifyRepository: Repository<UserVerifyEntity>,
  ) {}

  async create(dto: CreateUserVerifyDto) {
    return this.usersVerifyRepository.save({
      code: dto.code,
      codeExpires: dto.codeExpires,
      userId: dto.userId,
      user: { id: dto.userId } as UserEntity,
      type: dto.type,
    });
  }

  async findVerifyCode(dto: AuthVerifyEmailDto) {
    return await this.usersVerifyRepository.findOne({
      where: {
        userId: Number(dto.id),
        code: dto.code,
        isValid: true,
        type: dto.type,
      },
      relations: {
        user: true,
      },
    });
  }

  async updateVerifyCodeToInvalid(userId: number, type: VerifyCodeEnum) {
    return await this.usersVerifyRepository.update(
      {
        userId: userId,
        type: type,
      },
      {
        isValid: false,
      },
    );
  }
}
