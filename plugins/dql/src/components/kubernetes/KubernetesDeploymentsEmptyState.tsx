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
import { EmptyStateProps } from '..';
import { DynatraceMarkdownText } from '../DynatraceMarkdownText';
import React from 'react';

export const KubernetesDeploymentsEmptyState = ({
  componentName,
  componentNamespace,
}: EmptyStateProps) => {
  const message = `# We could not find any Kubernetes deployments

  Dynatrace does not have any data for component \`${componentNamespace}.${componentName}\`.

  To start tracking Kubernetes deployments, you need to deploy the Dynatrace OneAgent
  Operator to your cluster. See the
  [Dynatrace documentation](https://docs.dynatrace.com/docs/setup-and-configuration/dynatrace-oneagent)
  for more information.

  Also, make sure that the \`backstage.io/component\` label is set to
  \`${componentNamespace}.${componentName}\` on your Kubernetes deployments:

  \`\`\`yaml
  metadata:
    name: ${componentName}-deployment
    labels:
      backstage.io/component: "${componentNamespace}.${componentName}"
  \`\`\`

  If you recently added the component, it may take a few minutes for
  Dynatrace to start reporting data.`;

  return <DynatraceMarkdownText content={message} />;
};
