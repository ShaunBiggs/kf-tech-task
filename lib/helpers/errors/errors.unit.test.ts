import { ForbiddenError, InternalServerError, NotFoundError, RestError, TooManyRequestsError } from './errors';

describe('Rest Errors', () => {
  const restErrors = [
    {
      name: 'ForbiddenError',
      message: 'Forbidden',
      statusCode: 403,
      error: new ForbiddenError('Forbidden', 403),
    },
    {
      name: 'NotFoundError',
      message: 'Not Found',
      statusCode: 404,
      error: new NotFoundError('Not Found', 404),
    },
    {
      name: 'TooManyRequestsError',
      message: 'Too Many Requests',
      statusCode: 429,
      error: new TooManyRequestsError('Too Many Requests', 429),
    },
    {
      name: 'InternalServerError',
      message: 'Internal Server Error',
      statusCode: 500,
      error: new InternalServerError('Internal Server Error', 500),
    },
  ];

  describe.each(restErrors)('$name', ({ name, message, statusCode, error }) => {
    it('SHOULD have the correct name, message and status code', () => {
      expect(error instanceof RestError);
      expect(error.message).toEqual(message);
      expect(error.name).toEqual(name);
      expect(error.statusCode).toEqual(statusCode);
    });
  });
});
