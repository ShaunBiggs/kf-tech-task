import { InternalServerError } from '../errors/errors';
import { callApiWith500Retry } from './retry-api';

const testFunction = jest.fn();

describe('callApiWith500Retry', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('SHOULD throw any non InternalServerError', async () => {
    const error = new Error('error');
    testFunction.mockRejectedValue(error);

    await expect(callApiWith500Retry(() => testFunction())).rejects.toThrowError();
  });

  it('SHOULD throw the InternalServerError if out of retries', async () => {
    const error = new InternalServerError('error', 500);
    testFunction.mockRejectedValue(error);

    await expect(callApiWith500Retry(() => testFunction())).rejects.toThrowError();
    expect(testFunction).toHaveBeenCalledTimes(2);
  });

  it('SHOULD return the function response if successful', async () => {
    const error = new InternalServerError('error', 500);
    testFunction.mockRejectedValueOnce(error).mockResolvedValue({ test: 'pass' });

    const response = await callApiWith500Retry(() => testFunction());

    expect(response).toEqual({ test: 'pass' });
    expect(testFunction).toHaveBeenCalledTimes(2);
  });
});
