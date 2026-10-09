import { Controller, Get, Param } from '@nestjs/common';
import { FollowUpsService } from './followups.service';

@Controller('followups')
export class FollowUpsController {
  constructor(private service: FollowUpsService) {}

  @Get('vendor/:vendedorId')
  findByVendedor(@Param('vendedorId') vendedorId: string) {
    return this.service.findByVendedor(vendedorId);
  }

  @Get('establishment/:establishmentId')
  findByEstablishment(@Param('establishmentId') establishmentId: string) {
    return this.service.findByEstablishment(establishmentId);
  }
}
