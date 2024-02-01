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
import { DynatraceMarkdownText } from './DynatraceMarkdownText';
import { EmptyStateProps } from './types';
import React from 'react';

export const DqlEmptyState = ({
  componentName,
  componentNamespace,
  queryName,
  queryNamespace,
}: EmptyStateProps) => {
  const message = `# We turned up empty

  Query \`${queryNamespace}.${queryName}\` did not return any data for
  component \`${componentNamespace}.${componentName}\`.

  If you recently added the component, it may take a few minutes for
  Dynatrace to start reporting data. If the component has been running
  for a while, it may not be reporting data. Please check that your
  component is indeed reporting data to Dynatrace and, in case you are
  using custom queries, that the query is correct.`;

  return <DynatraceMarkdownText content={message} />;
};
