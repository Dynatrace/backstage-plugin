import { getUserAgent } from './user-agent';
import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

const userAgent: string = getUserAgent();

export const dtFetch = (
  url: RequestInfo,
  options: RequestInit = {},
): Promise<Response> => {
  // Set the User Agent in the headers
  options.headers = {
    ...options.headers,
    'User-Agent': userAgent,
  };

  return fetch(url, options);
};
