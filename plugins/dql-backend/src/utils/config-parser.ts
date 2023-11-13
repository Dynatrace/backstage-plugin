import { DynatraceApi, DynatraceEnvironmentConfig } from '../service';
import { Config } from '@backstage/config';

export const parseEnvironments = (config: Config): DynatraceApi[] => {
  return config
    .getConfigArray('dynatrace.environments')
    .map(
      envConfig =>
        new DynatraceApi(envConfig.get<DynatraceEnvironmentConfig>()),
    );
};

export const parseCustomQueries = (config: Config): Record<string, string> => {
  const queryObjects = config.getOptionalConfigArray('dynatrace.queries') ?? [];
  return queryObjects.reduce((acc, queryObject) => {
    const queryId = queryObject.getOptionalString('id');
    const query = queryObject.getOptionalString('query');
    if (queryId && query) {
      acc[queryId] = query;
    }
    return acc;
  }, {} as Record<string, string>);
};
