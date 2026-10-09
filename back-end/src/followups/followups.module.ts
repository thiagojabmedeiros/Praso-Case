import { Module } from '@nestjs/common';
import { FollowUpsController } from './followups.controller';
import { FollowUpsService } from './followups.service';
import { EstablishmentsModule } from '../establishments/establishments.module';
import { PurchasesModule } from '../purchases/purchases.module';

@Module({
  imports: [EstablishmentsModule, PurchasesModule],
  controllers: [FollowUpsController],
  providers: [FollowUpsService],
})
export class FollowUpsModule {}
