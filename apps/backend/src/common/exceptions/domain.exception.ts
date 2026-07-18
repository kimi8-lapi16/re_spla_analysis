/**
 * Base class for all domain exceptions.
 * Domain exceptions are HTTP-agnostic and represent business logic errors.
 * They are mapped to HTTP responses by DomainExceptionFilter.
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown when a requested entity does not exist.
 * Mapped to HTTP 404 Not Found.
 */
export class EntityNotFoundException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when an operation would create a duplicate entity.
 * Mapped to HTTP 409 Conflict.
 */
export class DuplicateEntityException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when input validation fails at the business logic level.
 * (e.g., invalid FK references, invalid enum values for raw SQL)
 * Mapped to HTTP 400 Bad Request.
 */
export class ValidationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when a user attempts to access a resource they do not own.
 * Mapped to HTTP 403 Forbidden.
 */
export class OwnershipViolationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

/**
 * Thrown when authentication fails (invalid credentials, missing secret, etc.).
 * Mapped to HTTP 401 Unauthorized.
 */
export class AuthenticationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
