import axios, { AxiosError } from 'axios';
import { GetOutagesResponse, GetSiteInfoResponse, SiteOutagesRequest } from '../../types';
import config from '../../config.json';
import { ForbiddenError, InternalServerError, NotFoundError, TooManyRequestsError } from '../../helpers/errors/errors';

export const getOutages = async (): Promise<GetOutagesResponse> => {
  const { baseUrl, apiKey } = config.krakenFlex;
  return await axios
    .get<GetOutagesResponse>(`${baseUrl}/outages`, { headers: { 'x-api-key': apiKey } })
    .catch((error: AxiosError) => {
      if (error.response) {
        const statusCode = error.response.status;
        const message = error.message;
        console.error(`Error fetching outages, status code: ${statusCode}`);
        switch (statusCode) {
          case 403:
            throw new ForbiddenError(message, statusCode);
          case 429:
            throw new TooManyRequestsError(message, statusCode);
          case 500:
          default:
            throw new InternalServerError(message, statusCode);
        }
      }
      console.error(`Unexpected error in getOutages with message: ${(error as Error).message}`);
      throw error;
    })
    .then((value) => value.data);
};

export const getSiteInfo = async (siteId: string): Promise<GetSiteInfoResponse> => {
  const { baseUrl, apiKey } = config.krakenFlex;
  return await axios
    .get<GetSiteInfoResponse>(`${baseUrl}/site-info/${siteId}`, {
      headers: { 'x-api-key': apiKey },
    })
    .catch((error: AxiosError) => {
      if (error.response) {
        const statusCode = error.response.status;
        const message = error.message;
        console.error(`Error fetching site-info, site-id: ${siteId}, status code: ${statusCode}`);
        switch (statusCode) {
          case 403:
            throw new ForbiddenError(message, statusCode);
          case 404:
            throw new NotFoundError(message, statusCode);
          case 429:
            throw new TooManyRequestsError(message, statusCode);
          case 500:
          default:
            throw new InternalServerError(message, statusCode);
        }
      }
      console.error(`Unexpected error in getSiteInfo with message: ${(error as Error).message}`);
      throw error;
    })
    .then((value) => value.data);
};

export const postSiteOutages = async (siteId: string, request: SiteOutagesRequest): Promise<void> => {
  const { baseUrl, apiKey } = config.krakenFlex;
  return await axios
    .post(`${baseUrl}/site-outages/${siteId}`, request, { headers: { 'x-api-key': apiKey } })
    .catch((error: AxiosError) => {
      if (error.response) {
        const statusCode = error.response.status;
        const message = error.message;
        console.error(`Error posting outages, site-id: ${siteId}, status code: ${statusCode}`);
        switch (statusCode) {
          case 403:
            throw new ForbiddenError(message, statusCode);
          case 404:
            throw new NotFoundError(message, statusCode);
          case 429:
            throw new TooManyRequestsError(message, statusCode);
          case 500:
          default:
            throw new InternalServerError(message, statusCode);
        }
      }
      console.error(`Unexpected error in postSiteOutages with message: ${(error as Error).message}`);
      throw error;
    })
    .then((value) => value.data);
};
