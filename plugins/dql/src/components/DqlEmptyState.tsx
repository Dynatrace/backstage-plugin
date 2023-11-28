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
