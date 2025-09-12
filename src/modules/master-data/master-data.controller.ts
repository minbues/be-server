import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { UpdateMasterDataDto } from './dto/update-master-data.dto';
import { MasterDataService } from './master-data.service';

// @UseGuards(CmsGuard)
@ApiTags('Masters-data')
@Controller('masters-data')
// @ApiBearerAuth()
// @UseGuards(JWTAuthGuard)
export class MasterDataController {
  constructor(private readonly masterDataService: MasterDataService) {}

  @Post('update')
  // @Roles(ERole.SUPER_ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async update(@Body() updateMasterDataDto: UpdateMasterDataDto) {
    return await this.masterDataService.updateMasterData(updateMasterDataDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMasterData() {
    return await this.masterDataService.findMasterData();
  }
}
