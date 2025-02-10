import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mock AuthService
  const mockAuthService = {
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('logout', () => {
    const mockRefreshToken = 'mock-refresh-token';

    it('should successfully logout user', async () => {
      // Arrange
      mockAuthService.logout.mockResolvedValueOnce({ success: true });

      // Act
      const result = await controller.logout({
        refreshToken: mockRefreshToken,
      });

      // Assert
      expect(authService.logout).toHaveBeenCalledWith(mockRefreshToken);
      expect(authService.logout).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: true });
    });

    it('should handle logout failure', async () => {
      // Arrange
      const error = new Error('Logout failed');
      mockAuthService.logout.mockRejectedValueOnce(error);

      // Act & Assert
      await expect(
        controller.logout({ refreshToken: mockRefreshToken }),
      ).rejects.toThrow('Logout failed');
      expect(authService.logout).toHaveBeenCalledWith(mockRefreshToken);
      expect(authService.logout).toHaveBeenCalledTimes(1);
    });

    it('should handle empty refresh token', async () => {
      // Arrange
      const emptyToken = '';
      mockAuthService.logout.mockResolvedValueOnce({ success: false });

      // Act
      const result = await controller.logout({ refreshToken: emptyToken });

      // Assert
      expect(authService.logout).toHaveBeenCalledWith(emptyToken);
      expect(authService.logout).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ success: false });
    });
  });
});
