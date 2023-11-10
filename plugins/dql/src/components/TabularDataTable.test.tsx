import { TabularDataTable } from './TabularDataTable';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';
import { render } from '@testing-library/react';
import React from 'react';

const prepareComponent = ({
  title = 'some title',
  data = [] as TabularData,
}: {
  title?: string;
  data?: TabularData;
}) => {
  return render(<TabularDataTable title={title} data={data} />);
};

describe('TabularDataTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the title', () => {
    const title = 'some title';
    const rendered = prepareComponent({ title });

    expect(rendered.getByText('some title')).toBeInTheDocument();
  });

  it('should render plain text cells', () => {
    const data: TabularData = [
      {
        Header: 'value',
      },
    ];
    const rendered = prepareComponent({ data });

    expect(rendered.getByText('Header').closest('th')).toBeInTheDocument();
    expect(rendered.getByText('value').closest('td')).toBeInTheDocument();
  });

  it('should render link cells', () => {
    const href = 'https://example.com/';
    const data: TabularData = [
      {
        Header: {
          type: 'link',
          text: 'value',
          url: href,
        },
      },
    ];
    const rendered = prepareComponent({ data });

    const link = rendered.getByText('value').closest('a');
    expect(link?.href).toBe(href);
  });
});
