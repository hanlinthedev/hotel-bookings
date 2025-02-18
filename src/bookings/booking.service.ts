import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';

@Injectable()
export class BookingService {
  private readonly tierDiscounts = {
    STANDARD: 0,
    SILVER: 0.05, // 5% discount
    GOLD: 0.1, // 10% discount
    PLATINUM: 0.15, // 15% discount
  };

  private readonly depositPercentage = 0.2; // 20% deposit

  constructor(
    private prisma: PrismaService,
    private loyaltyService: LoyaltyService,
    private stripeService: StripeService,
  ) {}

  async createPaymentIntent(bookingId: string, userId: string) {
    const booking = await this.findOne(bookingId, userId);

    if (booking.status !== BookingStatus.PENDING_DEPOSIT) {
      throw new BadRequestException('Booking is not pending deposit');
    }

    const paymentIntent = await this.stripeService.createPaymentIntent(
      booking.depositAmount,
    );

    return { clientSecret: paymentIntent.client_secret };
  }

  async confirmPayment(
    bookingId: string,
    userId: string,
    paymentIntentId: string,
  ) {
    const booking = await this.findOne(bookingId, userId);
    const paymentIntent =
      await this.stripeService.confirmPayment(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      await this.prisma.$transaction(async (prisma) => {
        await prisma.payment.create({
          data: {
            bookingId,
            amount: booking.depositAmount,
            stripePaymentId: paymentIntentId,
            status: 'SUCCEEDED',
          },
        });

        await prisma.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CONFIRMED },
        });
      });

      await this.loyaltyService.addPoints(
        userId,
        booking.room.type,
        booking.checkIn,
        booking.checkOut,
      );
    }

    return this.findOne(bookingId, userId);
  }

  async findAvailableRooms(checkIn: Date, checkOut: Date, roomType?: string) {
    const overlappingBookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          {
            AND: [{ checkIn: { lte: checkIn } }, { checkOut: { gt: checkIn } }],
          },
          {
            AND: [
              { checkIn: { lt: checkOut } },
              { checkOut: { gte: checkOut } },
            ],
          },
        ],
        status: 'CONFIRMED',
      },
      select: { roomId: true },
    });

    const bookedRoomIds = overlappingBookings.map((booking) => booking.roomId);

    return this.prisma.room.findMany({
      where: {
        id: { notIn: bookedRoomIds },
        ...(roomType && { type: roomType }),
      },
    });
  }

  async calculatePrice(
    roomId: string,
    checkIn: Date,
    checkOut: Date,
    userId: string,
  ) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    const loyaltyAccount = await this.loyaltyService.getAccountDetails(userId);

    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );
    const basePrice = room.price * nights;

    const discount = this.tierDiscounts[loyaltyAccount.tier] || 0;
    const discountedPrice = basePrice * (1 - discount);
    const depositAmount = discountedPrice * this.depositPercentage;

    return {
      basePrice,
      discount,
      discountedPrice,
      depositAmount,
      nights,
    };
  }

  async createBooking(
    userId: string,
    roomId: string,
    checkIn: Date,
    checkOut: Date,
  ) {
    const availableRooms = await this.findAvailableRooms(checkIn, checkOut);
    if (!availableRooms.find((room) => room.id === roomId)) {
      throw new BadRequestException(
        'Room is not available for the selected dates',
      );
    }

    const priceDetails = await this.calculatePrice(
      roomId,
      checkIn,
      checkOut,
      userId,
    );

    const booking = await this.prisma.booking.create({
      data: {
        userId,
        roomId,
        checkIn,
        checkOut,
        totalPrice: priceDetails.discountedPrice,
        depositAmount: priceDetails.depositAmount,
        status: 'PENDING_DEPOSIT',
      },
    });

    return {
      booking,
      priceDetails,
    };
  }

  async findUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        room: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, userId },
      include: {
        room: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async cancelBooking(id: string, userId: string) {
    const booking = await this.findOne(id, userId);

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    if (new Date() >= booking.checkIn) {
      throw new BadRequestException(
        'Cannot cancel booking after check-in date',
      );
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED },
      include: {
        room: true,
      },
    });
  }
}
