import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service';
import { RoomService } from './room.service';

describe('RoomService', () => {
  let service: RoomService;
  let prismaService: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const mockPrismaService = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get(RoomService);
    prismaService = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return empty array when no rooms exist', async () => {
      prismaService.room.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(prismaService.room.findMany).toHaveBeenCalled();
    });

    it('should return array of rooms when rooms exist', async () => {
      const mockRooms = [
        {
          id: '1',
          number: '101',
          type: 'SINGLE',
          price: 100,
          capacity: 2,
          description: 'Single room',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          number: '102',
          type: 'DOUBLE',
          price: 200,
          capacity: 4,
          description: 'Double room',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaService.room.findMany.mockResolvedValue(mockRooms);

      const result = await service.findAll();

      expect(result).toEqual(mockRooms);
      expect(prismaService.room.findMany).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      prismaService.room.findMany.mockRejectedValue(dbError);

      await expect(service.findAll()).rejects.toThrow(dbError);
      expect(prismaService.room.findMany).toHaveBeenCalled();
    });
  });
});
