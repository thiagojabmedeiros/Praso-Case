import { Module } from '@nestjs/common';
import { FornecimentosController } from './fornecimentos.controller';
import { FornecimentosService } from './fornecimentos.service';

@Module({
  controllers: [FornecimentosController],
  providers: [FornecimentosService],
})
export class FornecimentosModule {}
