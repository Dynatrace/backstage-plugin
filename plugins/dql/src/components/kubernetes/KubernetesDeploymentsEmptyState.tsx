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
}: EmptyStateProps) => {
  const message = `# No Kubernetes resources
  No resources on any monitored Kubernetes cluster for ${componentName} found.`;

  return <DynatraceMarkdownText content={message} />;
};
