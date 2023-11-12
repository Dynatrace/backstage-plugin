import { TabularData } from '@dynatrace/backstage-plugin-dql-common';

export type DqlQueryApi = {
  getData(
    queryNamespace: string,
    queryName: string,
    componentName: string,
    componentNamespace: string,
  ): Promise<TabularData>;
};
