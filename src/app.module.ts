import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { RoomModule } from './rooms/room.module';

@Module({
  imports: [AuthModule, RoomModule, LoyaltyModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
