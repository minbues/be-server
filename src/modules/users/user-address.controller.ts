import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  Get,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UserAddressService } from './user-address.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleEnum } from '../../utils/enum';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';

@ApiBearerAuth()
@Roles(RoleEnum.USER)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiTags('User-Address')
@Controller({
  path: 'user-address',
  version: '1',
})
export class UserAddressController {
  constructor(private readonly userAddressService: UserAddressService) {}

  @Post('address')
  create(@Req() req: any, @Body() dto: CreateAddressDto) {
    const userId = req.user.id;
    return this.userAddressService.create(Number(userId), dto);
  }

  @Patch('address/:id')
  update(@Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.userAddressService.update(id, dto);
  }

  @Delete('address/:id')
  remove(@Param('id') id: string) {
    return this.userAddressService.delete(id);
  }

  @Get('addresses')
  getAddresses(@Req() req: any) {
    const userId = req.user.id;
    return this.userAddressService.getUserAddresses(Number(userId));
  }

  @Patch('address/:id/default')
  setDefault(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.userAddressService.setDefault(Number(userId), id);
  }
}
