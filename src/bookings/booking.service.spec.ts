/* eslint-disable @typescript-eslint/ban-ts-comment */
import { Test, TestingModule } from '@nestjs/testing';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { PrismaService } from '../prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { BookingService } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;
  let prismaService: jest.Mocked<PrismaService>;
  let loyaltyService: jest.Mocked<LoyaltyService>;
  let stripeService: jest.Mocked<StripeService>;

  beforeEach(async () => {
    // Create mock services
    const mockPrismaService = {
      booking: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      room: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(mockPrismaService)),
    };

    const mockLoyaltyService = {
      getAccountDetails: jest.fn(),
      addPoints: jest.fn(),
    };

    const mockStripeService = {
      createPaymentIntent: jest.fn(),
      confirmPayment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: LoyaltyService,
          useValue: mockLoyaltyService,
        },
        {
          provide: StripeService,
          useValue: mockStripeService,
        },
      ],
    }).compile();

    service = module.get<BookingService>(BookingService);
    prismaService = module.get(PrismaService);
    loyaltyService = module.get(LoyaltyService);
    stripeService = module.get(StripeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have PrismaService injected', () => {
    expect(prismaService).toBeDefined();
  });

  it('should have LoyaltyService injected', () => {
    expect(loyaltyService).toBeDefined();
  });

  it('should have StripeService injected', () => {
    expect(stripeService).toBeDefined();
  });

  it('should initialize with correct tier discounts', () => {
    // @ts-ignore - accessing private property for testing
    expect(service['tierDiscounts']).toEqual({
      STANDARD: 0,
      SILVER: 0.05,
      GOLD: 0.1,
      PLATINUM: 0.15,
    });
  });

  it('should initialize with correct deposit percentage', () => {
    // @ts-ignore - accessing private property for testing
    expect(service['depositPercentage']).toBe(0.2);
  });
});
