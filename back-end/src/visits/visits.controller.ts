import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { VisitsService } from './visits.service';
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
  create(@Body() data: Omit<Visit, 'id' | 'createdAt'>) {
    return this.service.create(data);
  }
}
