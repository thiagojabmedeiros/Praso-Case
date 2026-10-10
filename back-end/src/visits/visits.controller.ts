import { Controller, Get, Post, Patch, Param, Body } from '@nestjs/common';
import { VisitsService } from './visits.service';
import type { CreateInput } from './visits.service';
import type { Visit } from '../types';

@Controller('visits')
export class VisitsController {
  constructor(private service: VisitsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('establishment/:establishmentId')
  findByEstablishment(@Param('establishmentId') establishmentId: string) {
    return this.service.findByEstablishmentId(establishmentId);
  }

  @Post()
  create(@Body() data: CreateInput) {
    return this.service.create(data);
  }

  @Patch(':id/anular')
  anular(@Param('id') id: string, @Body('motivo') motivo: string) {
    return this.service.anular(id, motivo);
  }
}
