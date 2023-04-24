export class RestError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

export class ForbiddenError extends RestError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends RestError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
    this.name = 'NotFoundError';
  }
}

export class TooManyRequestsError extends RestError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
    this.name = 'TooManyRequestsError';
  }
}

export class InternalServerError extends RestError {
  constructor(message: string, statusCode: number) {
    super(message, statusCode);
    this.name = 'InternalServerError';
  }
}
