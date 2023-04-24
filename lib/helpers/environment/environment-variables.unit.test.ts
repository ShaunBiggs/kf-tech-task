import { getEnvironmentVariable } from './environment-variables';

jest.spyOn(console, 'error');

describe('getEnvironmentVariable', () => {
  it('SHOULD return the value if present', () => {
    process.env['SITE_ID'] = 'test';

    const result = getEnvironmentVariable('SITE_ID');
    expect(result).toEqual('test');
  });

  it('SHOULD throw an error if not present', () => {
    expect(() => getEnvironmentVariable('FILTER_BEFORE_DATE')).toThrowError(
      Error('Missing environment variable FILTER_BEFORE_DATE')
    );
    expect(console.error).toHaveBeenCalledWith('Missing environment variable FILTER_BEFORE_DATE');
  });
});
