/**
 * @license
 * Copyright 2024 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import packageJson from '../../package.json';
import { getUserAgent } from './userAgent';
import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch, { RequestInfo, RequestInit, Response } from 'node-fetch';

const userAgent: string = getUserAgent();
const agent = process.env.HTTP_PROXY
  ? new HttpsProxyAgent(process.env.HTTP_PROXY)
  : ('' as any);

export const dtFetch = (
  url: RequestInfo,
  identifier: string,
  options: RequestInit = {},
): Promise<Response> => {
  // Set the User Agent in the headers
  options.headers = {
    ...options.headers,
    'User-Agent': userAgent,
    Referer: `backstage-plugin@${packageJson.version ?? '1.0.0'}/${identifier}`,
  };

  return fetch(url, { ...options, agent });
};
