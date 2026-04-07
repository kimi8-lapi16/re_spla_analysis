import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DomainException,
  EntityNotFoundException,
  DuplicateEntityException,
  ValidationException,
  OwnershipViolationException,
  AuthenticationException,
} from '../exceptions';

const EXCEPTION_STATUS_MAP = new Map<
  new (...args: string[]) => DomainException,
  { status: HttpStatus; error: string }
>([
  [
    EntityNotFoundException,
    { status: HttpStatus.NOT_FOUND, error: 'Not Found' },
  ],
  [
    DuplicateEntityException,
    { status: HttpStatus.CONFLICT, error: 'Conflict' },
  ],
  [
    ValidationException,
    { status: HttpStatus.BAD_REQUEST, error: 'Bad Request' },
  ],
  [
    OwnershipViolationException,
    { status: HttpStatus.FORBIDDEN, error: 'Forbidden' },
  ],
  [
    AuthenticationException,
    { status: HttpStatus.UNAUTHORIZED, error: 'Unauthorized' },
  ],
]);

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const mapping = EXCEPTION_STATUS_MAP.get(
      exception.constructor as new (...args: string[]) => DomainException,
    );

    const status = mapping?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const error = mapping?.error ?? 'Internal Server Error';

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error,
    });
  }
}
