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
import { generateComplexFilter, validateQueryParameters } from './routeUtils';

describe('routeUtils', () => {
  const kubernetesFilter =
    '| filter workload.labels[`backstage.io/kubernetes-id`] == "kubernetesId"';
  const labelFilter = '| filter workload.labels[`label1`] == "value1"';
  const namespaceFilter = '| filter Namespace == "namespace"';

  describe('generateComplexFilter', () => {
    it('should return a filter for all given values', () => {
      // act
      const filter = generateComplexFilter(
        'kubernetesId',
        'label1=value1',
        'namespace',
      );

      // assert
      expect(filter).toBe(
        `${kubernetesFilter}\n${labelFilter}\n${namespaceFilter}`,
      );
    });

    it('should not return kubernetesId filter if not given', () => {
      // act
      const filter = generateComplexFilter(
        undefined,
        'label1=value1',
        'namespace',
      );

      // assert
      expect(filter).toBe(`${labelFilter}\n${namespaceFilter}`);
    });

    it('should not return label filter if not given', () => {
      // act
      const filter = generateComplexFilter(
        'kubernetesId',
        undefined,
        'namespace',
      );

      // assert
      expect(filter).toBe(`${kubernetesFilter}\n${namespaceFilter}`);
    });

    it('should not return namespace filter if not given', () => {
      // act
      const filter = generateComplexFilter(
        'kubernetesId',
        'label1=value1',
        undefined,
      );

      // assert
      expect(filter).toBe(`${kubernetesFilter}\n${labelFilter}`);
    });

    it('should not return any filter if none is given', () => {
      // act
      const filter = generateComplexFilter(undefined, undefined, undefined);

      // assert
      expect(filter).toBe('');
    });
  });

  describe('validateQueryParameters', () => {
    describe('kubernetes-deployments', () => {
      it('should fail if kubernetesId is not given', () => {
        expect(() =>
          validateQueryParameters({}, 'kubernetes-deployments'),
        ).toThrow();
      });

      it('should not fail if kubernetesId is given', () => {
        expect(() =>
          validateQueryParameters(
            { kubernetesId: 'my-id' },
            'kubernetes-deployments',
          ),
        ).not.toThrow();
      });
    });
  });
});
