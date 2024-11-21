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
import { TabularDataTable } from './TabularDataTable';
import {
  TableTypes,
  TabularData,
} from '@dynatrace/backstage-plugin-dql-common';
import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

const prepareComponent = ({
  title = 'some title',
  data = [] as TabularData,
  pageSize,
}: {
  title?: string;
  data?: TabularData;
  pageSize?: number;
}) => {
  return render(
    <TabularDataTable title={title} data={data} pageSize={pageSize} />,
  );
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
          type: TableTypes.LINK,
          text: 'value',
          url: href,
        },
      },
    ];
    const rendered = prepareComponent({ data });

    const link = rendered.getByText('value').closest('a');
    expect(link?.href).toBe(href);
  });

  it('should render anything else as JSON', () => {
    const unknownObjectType = {
      type: 'something else',
      text: 'value',
      url: 'https://example.com/',
    };
    const data = [
      {
        Header: unknownObjectType,
      },
    ] as unknown as TabularData;
    const rendered = prepareComponent({ data });

    expect(
      rendered.getByText(JSON.stringify(data[0].Header)),
    ).toBeInTheDocument();
  });

  it('should render 10 rows per page', () => {
    const data: TabularData = Array.from({ length: 30 }).map((_, i) => ({
      Header: `value ${i}`,
    }));
    const rendered = prepareComponent({ data });

    expect(rendered.getAllByRole('row').length).toBe(12); // Including header and pagination
  });

  it('should render the given rows per page', () => {
    const data: TabularData = Array.from({ length: 30 }).map((_, i) => ({
      Header: `value ${i}`,
    }));
    const rendered = prepareComponent({ data, pageSize: 5 });

    expect(rendered.getAllByRole('row').length).toBe(7); // Including header and pagination
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
