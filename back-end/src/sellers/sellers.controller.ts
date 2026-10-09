import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { SellersService } from './sellers.service';

@Controller('sellers')
export class SellersController {
  constructor(private service: SellersService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/score')
  updateScore(@Param('id') id: string, @Body('pontos') pontos: number) {
    return this.service.updateScore(id, pontos);
  }
}
