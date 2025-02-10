import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { StripeModule } from '../stripe/stripe.module';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

@Module({
  imports: [LoyaltyModule, StripeModule],
  controllers: [BookingController],
  providers: [BookingService, PrismaService],
  exports: [BookingService],
})
export class BookingModule {}
