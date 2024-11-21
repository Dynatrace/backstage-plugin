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
import {
  TableTypes,
  TabularData,
} from '@dynatrace/backstage-plugin-dql-common';

export const exampleData: TabularData = [
  {
    Name: 'backstage',
    Namespace: 'hardening',
    'A Link': {
      type: TableTypes.LINK,
      text: 'https://backstage.io',
      url: 'https://backstage.io',
    },
  },
  {
    Name: 'nginx',
    Namespace: 'default',
    'A Link': {
      type: TableTypes.LINK,
      text: 'https://nginx.org',
      url: 'https://nginx.org',
    },
  },
];
