import { Controller, Get, Post, Param, Query, Body, Patch } from '@nestjs/common';
import { EstablishmentsService } from './establishments.service';
import type { Establishment, EstablishmentStatus } from '../types';

@Controller('establishments')
export class EstablishmentsController {
  constructor(private service: EstablishmentsService) {}

  @Get()
  findAll(
    @Query('status') status?: EstablishmentStatus,
    @Query('bairro') bairro?: string,
  ) {
    return this.service.findAll({ status, bairro });
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() data: Omit<Establishment, 'id' | 'createdAt' | 'updatedAt'>) {
    return this.service.create(data);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') newStatus: EstablishmentStatus,
  ) {
    return this.service.updateStatus(id, newStatus);
  }
}
