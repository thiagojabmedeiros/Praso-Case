import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EstablishmentsModule } from './establishments/establishments.module';
import { VisitsModule } from './visits/visits.module';
import { PurchasesModule } from './purchases/purchases.module';
import { FollowUpsModule } from './followups/followups.module';
import { SellersModule } from './sellers/sellers.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { PrismaModule } from './prisma/prisma.module';
import { FornecimentosModule } from './fornecimentos/fornecimentos.module';

@Module({
  imports: [PrismaModule, EstablishmentsModule, VisitsModule, PurchasesModule, FollowUpsModule, SellersModule, RecommendationsModule, FornecimentosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
