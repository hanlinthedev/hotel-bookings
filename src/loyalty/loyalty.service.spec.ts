import { Test, TestingModule } from '@nestjs/testing';
import { MembershipTier, PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service';
import { LoyaltyService } from './loyalty.service';

describe('LoyaltyService', () => {
  let service: LoyaltyService;
  let prismaService: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoyaltyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get(LoyaltyService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOrCreateAccount', () => {
    it('should return existing account if found', async () => {
      const mockAccount = {
        id: '1',
        userId: 'user-123',
        points: 0,
        tier: 'STANDARD' as MembershipTier,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.loyaltyAccount.findUnique.mockResolvedValue(mockAccount);

      const result = await service.getOrCreateAccount('user-123');
      expect(result).toEqual(mockAccount);
      expect(prismaService.loyaltyAccount.create).not.toHaveBeenCalled();
    });

    it('should create new account if not found', async () => {
      const mockAccount = {
        id: '1',
        userId: 'user-123',
        points: 0,
        tier: 'STANDARD' as MembershipTier,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.loyaltyAccount.findUnique.mockResolvedValue(null);
      prismaService.loyaltyAccount.create.mockResolvedValue(mockAccount);

      const result = await service.getOrCreateAccount('user-123');
      expect(result).toEqual(mockAccount);
      expect(prismaService.loyaltyAccount.create).toHaveBeenCalled();
    });
  });

  describe('addPoints', () => {
    it('should add points and update tier', async () => {
      const mockAccount = {
        id: '1',
        userId: 'user-123',
        points: 1100,
        tier: 'SILVER' as MembershipTier,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.loyaltyAccount.update.mockResolvedValue(mockAccount);

      const checkIn = new Date('2024-01-01');
      const checkOut = new Date('2024-01-03');

      const result = await service.addPoints(
        'user-123',
        'DELUXE',
        checkIn,
        checkOut,
      );

      expect(result).toEqual(mockAccount);
      expect(prismaService.loyaltyAccount.update).toHaveBeenCalled();
    });
  });

  describe('getAccountDetails', () => {
    it('should return account with next tier info', async () => {
      const mockAccount = {
        id: '1',
        userId: 'user-123',
        points: 800,
        tier: 'STANDARD' as MembershipTier,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
      };

      prismaService.loyaltyAccount.findUnique.mockResolvedValue(mockAccount);

      const result = await service.getAccountDetails('user-123');
      expect(result.nextTier).toBeDefined();
      expect(result.user).toBeDefined();
    });
  });
});
