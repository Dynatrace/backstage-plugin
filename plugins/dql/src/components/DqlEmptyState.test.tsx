import { DqlEmptyState } from './DqlEmptyState';
import { render } from '@testing-library/react';
import React from 'react';

const prepareComponent = ({
  componentName = 'example',
  componentNamespace = 'default',
  queryName = 'query',
  queryNamespace = 'dynatrace',
}: {
  componentName?: string;
  componentNamespace?: string;
  queryName?: string;
  queryNamespace?: string;
}) => {
  return render(
    <DqlEmptyState
      componentName={componentName}
      componentNamespace={componentNamespace}
      queryName={queryName}
      queryNamespace={queryNamespace}
    />,
  );
};

describe('DqlEmptyState', () => {
  it('should include the component and query references in the explanation', () => {
    const componentName = 'example';
    const componentNamespace = 'default';
    const queryName = 'query-id-1';
    const queryNamespace = 'dynatrace';
    const rendered = prepareComponent({
      componentName,
      componentNamespace,
      queryName,
      queryNamespace,
    });

    expect(rendered.getByText(/default.example/)).toBeInTheDocument();
    expect(rendered.getByText(/dynatrace.query-id-1/)).toBeInTheDocument();
  });
});
