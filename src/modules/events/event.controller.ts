import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EventsService } from './event.service';
import { AuthGuard } from '@nestjs/passport';
import { RoleEnum } from '../../utils/enum';
import { Roles } from '../roles/roles.decorator';
import { RolesGuard } from '../roles/roles.guard';
import {
  CreateScheduleDTO,
  UpdateScheduleDTO,
} from './dto/events.schedule.dto';
import { Pagination } from '../../utils/pagination/pagination.decorator';
import {
  ApiPagination,
  IPagination,
} from '../../utils/pagination/pagination.interface';

@ApiTags('Event')
@Controller({
  path: 'event',
  version: '1',
})
// @ApiBearerAuth()
// @Roles(RoleEnum.ADMIN)
// @UseGuards(AuthGuard('jwt'), RolesGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get('schedules')
  @ApiPagination()
  async getEvents(
    @Query('search') search: string,
    @Pagination() pagination: IPagination,
  ) {
    return await this.eventsService.getEvents(search, pagination);
  }

  @Post('schedule')
  async createEvent(@Body() event: CreateScheduleDTO) {
    return await this.eventsService.createEventSchedule(event);
  }

  @Patch('schedule/:id')
  async updateEvent(@Param('id') id: string, @Body() data: UpdateScheduleDTO) {
    return await this.eventsService.updateEventSchedule(id, data);
  }

  // Xoá sự kiện
  @Delete('schedule/:id')
  async deleteEvent(@Param('id') id: string) {
    return await this.eventsService.deleteEventSchedule(id);
  }

  @Get('schedule/active')
  async getOngoingEvents() {
    return await this.eventsService.getEventOnGoing();
  }
}
