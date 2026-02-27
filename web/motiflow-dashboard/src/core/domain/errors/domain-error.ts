export class DomainError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'DomainError';
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, id: string) {
    super(`${entityName} with id ${id} not found`, 'ENTITY_NOT_FOUND');
    this.name = 'EntityNotFoundError';
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }
}
