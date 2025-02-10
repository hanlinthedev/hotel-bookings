import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomType } from './dto/create-room.dto';

describe('RoomController', () => {
  let controller: RoomController;
  let roomService: jest.Mocked<RoomService>;

  beforeEach(async () => {
    const mockRoomService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
      ],
    }).compile();

    controller = module.get<RoomController>(RoomController);
    roomService = module.get(RoomService);
  });

  describe('create', () => {
    it('should successfully create a room', async () => {
      const createRoomDto: CreateRoomDto = {
        number: '101',
        type: RoomType.SINGLE,
        price: 100,
        capacity: 2,
        description: 'A cozy single room',
      };

      const expectedRoom = {
        id: '1',
        number: '101',
        type: RoomType.SINGLE as string,
        price: 100,
        capacity: 2,
        description: 'A cozy single room',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      roomService.create.mockResolvedValue(expectedRoom);

      const result = await controller.create(createRoomDto);

      expect(result).toEqual(expectedRoom);
      expect(roomService.create).toHaveBeenCalledWith(createRoomDto);
      expect(roomService.create).toHaveBeenCalledTimes(1);
    });

    it('should handle creation with minimum required fields', async () => {
      const createRoomDto: CreateRoomDto = {
        number: '102',
        type: RoomType.DOUBLE,
        price: 150,
        capacity: 3,
      };

      const expectedRoom = {
        id: '2',
        ...createRoomDto,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      roomService.create.mockResolvedValue(expectedRoom);

      const result = await controller.create(createRoomDto);

      expect(result).toEqual(expectedRoom);
      expect(roomService.create).toHaveBeenCalledWith(createRoomDto);
    });

    it('should propagate errors from service', async () => {
      const createRoomDto: CreateRoomDto = {
        number: '103',
        type: RoomType.SUITE,
        price: 300,
        capacity: 4,
      };

      const error = new Error('Failed to create room');
      roomService.create.mockRejectedValue(error);

      await expect(controller.create(createRoomDto)).rejects.toThrow(error);
      expect(roomService.create).toHaveBeenCalledWith(createRoomDto);
    });
  });
});
