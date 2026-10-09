import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EstablishmentsModule } from './establishments/establishments.module';
import { VisitsModule } from './visits/visits.module';
import { PurchasesModule } from './purchases/purchases.module';
import { FollowUpsModule } from './followups/followups.module';
import { SellersModule } from './sellers/sellers.module';

@Module({
  imports: [EstablishmentsModule, VisitsModule, PurchasesModule, FollowUpsModule, SellersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
