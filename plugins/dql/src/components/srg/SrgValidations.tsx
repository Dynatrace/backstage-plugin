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
import { DqlQuery } from '../DqlQuery';
import { SrgValidationsEmptyState } from './SrgValidationsEmptyState';
import React from 'react';

type SrgValidationsProps = {
  title?: string;
  pageSize?: number;
};

export const SrgValidatons = ({
  title = 'Srg Validations',
  pageSize,
}: SrgValidationsProps) => {
  return (
    <DqlQuery
      title={title}
      queryId="dynatrace.srg-validations"
      emptyState={SrgValidationsEmptyState}
      pageSize={pageSize}
    />
  );
};
