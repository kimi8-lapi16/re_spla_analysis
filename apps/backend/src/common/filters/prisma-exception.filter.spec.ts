import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from './prisma-exception.filter';

type MockResponse = {
  status: jest.Mock;
  json: jest.Mock;
};

type MockArgumentsHost = {
  switchToHttp: jest.Mock;
};

function createMockResponse(): MockResponse {
  const mockResponse: MockResponse = {
    status: jest.fn(),
    json: jest.fn(),
  };
  mockResponse.status.mockReturnValue(mockResponse);
  return mockResponse;
}

function createMockHost(response: MockResponse): MockArgumentsHost {
  return {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: jest.fn().mockReturnValue(response),
    }),
  };
}

function createPrismaError(
  code: string,
): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Test error', {
    code,
    clientVersion: '5.0.0',
  });
}

describe('PrismaExceptionFilter', () => {
  let filter: PrismaExceptionFilter;
  let mockResponse: MockResponse;
  let mockHost: MockArgumentsHost;

  beforeEach(() => {
    filter = new PrismaExceptionFilter();
    mockResponse = createMockResponse();
    mockHost = createMockHost(mockResponse);
  });

  it('should return 409 for P2002 (unique constraint violation)', () => {
    const error = createPrismaError('P2002');

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(409);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 409,
      message: 'Resource already exists',
      error: 'Conflict',
    });
  });

  it('should return 404 for P2025 (record not found)', () => {
    const error = createPrismaError('P2025');

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 404,
      message: 'Resource not found',
      error: 'Not Found',
    });
  });

  it('should return 500 for unknown Prisma error codes', () => {
    const error = createPrismaError('P9999');

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  });
});
