import { ForbiddenError, InternalServerError, NotFoundError, TooManyRequestsError } from '../helpers/errors/errors';
import { executeSiteOutages } from './execute-site-outages';
import getOutagesResponse from '../../test-support/getOutagesStub.json';
import getSiteInfoResponse from '../../test-support/getSiteInfoStub.json';
import filteredOutagesRequest from '../../test-support/filteredOutagesStub.json';
import { SiteOutagesRequest } from '../types';

const mockGetOutages = jest.fn();
const mockGetSiteInfo = jest.fn();
const mockPostSiteOutages = jest.fn();

jest.mock('../services/kf-api', () => ({
  getOutages: () => mockGetOutages(),
  getSiteInfo: (siteId: string) => mockGetSiteInfo(siteId),
  postSiteOutages: (siteId: string, request: SiteOutagesRequest) => mockPostSiteOutages(siteId, request),
}));

jest.spyOn(console, 'error');

describe('postSiteOutages :: GIVEN the script is run', () => {
  const env = process.env;

  const testSiteId = 'kingfisher';
  const testBeforeFilterDate = '2022-01-01T00:00:00.000Z';

  beforeEach(() => {
    jest.resetAllMocks();
    jest.resetModules();

    process.env = { ...env };
  });

  afterEach(() => {
    process.env = { ...env };
  });

  describe('WHEN the environment variables are successfully fetched', () => {
    beforeEach(() => {
      process.env.SITE_ID = testSiteId;
      process.env.FILTER_BEFORE_DATE = testBeforeFilterDate;

      jest.mocked(mockGetOutages).mockResolvedValue(getOutagesResponse);
      jest.mocked(mockGetSiteInfo).mockResolvedValue(getSiteInfoResponse);
      jest.mocked(mockPostSiteOutages).mockResolvedValue(Promise.resolve());
    });

    it('SHOULD throw an error when the filter date is invalid', async () => {
      const invalidValue = 'Not A Date';
      process.env.FILTER_BEFORE_DATE = invalidValue;
      await expect(executeSiteOutages()).rejects.toThrowError(
        Error(
          `Invalid value provided for filter date, expected an ISO DateTime string of format YYYY-MM-DDTHH:MM:SS.MMMZ but received: ${invalidValue}`
        )
      );
      expect(console.error).toHaveBeenCalledWith(
        `Invalid value provided for filter date, expected an ISO DateTime string of format YYYY-MM-DDTHH:MM:SS.MMMZ but received: ${invalidValue}`
      );
    });

    describe('AND the calls to get information are successful', () => {
      describe('AND the call to post site outages returns an InternalServerErorr', () => {
        it('SHOULD post the outages after successful retry', async () => {
          jest.mocked(mockPostSiteOutages).mockRejectedValueOnce(new InternalServerError('Error', 500));

          await executeSiteOutages();
          expect(mockPostSiteOutages).toHaveBeenCalledTimes(2);
        });
        it('SHOULD throw the error after a subsequent failuer', async () => {
          const error = new InternalServerError('Error', 500);
          jest.mocked(mockPostSiteOutages).mockRejectedValue(error);

          await expect(executeSiteOutages()).rejects.toThrowError(error);
        });
      });

      const clientErrorScenarios = [
        {
          errorName: 'ForbiddenError',
          error: new ForbiddenError('Forbidden', 403),
        },
        {
          errorName: 'NotFoundError',
          error: new NotFoundError('Not Found', 404),
        },
        {
          errorName: 'TooManyRequestsError',
          error: new TooManyRequestsError('Too Many Requests', 429),
        },
      ];
      describe.each(clientErrorScenarios)('AND the call to post site outages returns a $errorName', ({ error }) => {
        it('SHOULD throw the error', async () => {
          jest.mocked(mockPostSiteOutages).mockRejectedValue(error);

          await expect(executeSiteOutages()).rejects.toThrowError(error);
        });
      });
      it('SHOULD post the filtered site outages', async () => {
        await executeSiteOutages();
        expect(mockPostSiteOutages).toHaveBeenCalledWith(testSiteId, filteredOutagesRequest);
      });
    });

    const interalServerErrorScenarios = [
      {
        functionName: 'getOutages',
        error: new InternalServerError('Error', 500),
        mock: mockGetOutages,
      },
      {
        functionName: 'getSiteInfo',
        error: new InternalServerError('Error', 500),
        mock: mockGetSiteInfo,
      },
    ];
    describe.each(interalServerErrorScenarios)(
      'AND the call to $functionName returns an InternalServerError',
      ({ error, mock }) => {
        it('SHOULD post the filtered site outages after successful retry', async () => {
          jest.mocked(mock).mockRejectedValueOnce(error);

          await executeSiteOutages();
          expect(mock).toHaveBeenCalledTimes(2);
          expect(mockPostSiteOutages).toHaveBeenCalledWith(testSiteId, filteredOutagesRequest);
        });
        it('SHOULD throw an error after a subsequent failure', async () => {
          jest.mocked(mock).mockRejectedValue(error);

          await expect(executeSiteOutages()).rejects.toThrowError(error);
          expect(mock).toHaveBeenCalledTimes(2);
        });
      }
    );

    const clientErrorScenarios = [
      {
        functionName: 'getOutages',
        errorName: 'ForbiddenError',
        error: new ForbiddenError('Forbidden', 403),
        mock: mockGetOutages,
      },
      {
        functionName: 'getOutages',
        errorName: 'TooManyRequestError',
        error: new TooManyRequestsError('Too Many Request', 429),
        mock: mockGetOutages,
      },
      {
        functionName: 'getSiteInfo',
        errorName: 'ForbiddenError',
        error: new ForbiddenError('Forbidden', 403),
        mock: mockGetSiteInfo,
      },
      {
        functionName: 'getSiteInfo',
        errorName: 'TooManyRequestError',
        error: new TooManyRequestsError('Too Many Request', 429),
        mock: mockGetSiteInfo,
      },
    ];
    describe.each(clientErrorScenarios)('AND the call to $functionName returns a $errorName', ({ error, mock }) => {
      it('SHOULD throw the error', async () => {
        mock.mockRejectedValue(error);

        await expect(executeSiteOutages()).rejects.toThrowError(error);
      });
    });
  });

  describe('WHEN the environment variables fail to be fetched', () => {
    const scenarios = [
      {
        missingVariable: 'FILTER_BEFORE_DATE',
        variableName: 'SITE_ID',
      },
      {
        missingVariable: 'SITE_ID',
        variableName: 'FILTER_BEFORE_DATE',
      },
    ];
    it.each(scenarios)(
      'SHOULD throw an error when failing to fetch $missingVariable',
      async ({ missingVariable, variableName }) => {
        process.env[variableName] = 'test';
        await expect(executeSiteOutages()).rejects.toThrowError(
          Error(`Missing environment variable ${missingVariable}`)
        );
      }
    );
  });
});
