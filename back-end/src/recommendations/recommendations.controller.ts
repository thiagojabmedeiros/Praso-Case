import { Controller, Get, Param, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';

@Controller('recommendations')
export class RecommendationsController {
  constructor(private service: RecommendationsService) {}

  // Parâmetros opcionais, úteis para teste:
  // ?lat=-8.15&lng=-34.92 → posição do vendedor (distância entra no ranking)
  // ?agora=2026-10-09T21:00:00Z → outro horário
  @Get('vendor/:vendedorId')
  recomendar(
    @Param('vendedorId') vendedorId: string,
    @Query('agora') agora?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    const origem =
      lat !== undefined && lng !== undefined && !Number.isNaN(Number(lat)) && !Number.isNaN(Number(lng))
        ? { lat: Number(lat), lng: Number(lng) }
        : undefined;
    return this.service.recomendar(vendedorId, agora ? new Date(agora) : new Date(), origem);
  }
}
