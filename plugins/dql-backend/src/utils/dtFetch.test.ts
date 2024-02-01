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
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer();

describe('dtFetch', () => {
  beforeAll(() => server.listen());
  beforeEach(() => jest.resetModules());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should set the user-agent header', async () => {
    jest.doMock('../../package.json', () => ({
      name: 'dql-backend',
      version: '1.0.0',
    }));

    server.use(
      rest.get('*', (req, res, ctx) => {
        return res(
          ctx.json({
            userAgent: req.headers.get('user-agent'),
          }),
        );
      }),
    );

    const dtFetchModule = await import('./dtFetch');
    const dtFetch = dtFetchModule.dtFetch;

    const resp = await dtFetch('http://localhost:3000');
    const jsonData = await resp.json();

    expect(jsonData.userAgent).toBe('dql-backend/1.0.0');
  });
});
