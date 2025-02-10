import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { BookingStatus } from '@prisma/client';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';

describe('BookingController', () => {
  let controller: BookingController;
  let bookingService: jest.Mocked<BookingService>;

  const mockBooking = {
    id: '1',
    userId: 'user-1',
    roomId: 'room-1',
    checkIn: new Date(),
    checkOut: new Date(),
    totalPrice: 100,
    depositAmount: 20,
    status: BookingStatus.PENDING_DEPOSIT, // Use enum instead of string
    createdAt: new Date(),
    updatedAt: new Date(),
    room: {
      id: 'room-1',
      number: '101',
      type: 'SINGLE',
      price: 100,
      capacity: 2,
      description: 'Test room',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  beforeEach(async () => {
    const mockBookingService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingController],
      providers: [
        {
          provide: BookingService,
          useValue: mockBookingService,
        },
      ],
    }).compile();

    controller = module.get<BookingController>(BookingController);
    bookingService = module.get(BookingService);
  });

  describe('getBooking', () => {
    it('should return a booking when it exists', async () => {
      bookingService.findOne.mockResolvedValue(mockBooking);

      const result = await controller.getBooking('1', 'user-1');

      expect(result).toEqual(mockBooking);
      expect(bookingService.findOne).toHaveBeenCalledWith('1', 'user-1');
      expect(bookingService.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when booking does not exist', async () => {
      bookingService.findOne.mockRejectedValue(
        new NotFoundException('Booking not found'),
      );

      await expect(controller.getBooking('999', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(bookingService.findOne).toHaveBeenCalledWith('999', 'user-1');
    });

    it('should throw NotFoundException when booking belongs to different user', async () => {
      bookingService.findOne.mockRejectedValue(
        new NotFoundException('Booking not found'),
      );

      await expect(
        controller.getBooking('1', 'different-user'),
      ).rejects.toThrow(NotFoundException);
      expect(bookingService.findOne).toHaveBeenCalledWith(
        '1',
        'different-user',
      );
    });
  });
});
