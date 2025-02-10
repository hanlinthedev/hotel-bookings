import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BookingModule } from './bookings/booking.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { RoomModule } from './rooms/room.module';

@Module({
  imports: [AuthModule, RoomModule, LoyaltyModule, BookingModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
