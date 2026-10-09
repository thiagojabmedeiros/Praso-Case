import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import type { Purchase } from '../types';

@Controller('purchases')
export class PurchasesController {
  constructor(private service: PurchasesService) {}

  @Get('establishment/:establishmentId')
  findByEstablishment(@Param('establishmentId') establishmentId: string) {
    return this.service.findByEstablishmentId(establishmentId);
  }

  @Get('establishment/:establishmentId/autonomous')
  findAutonomous(@Param('establishmentId') establishmentId: string) {
    return this.service.findAutonomousByEstablishment(establishmentId);
  }

  @Post()
  create(@Body() data: Omit<Purchase, 'id' | 'createdAt'>) {
    return this.service.create(data);
  }
}
