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
import { ObjectModalProps, ObjectModal } from './ObjectModal';
import { renderInTestApp } from '@backstage/test-utils';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';

const prepareComponent = async ({
  data = '{}',
  property = 'my prop',
}: Partial<ObjectModalProps> = {}) => {
  return await renderInTestApp(<ObjectModal data={data} property={property} />);
};

const getOpenModalButton = () =>
  screen.getByRole('button', { name: 'Complex record' });
const getCloseModalButton = () => screen.getByRole('button', { name: 'close' });

describe('ObjectModal', () => {
  it('should open the modal with JSON data', async () => {
    // arrange
    await prepareComponent({
      data: JSON.stringify({ myProperty: 'My value' }),
    });

    // act
    await userEvent.click(getOpenModalButton());

    // assert
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(screen.getByRole('dialog')).toHaveTextContent(
      '"myProperty":"My value"',
    );
  });

  it('should close the modal on close button click', async () => {
    // arrange
    await prepareComponent({
      data: JSON.stringify({ myProperty: 'My value' }),
    });

    // act
    await userEvent.click(getOpenModalButton());
    await userEvent.click(getCloseModalButton());

    // assert
    expect(screen.queryByRole('dialog')).not.toBeVisible();
  });
});
