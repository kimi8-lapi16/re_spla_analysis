import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter';
import {
  DomainException,
  EntityNotFoundException,
  DuplicateEntityException,
  ValidationException,
  OwnershipViolationException,
  AuthenticationException,
} from '../exceptions';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockResponse: {
    status: jest.Mock;
    json: jest.Mock;
  };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: jest.fn(),
        getNext: jest.fn(),
      }),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as unknown as ArgumentsHost;
  });

  it('should handle EntityNotFoundException as 404', () => {
    const exception = new EntityNotFoundException('User not found');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'User not found',
      error: 'Not Found',
    });
  });

  it('should handle DuplicateEntityException as 409', () => {
    const exception = new DuplicateEntityException('Email already exists');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.CONFLICT,
      message: 'Email already exists',
      error: 'Conflict',
    });
  });

  it('should handle ValidationException as 400', () => {
    const exception = new ValidationException('Invalid rule IDs: 1, 2');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.BAD_REQUEST,
      message: 'Invalid rule IDs: 1, 2',
      error: 'Bad Request',
    });
  });

  it('should handle OwnershipViolationException as 403', () => {
    const exception = new OwnershipViolationException(
      'Not all matches belong to the user',
    );

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.FORBIDDEN,
      message: 'Not all matches belong to the user',
      error: 'Forbidden',
    });
  });

  it('should handle AuthenticationException as 401', () => {
    const exception = new AuthenticationException('Invalid credentials');

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.UNAUTHORIZED,
      message: 'Invalid credentials',
      error: 'Unauthorized',
    });
  });

  it('should handle unknown DomainException subclass as 500', () => {
    class UnknownDomainException extends DomainException {
      constructor() {
        super('Something went wrong');
      }
    }
    const exception = new UnknownDomainException();

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong',
      error: 'Internal Server Error',
    });
  });
});
