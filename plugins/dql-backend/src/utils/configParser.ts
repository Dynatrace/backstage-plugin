/* Copyright [2024] [Dynatrace]
	 Licensed under the Apache License, Version 2.0 (the "License");
	 you may not use this file except in compliance with the License.
	 You may obtain a copy of the License at

		 http://www.apache.org/licenses/LICENSE-2.0

	 Unless required by applicable law or agreed to in writing, software
	 distributed under the License is distributed on an "AS IS" BASIS,
	 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	 See the License for the specific language governing permissions and
	 limitations under the License.*/
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

export const parseCustomQueries = (
  config: Config,
): Record<string, string | undefined> => {
  const queryObjects = config.getOptionalConfigArray('dynatrace.queries') ?? [];
  return queryObjects.reduce((acc, queryObject) => {
    const queryId = queryObject.getOptionalString('id');
    const query = queryObject.getOptionalString('query');
    if (queryId && query) {
      acc[queryId] = query;
    }
    return acc;
  }, {} as Record<string, string | undefined>);
};
