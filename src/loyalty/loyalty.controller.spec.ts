import { Test, TestingModule } from '@nestjs/testing';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyService } from './loyalty.service';

describe('LoyaltyController', () => {
  let controller: LoyaltyController;
  let loyaltyService: jest.Mocked<LoyaltyService>;

  beforeEach(async () => {
    const mockLoyaltyService = {
      getAccountDetails: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoyaltyController],
      providers: [
        {
          provide: LoyaltyService,
          useValue: mockLoyaltyService,
        },
      ],
    }).compile();

    controller = module.get<LoyaltyController>(LoyaltyController);
    loyaltyService = module.get(LoyaltyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAccount', () => {
    it('should return loyalty account details', async () => {
      const mockAccount = {
        id: '1',
        userId: 'user-123',
        points: 100,
        tier: 'STANDARD',
        createdAt: new Date(),
        updatedAt: new Date(),
        nextTier: {
          tier: 'SILVER',
          pointsNeeded: 900,
        },
        user: {
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        },
      };

      loyaltyService.getAccountDetails.mockResolvedValue(mockAccount as any);

      const result = await controller.getAccount('user-123');

      expect(result).toEqual(mockAccount);
      expect(loyaltyService.getAccountDetails).toHaveBeenCalledWith('user-123');
    });
  });
});
