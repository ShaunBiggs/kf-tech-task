import axios, { AxiosError } from 'axios';
import { ForbiddenError, InternalServerError, NotFoundError, TooManyRequestsError } from '../../helpers/errors/errors';
import { getOutages, getSiteInfo, postSiteOutages } from '.';
import config from '../../config.json';

jest.mock('axios', () => ({
  ...jest.requireActual('axios'),
  post: jest.fn(),
  get: jest.fn(),
}));

jest.spyOn(console, 'error');

const buildAxiosError = (message: string, status: number) => {
  return {
    message,
    code: '',
    config: {},
    request: {},
    response: { status, statusText: '', headers: {}, config: {} },
  } as AxiosError;
};

const { baseUrl, apiKey } = config.krakenFlex;

describe('Get Outages', () => {
  describe('GIVEN a 200 OK response from /outages', () => {
    it('THEN the data is returned', async () => {
      const data = [
        {
          id: 'id',
          begin: 'begin',
          end: 'end',
        },
      ];
      jest.mocked(axios.get).mockResolvedValue({ status: 200, data: data });
      const response = await getOutages();
      expect(response).toEqual(data);
      expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/outages`, { headers: { 'x-api-key': apiKey } });
    });
  });

  describe('GIVEN no status code on response from /site-outages/{siteId}', () => {
    it('THEN the origianl error is thrown is returned', async () => {
      const error = new AxiosError('Unexpected Error');
      jest.mocked(axios.get).mockRejectedValue(error);
      await expect(getOutages()).rejects.toThrowError(error);
      expect(console.error).toHaveBeenCalledWith(`Unexpected error in getOutages with message: ${error.message}`);
    });
  });

  describe('GIVEN an unexpected error calling /outages', () => {
    it('THEN the error is rethrown', async () => {
      const error = new Error('Unexpected Error');
      jest.mocked(axios.get).mockRejectedValue(error);
      await expect(getOutages()).rejects.toThrowError(error);
      expect(console.error).toHaveBeenCalledWith(`Unexpected error in getOutages with message: ${error.message}`);
    });
  });

  describe('GIVEN a non 200 response from /outages', () => {
    const scenarios = [
      {
        statusCode: '403',
        scenario: 'A 403 forbidden response is returned',
        error: buildAxiosError('Forbidden', 403),
        errorType: 'ForbiddenError',
        response: new ForbiddenError('Forbidden', 403),
      },
      {
        statusCode: '429',
        scenario: 'A 429 Too many request response is returned',
        error: buildAxiosError('Too Many Requests', 429),
        errorType: 'TooManyRequestsError',
        response: new TooManyRequestsError('Too Many Requests', 429),
      },
      {
        statusCode: '500',
        scenario: 'A 500 Internal Server Error is returned',
        error: buildAxiosError('Error', 500),
        errorType: 'InternalServerError',
        response: new InternalServerError('Error', 500),
      },
    ];
    describe.each(scenarios)('WHEN $scenario', ({ statusCode, error, errorType, response }) => {
      it(`THEN a ${errorType} is thrown`, async () => {
        jest.mocked(axios.get).mockRejectedValue(error);
        await expect(getOutages()).rejects.toThrowError(response);
        expect(console.error).toHaveBeenCalledWith(`Error fetching outages, status code: ${statusCode}`);
      });
    });
  });
});

describe('Get Site Info', () => {
  const siteId = 'test-site';

  describe('GIVEN a 200 OK response from /site-info/{siteId}', () => {
    it('THEN the data is returned', async () => {
      const data = [
        {
          id: 'id',
          name: 'name',
          devices: [
            {
              id: 'id',
              name: 'name',
            },
          ],
        },
      ];
      jest.mocked(axios.get).mockResolvedValue({ status: 200, data: data });
      const response = await getSiteInfo(siteId);
      expect(response).toEqual(data);
      expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/site-info/${siteId}`, { headers: { 'x-api-key': apiKey } });
    });
  });

  describe('GIVEN no status code on response from /site-outages/{siteId}', () => {
    it('THEN the origianl error is thrown is returned', async () => {
      const error = new AxiosError('Unexpected Error');
      jest.mocked(axios.get).mockRejectedValue(error);
      await expect(getSiteInfo(siteId)).rejects.toThrowError(error);
      expect(console.error).toHaveBeenCalledWith(`Unexpected error in getSiteInfo with message: ${error.message}`);
    });
  });

  describe('GIVEN an unexpected error calling /site-info/{siteId}', () => {
    it('THEN the error is rethrown', async () => {
      const error = new Error('Unexpected Error');
      jest.mocked(axios.get).mockRejectedValue(error);
      await expect(getSiteInfo(siteId)).rejects.toThrowError(error);
      expect(console.error).toHaveBeenCalledWith(`Unexpected error in getSiteInfo with message: ${error.message}`);
    });
  });
  describe('GIVEN a non 200 response from /site-info/{siteId}', () => {
    const scenarios = [
      {
        statusCode: '403',
        scenario: 'A 403 forbidden response is returned',
        error: buildAxiosError('Forbidden', 403),
        errorType: 'ForbiddenError',
        response: new ForbiddenError('Forbidden', 403),
      },
      {
        statusCode: '404',
        scenario: 'A 404 not found response is returned',
        error: buildAxiosError('Not Found', 404),
        errorType: 'NotFoundError',
        response: new NotFoundError('Not Found', 403),
      },
      {
        statusCode: '429',
        scenario: 'A 429 Too many request response is returned',
        error: buildAxiosError('Too Many Requests', 429),
        errorType: 'TooManyRequestsError',
        response: new TooManyRequestsError('Too Many Requests', 429),
      },
      {
        statusCode: '500',
        scenario: 'A 500 Internal Server Error is returned',
        error: buildAxiosError('Error', 500),
        errorType: 'InternalServerError',
        response: new InternalServerError('Error', 500),
      },
    ];
    describe.each(scenarios)('WHEN $scenario', ({ statusCode, error, errorType, response }) => {
      it(`THEN a ${errorType} is thrown`, async () => {
        jest.mocked(axios.get).mockRejectedValue(error);
        await expect(getSiteInfo(siteId)).rejects.toThrowError(response);
        expect(console.error).toHaveBeenCalledWith(
          `Error fetching site-info, site-id: ${siteId}, status code: ${statusCode}`
        );
      });
    });
  });
});

