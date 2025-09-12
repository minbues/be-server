import { Injectable } from '@nestjs/common';
import { UpdateMasterDataDto } from './dto/update-master-data.dto';
import { Repository } from 'typeorm';
import { MasterDataEntity } from '../../entities/master-data.entity';
import { MasterDataEnum } from '../../utils/enum';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MasterDataService {
  constructor(
    @InjectRepository(MasterDataEntity)
    private readonly masterDataRepository: Repository<MasterDataEntity>,
  ) {}

  async updateMasterData(dto: UpdateMasterDataDto) {
    const id = Number(dto.id);
    const masterData = await this.masterDataRepository.findOne({
      where: { id },
    });

    if (!masterData) {
      const newMasterData = this.masterDataRepository.create({
        data: dto.data,
        type: MasterDataEnum.MASTER,
      });
      return await this.masterDataRepository.save(newMasterData);
    }

    await this.masterDataRepository.update({ id }, { data: dto.data });
    return await this.masterDataRepository.findOne({
      where: { id },
    });
  }

  async findMasterData() {
    const masterData = await this.masterDataRepository.findOne({
      where: { type: MasterDataEnum.MASTER },
      select: ['id', 'data'],
    });
    return masterData;
  }
}
