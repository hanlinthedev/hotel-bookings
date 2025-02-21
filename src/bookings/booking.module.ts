import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RequestLoggerMiddleware } from 'src/common/middleware/request-logger.middleware';
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
export class BookingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes(BookingController);
  }
}
