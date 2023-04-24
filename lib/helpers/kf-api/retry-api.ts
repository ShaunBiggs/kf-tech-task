import { InternalServerError } from '../errors/errors';

export const callApiWith500Retry = async <T>(
  fn: () => Promise<T>,
  err?: InternalServerError,
  retries = 2
): Promise<T> => {
  if (retries === 0) {
    throw err;
  }
  try {
    return await fn();
  } catch (err) {
    if (err instanceof InternalServerError) {
      return callApiWith500Retry(fn, err, retries - 1);
    }
    throw err;
  }
};
