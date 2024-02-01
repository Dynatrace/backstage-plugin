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

describe('user-agent', () => {
  beforeEach(() => jest.resetModules());

  it('should return user agent', async () => {
    jest.doMock('../../package.json', () => ({
      name: 'dql-backend',
      version: '1.0.0',
    }));

    const userAgentModule = await import('./userAgent');
    const getUserAgent = userAgentModule.getUserAgent;

    expect(getUserAgent()).toBe('dql-backend/1.0.0');
  });

  it('should return a sensible default user agent when no data is available', async () => {
    jest.doMock('../../package.json', () => ({}));

    const userAgentModule = await import('./userAgent');
    const getUserAgent = userAgentModule.getUserAgent;

    expect(getUserAgent()).toBe('DynatraceDQLPlugin/0.0.0');
  });
});