describe('Post Site Outages', () => {
  const siteId = 'test-site';
  const request = [
    {
      name: 'name',
      id: 'id',
      begin: 'begin',
      end: 'end',
    },
  ];

  describe('GIVEN a 200 OK response from /site-outages/{siteId}', () => {
    it('THEN nothing is returned', async () => {
      jest.mocked(axios.post).mockResolvedValue({ status: 200 });
      await postSiteOutages(siteId, request);
      expect(axios.post).toHaveBeenCalledWith(`${baseUrl}/site-outages/${siteId}`, request, {
        headers: { 'x-api-key': apiKey },
      });
    });
  });

  describe('GIVEN no status code on response from /site-outages/{siteId}', () => {
    it('THEN the origianl error is thrown is returned', async () => {
      const error = new AxiosError('Unexpected Error');
      jest.mocked(axios.post).mockRejectedValue(error);
      await expect(postSiteOutages(siteId, request)).rejects.toThrowError(error);
      expect(console.error).toHaveBeenCalledWith(`Unexpected error in postSiteOutages with message: ${error.message}`);
    });
  });

  describe('GIVEN an unexpected error calling /site-outages/{siteId}', () => {
    it('THEN the error is rethrown', async () => {
      const error = new Error('Unexpected Error');
      jest.mocked(axios.post).mockRejectedValue(error);
      await expect(postSiteOutages(siteId, request)).rejects.toThrowError(error);
      expect(console.error).toHaveBeenCalledWith(`Unexpected error in postSiteOutages with message: ${error.message}`);
    });
  });
  describe('GIVEN a non 200 response from /site-outages/{siteId}', () => {
    const scenarios = [
      {
        statusCode: '403',
        scenario: 'A 403 forbidden response is returned',
        error: buildAxiosError('Forbidden', 403),
        errorType: 'ForbiddenError',
        response: new ForbiddenError('Forbidden', 403),
      },
      {
        statusCode: '404',
        scenario: 'A 404 not found response is returned',
        error: buildAxiosError('Not Found', 404),
        errorType: 'NotFoundError',
        response: new NotFoundError('Not Found', 403),
      },
      {
        statusCode: '429',
        scenario: 'A 429 Too many request response is returned',
        error: buildAxiosError('Too Many Requests', 429),
        errorType: 'TooManyRequestsError',
        response: new TooManyRequestsError('Too Many Requests', 429),
      },
      {
        statusCode: '500',
        scenario: 'A 500 Internal Server Error is returned',
        error: buildAxiosError('Error', 500),
        errorType: 'InternalServerError',
        response: new InternalServerError('Error', 500),
      },
    ];
    describe.each(scenarios)('WHEN $scenario', ({ statusCode, error, errorType, response }) => {
      it(`THEN a ${errorType} is thrown`, async () => {
        jest.mocked(axios.post).mockRejectedValue(error);
        await expect(postSiteOutages(siteId, request)).rejects.toThrowError(response);
        expect(console.error).toHaveBeenCalledWith(
          `Error posting outages, site-id: ${siteId}, status code: ${statusCode}`
        );
      });
    });
  });
});
