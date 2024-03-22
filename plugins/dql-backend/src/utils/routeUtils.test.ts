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
import { validateQueryParameters } from './routeUtils';

describe('routeUtils', () => {
  describe('validateQueryParameters', () => {
    describe('kubernetes-deployments', () => {
      it('should fail if kubernetesId and label selector is not given', () => {
        expect(() =>
          validateQueryParameters({}, 'kubernetes-deployments'),
        ).toThrow();
      });

      it('should not fail if kubernetes-label-selector is given', () => {
        expect(() =>
          validateQueryParameters(
            { labelSelector: 'stage=hardening' },
            'kubernetes-deployments',
          ),
        ).not.toThrow();
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
