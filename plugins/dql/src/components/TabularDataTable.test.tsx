import { TabularDataTable } from './TabularDataTable';
import { TabularData } from '@dynatrace/backstage-plugin-dql-common';
import { fireEvent, render, waitFor } from '@testing-library/react';
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

  it('should render 20 rows per page', () => {
    const data: TabularData = Array.from({ length: 30 }).map((_, i) => ({
      Header: `value ${i}`,
    }));
    const rendered = prepareComponent({ data });

    expect(rendered.getAllByRole('row').length).toBe(22); // Including header and pagination
  });

  it('should include a filter option', () => {
    const data: TabularData = [
      {
        Header: 'value',
      },
    ];
    const rendered = prepareComponent({ data });

    expect(rendered.getByLabelText('Search')).toBeInTheDocument();
  });

  it('should filter by the entered text', async () => {
    const data: TabularData = [
      {
        Header: 'value',
      },
      {
        Header: 'other data',
      },
    ];
    const rendered = prepareComponent({ data });

    const searchInput = rendered.getByLabelText('Search');
    fireEvent.change(searchInput, { target: { value: 'other' } });

    waitFor(() => {
      expect(
        rendered.getByText('other data').closest('td'),
      ).toBeInTheDocument();
      expect(rendered.queryByText('value')).not.toBeInTheDocument();
    });
  });
});
