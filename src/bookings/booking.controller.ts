import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import { Role } from '../common/enums/role.enum';
import { RolesGuard } from '../common/guards/roles.guard';
import { BookingService } from './booking.service';
import { BookingSearchDto, CreateBookingDto } from './dto/create-booking.dto';

@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Public()
  @Get('available-rooms')
  async findAvailableRooms(@Query() searchDto: BookingSearchDto) {
    return this.bookingService.findAvailableRooms(
      new Date(searchDto.checkIn),
      new Date(searchDto.checkOut),
      searchDto.roomType,
    );
  }

  @Roles(Role.USER)
  @Post()
  async createBooking(
    @User('userId') userId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingService.createBooking(
      userId,
      createBookingDto.roomId,
      new Date(createBookingDto.checkIn),
      new Date(createBookingDto.checkOut),
    );
  }

  @Roles(Role.USER)
  @Get()
  async getUserBookings(@User('userId') userId: string) {
    return this.bookingService.findUserBookings(userId);
  }

  @Roles(Role.USER)
  @Get(':id')
  async getBooking(@Param('id') id: string, @User('userId') userId: string) {
    return this.bookingService.findOne(id, userId);
  }

  @Roles(Role.USER)
  @Patch(':id/cancel')
  async cancelBooking(@Param('id') id: string, @User('userId') userId: string) {
    return this.bookingService.cancelBooking(id, userId);
  }

  @Roles(Role.USER)
  @Post(':id/payment-intent')
  async createPaymentIntent(
    @Param('id') id: string,
    @User('userId') userId: string,
  ) {
    return this.bookingService.createPaymentIntent(id, userId);
  }

  @Roles(Role.USER)
  @Post(':id/confirm-payment')
  async confirmPayment(
    @Param('id') id: string,
    @User('userId') userId: string,
    @Body('paymentIntentId') paymentIntentId: string,
  ) {
    return this.bookingService.confirmPayment(id, userId, paymentIntentId);
  }
}
