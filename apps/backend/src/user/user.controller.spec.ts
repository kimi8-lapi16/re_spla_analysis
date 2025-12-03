import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UpdateUser, UserResponse } from './user.dto';

describe('UserController', () => {
  let controller: UserController;
  let service: jest.Mocked<UserService>;

  const mockUserResponse: UserResponse = {
    id: 'test-user-id',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCurrentUser = {
    userId: 'test-user-id',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
            updateUser: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService) as jest.Mocked<UserService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('should return current user information', async () => {
      service.findById.mockResolvedValue(mockUserResponse);

      const result = await controller.getMe(mockCurrentUser);

      expect(result).toEqual({ user: mockUserResponse });
      expect(service.findById).toHaveBeenCalledWith('test-user-id');
    });

    it('should throw error when user not found', async () => {
      service.findById.mockResolvedValue(null);

      await expect(controller.getMe(mockCurrentUser)).rejects.toThrow(
        'User not found',
      );
      expect(service.findById).toHaveBeenCalledWith('test-user-id');
    });
  });

  describe('updateMe', () => {
    const updateDto: UpdateUser = {
      name: 'Updated Name',
    };

    it('should update and return user information', async () => {
      const updatedUser: UserResponse = {
        ...mockUserResponse,
        name: 'Updated Name',
      };
      service.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.updateMe(mockCurrentUser, updateDto);

      expect(result).toEqual({ user: updatedUser });
      expect(service.updateUser).toHaveBeenCalledWith(
        'test-user-id',
        updateDto,
      );
    });

    it('should update user email', async () => {
      const emailUpdateDto: UpdateUser = {
        email: 'newemail@example.com',
      };
      const updatedUser: UserResponse = {
        ...mockUserResponse,
        email: 'newemail@example.com',
      };
      service.updateUser.mockResolvedValue(updatedUser);

      const result = await controller.updateMe(mockCurrentUser, emailUpdateDto);

      expect(result.user.email).toBe('newemail@example.com');
      expect(service.updateUser).toHaveBeenCalledWith(
        'test-user-id',
        emailUpdateDto,
      );
    });
  });
});
