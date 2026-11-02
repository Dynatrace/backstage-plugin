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

// Mock EntityCardBlueprint to avoid zod v3/v4 schema validation incompatibility
jest.mock('@backstage/plugin-catalog-react/alpha', () => ({
  EntityCardBlueprint: {
    makeWithOverrides: jest.fn((params: { name: string }) => ({
      $$type: '@backstage/ExtensionDefinition',
      version: 'v2',
      kind: 'entity-card',
      name: params.name,
      attachTo: { id: 'entity-content:catalog/entity-cards', input: 'items' },
      disabled: false,
      inputs: {},
      output: [],
      factory: jest.fn(),
      toString: jest.fn(() => `entity-card:${params.name}`),
      override: jest.fn(),
    })),
  },
}));

import plugin from './alpha';

describe('alpha', () => {
  it('should export the plugin as default', () => {
    expect(plugin).toBeDefined();
    expect(plugin.$$type).toBe('@backstage/FrontendPlugin');
  });

  it('should have the correct plugin id', () => {
    expect(plugin.id).toBe('dynatrace-dql');
  });
});
