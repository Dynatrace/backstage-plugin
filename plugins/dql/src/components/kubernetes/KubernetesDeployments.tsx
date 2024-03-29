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
import { DqlQuery } from '../DqlQuery';
import { KubernetesDeploymentsEmptyState } from './KubernetesDeploymentsEmptyState';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
import { useEntity } from '@backstage/plugin-catalog-react';
import React from 'react';

type KubernetesDeploymentsProps = {
  title?: string;
  pageSize?: number;
};

const KUBERNETES_ANNOTATION = 'backstage.io/kubernetes-id';
const KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION =
  'backstage.io/kubernetes-label-selector';

export const KubernetesDeployments = ({
  title = 'Kubernetes Deployments',
  pageSize,
}: KubernetesDeploymentsProps) => {
  const { entity } = useEntity();
  const kubernetesAnnotationValue =
    entity.metadata.annotations?.[KUBERNETES_ANNOTATION];

  const kubernetesLabelSelectorQueryAnnotationValue =
    entity.metadata.annotations?.[KUBERNETES_LABEL_SELECTOR_QUERY_ANNOTATION];

  if (
    !kubernetesAnnotationValue &&
    !kubernetesLabelSelectorQueryAnnotationValue
  ) {
    return (
      <>
        <MissingAnnotationEmptyState annotation={KUBERNETES_ANNOTATION} />
        <h1>
          Or use a label selector query, which takes precedence over the
          previous annotation
        </h1>
      </>
    );
  }

  return (
    <DqlQuery
      title={title}
      queryId="dynatrace.kubernetes-deployments"
      emptyState={KubernetesDeploymentsEmptyState}
      pageSize={pageSize}
    />
  );
};
