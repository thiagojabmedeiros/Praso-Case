import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private service: RecommendationsService) {}

  // ?agora=2026-10-09T21:00:00Z é opcional; útil para testar outros horários.
  @Get('vendor/:vendedorId')
  recomendar(@Param('vendedorId') vendedorId: string, @Query('agora') agora?: string) {
    return this.service.recomendar(vendedorId, agora ? new Date(agora) : new Date());
  }
}
