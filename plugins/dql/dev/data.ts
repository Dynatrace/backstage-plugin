import { TabularData } from '@dynatrace/backstage-plugin-dql-common';

export const exampleData: TabularData = [
  {
    Name: 'backstage',
    Namespace: 'hardening',
    'A Link': {
      type: 'link',
      text: 'https://backstage.io',
      url: 'https://backstage.io',
    },
  },
  {
    Name: 'nginx',
    Namespace: 'default',
    'A Link': {
      type: 'link',
      text: 'https://nginx.org',
      url: 'https://nginx.org',
    },
  },
];
