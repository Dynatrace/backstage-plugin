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
import { ConfigSchema, loadConfigSchema } from '@backstage/config-loader';

const OAUTH_ENVIRONMENT = {
  name: 'test',
  url: 'https://test.dynatrace.com',
  tokenUrl: 'https://sso.dynatrace.com/sso/oauth2/token',
  clientId: 'test',
  clientSecret: 'test',
  accountUrn: 'test',
};

const PLATFORM_TOKEN_ENVIRONMENT = {
  name: 'test',
  url: 'https://test.dynatrace.com',
  platformToken: 'dt.token.12345',
};

const processConfig = (schema: ConfigSchema, environments: unknown) => () =>
  schema.process([
    {
      context: 'app-config.yaml',
      data: { dynatrace: { environments } },
    },
  ]);

describe('config schema', () => {
  let schema: ConfigSchema;

  beforeAll(async () => {
    schema = await loadConfigSchema({
      dependencies: ['@dynatrace/backstage-plugin-dql-backend'],
      excludePackageDependencies: true,
    });
  }, 30000);

  it('should accept a list of OAuth environments', () => {
    expect(processConfig(schema, [OAUTH_ENVIRONMENT])).not.toThrow();
  });

  it('should accept a list of platform token environments', () => {
    expect(processConfig(schema, [PLATFORM_TOKEN_ENVIRONMENT])).not.toThrow();
  });

  it('should accept a list mixing both environment variants', () => {
    expect(
      processConfig(schema, [OAUTH_ENVIRONMENT, PLATFORM_TOKEN_ENVIRONMENT]),
    ).not.toThrow();
  });

  it('should reject a single environment object', () => {
    expect(processConfig(schema, OAUTH_ENVIRONMENT)).toThrow(/must be array/i);
  });
});
