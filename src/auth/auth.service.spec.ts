import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: jest.Mocked<PrismaService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    // Create mock implementations
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const mockLoyaltyService = {
      getAccountDetails: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: LoyaltyService,
          useValue: mockLoyaltyService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should have PrismaService injected', () => {
    expect(prismaService).toBeDefined();
  });

  it('should have JwtService injected', () => {
    expect(jwtService).toBeDefined();
  });

  it('should properly initialize with both services', () => {
    // Testing that both services are accessible through the class

    expect(service['prisma']).toBeDefined();

    expect(service['jwtService']).toBeDefined();
  });

  it('should maintain service functionality after initialization', () => {
    // Mock a JWT signing operation
    const mockToken = 'mock-jwt-token';
    jwtService.sign.mockReturnValue(mockToken);

    const token = service['jwtService'].sign({ test: 'data' });

    expect(token).toBe(mockToken);
    expect(jwtService.sign).toHaveBeenCalledWith({ test: 'data' });
  });
});
