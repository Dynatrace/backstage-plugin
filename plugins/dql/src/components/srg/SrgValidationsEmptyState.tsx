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

export const SrgValidationsEmptyState = ({
  componentName,
}: EmptyStateProps) => {
  const message = `# No Site Reliability Guardian resources
  No Site Reliability Guardians for ${componentName} found.
  
  Do not hesitate to integrate Site Reliability Guardians! 
  [View this for more information.](https://docs.dynatrace.com/docs/platform-modules/automations/site-reliability-guardian)
`;

  return <DynatraceMarkdownText content={message} />;
};
