import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FornecimentosService } from './fornecimentos.service';

@Controller()
export class FornecimentosController {
  constructor(private service: FornecimentosService) {}

  @Get('distribuidoras')
  listarDistribuidoras() {
    return this.service.listarDistribuidoras();
  }

  @Get('establishments/:id/fornecimentos')
  listar(@Param('id') id: string) {
    return this.service.listarDoEstabelecimento(id);
  }

  @Post('establishments/:id/fornecimentos')
  adicionar(
    @Param('id') id: string,
    @Body('distribuidora') distribuidora: string,
    @Body('categoria') categoria: string,
  ) {
    return this.service.adicionar(id, distribuidora, categoria);
  }

  @Delete('fornecimentos/:id')
  remover(@Param('id') id: string) {
    return this.service.remover(id);
  }
}
