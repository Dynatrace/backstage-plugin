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
import { dynatraceQueries, DynatraceQueryKeys } from './queries';
import { Entity } from '@backstage/catalog-model';

describe('queries', () => {
  const getEntity = (annotations?: Record<string, string>): Entity => ({
    apiVersion: '1.0.0',
    kind: 'component',
    metadata: { name: 'componentName', annotations },
  });
  const defaultApiConfig = {
    environmentName: 'environment',
    environmentUrl: 'url',
  };

  describe(DynatraceQueryKeys.KUBERNETES_DEPLOYMENTS, () => {
    it('should fail if neither the label selector nor the kubernetes id annotation is provided', () => {
      // act, assert
      expect(() =>
        dynatraceQueries[DynatraceQueryKeys.KUBERNETES_DEPLOYMENTS](
          getEntity(),
          defaultApiConfig,
        ),
      ).toThrow();
    });

    it('should return the query without the kubernetesId filter if a label selector is provided', () => {
      // act
      const query = dynatraceQueries[DynatraceQueryKeys.KUBERNETES_DEPLOYMENTS](
        getEntity({
          'backstage.io/kubernetes-id': 'kubernetesId',
          'backstage.io/kubernetes-label-selector': 'label=value',
        }),
        defaultApiConfig,
      );

      // assert
      expect(query).not.toContain(
        '| filter workload.labels[`backstage.io/kubernetes-id`] == "kubernetesId"',
      );
      expect(query).toContain('| filter workload.labels[`label`] == "value"');
    });

    it('should return the query with the kubernetesId filter ', () => {
      // act
      const query = dynatraceQueries[DynatraceQueryKeys.KUBERNETES_DEPLOYMENTS](
        getEntity({ 'backstage.io/kubernetes-id': 'kubernetesId' }),
        defaultApiConfig,
      );

      // assert
      expect(query).toContain(
        '| filter workload.labels[`backstage.io/kubernetes-id`] == "kubernetesId"',
      );
    });

    it('should return the query with the namespace filter', () => {
      // act
      const query = dynatraceQueries[DynatraceQueryKeys.KUBERNETES_DEPLOYMENTS](
        getEntity({
          'backstage.io/kubernetes-id': 'kubernetesId',
          'backstage.io/kubernetes-namespace': 'namespace',
        }),
        defaultApiConfig,
      );

      // assert
      expect(query).toContain('| filter Namespace == "namespace"');
    });

    it('should return the query with the label selector filter', () => {
      // act
      const query = dynatraceQueries[DynatraceQueryKeys.KUBERNETES_DEPLOYMENTS](
        getEntity({
          'backstage.io/kubernetes-label-selector': 'label=value',
          'backstage.io/kubernetes-namespace': 'namespace',
        }),
        defaultApiConfig,
      );

      // assert
      expect(query).toContain('| filter workload.labels[`label`] == "value"');
    });

     it('should return the query with the version column included', () => {
      // act
      const query = dynatraceQueries[DynatraceQueryKeys.KUBERNETES_DEPLOYMENTS](
        getEntity({
          'backstage.io/kubernetes-label-selector': 'label=value',
          'backstage.io/kubernetes-namespace': 'namespace',
        }),
        defaultApiConfig,
      );

      // assert
      expect(query).toContain('| fieldsAdd Version = coalesce(workload.labels[`app.kubernetes.io/version`], "")');
    });
  });
  describe(DynatraceQueryKeys.SRG_VALIDATIONS, () => {
    it('should return the srg-query', () => {
      // act
      const query = dynatraceQueries[DynatraceQueryKeys.SRG_VALIDATIONS](
        getEntity(),
        defaultApiConfig,
      );

      // assert
      
      expect(query).toContain('fetch events');
      expect(query).toContain('| filter event.kind == "SDLC_EVENT" AND event.type == "validation"');
      expect(query).toContain('fetch bizevents');
      expect(query).toContain(
        '| filter event.provider == "dynatrace.site.reliability.guardian"',
      );
    });

    it('should return the srg-query with filtering for tags defined in guardian-tags annotation', () => {
      // act
      const query = dynatraceQueries[DynatraceQueryKeys.SRG_VALIDATIONS](
        getEntity({
          'dynatrace.com/guardian-tags': 'novalue,service=my-service',
        }),
        defaultApiConfig,
      );

      // assert
      expect(query).toContain('fetch events');
      expect(query).toContain('| filter event.kind == "SDLC_EVENT" AND event.type == "validation"');
      expect(query).toContain('fetch bizevents');
      expect(query.match(/isNotNull\(tags\[novalue\]\)/g)?.length).toBe(2);
      expect(query.match(/in \(tags\[`service`\], "my-service"\)/g)?.length).toBe(2);
      expect(query).toContain(
        '| filter event.provider == "dynatrace.site.reliability.guardian"',
      );
    });
  });
});
