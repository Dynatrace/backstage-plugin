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
  [Dynatrace documentation](https://www.dynatrace.com/support/help/technology-support/cloud-platforms/kubernetes/deploy-oneagent-on-kubernetes/)
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
