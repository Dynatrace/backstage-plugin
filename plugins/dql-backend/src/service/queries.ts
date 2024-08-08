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
import { generateKubernetesSelectorFilter } from '../utils/labelSelectorParser';
import { Entity } from '@backstage/catalog-model';

export enum DynatraceQueryKeys {
  KUBERNETES_DEPLOYMENTS = 'kubernetes-deployments',
  SRG_VALIDATIONS = 'srg-validations',
}

interface ApiConfig {
  environmentName: string;
  environmentUrl: string;
}

export const isValidDynatraceQueryKey = (
  key: string,
): key is DynatraceQueryKeys => key in dynatraceQueries;

export const dynatraceQueries: Record<
  DynatraceQueryKeys,
  (entity: Entity, apiConfig: ApiConfig) => string
> = {
  [DynatraceQueryKeys.KUBERNETES_DEPLOYMENTS]: (entity, apiConfig) => {
    const labelSelector =
      entity.metadata.annotations?.['backstage.io/kubernetes-label-selector'];
    const kubernetesId =
      entity.metadata.annotations?.['backstage.io/kubernetes-id'];
    const namespace =
      entity.metadata.annotations?.['backstage.io/kubernetes-namespace'];

    const filterLabel = labelSelector
      ? generateKubernetesSelectorFilter(labelSelector)
      : '';
    // if a label filter is given, the id is ignored
    const filterKubernetesId =
      filterLabel || !kubernetesId
        ? ''
        : `| filter workload.labels[\`backstage.io/kubernetes-id\`] == "${kubernetesId}"`;
    const filterNamespace = namespace
      ? `| filter Namespace == "${namespace}"`
      : '';

    if (!filterKubernetesId && !filterLabel) {
      throw new Error(
        'One of the component annotations is required: "backstage.io/kubernetes-id" or "backstage.io/kubernetes-label-selector"',
      );
    }

    return `
    fetch dt.entity.cloud_application, from: -10m
    | fields id,
        name = entity.name,
        workload.labels = cloudApplicationLabels,
        cluster.id = clustered_by[dt.entity.kubernetes_cluster],
        namespace.id = belongs_to[dt.entity.cloud_application_namespace]
    | sort upper(name) asc    
    | lookup [fetch dt.entity.kubernetes_cluster, from: -10m | fields id, clusterName = entity.name],sourceField:cluster.id, lookupField:id, fields:{clusterName}
    | lookup [fetch dt.entity.cloud_application_namespace, from: -10m | fields id, namespaceName = entity.name], sourceField:namespace.id, lookupField:id, fields:{namespaceName}
    | fieldsAdd Workload = record({type="link", text=name, url=concat("${apiConfig.environmentUrl}/ui/apps/dynatrace.kubernetes/resources/workload?entityId=", id, "&cluster=", clusterName, "&namespace=", namespaceName, "&workload=", name)})
    | fieldsAdd Cluster = clusterName, Namespace = namespaceName
    | fieldsRemove clusterName, namespaceName
    | lookup [fetch events, from: -30m | filter event.kind == "DAVIS_PROBLEM" | fieldsAdd affected_entity_id = affected_entity_ids[0] | summarize collectDistinct(event.status), by:{display_id, affected_entity_id}, alias:problem_status | filter NOT in(problem_status, "CLOSED") | summarize Problems = count(), by:{affected_entity_id}], sourceField:id, lookupField:affected_entity_id, fields:{Problems}
    | fieldsAdd Problems=coalesce(Problems,0)
    | lookup [ fetch events, from: -30m | filter event.kind=="SECURITY_EVENT" | filter event.category=="VULNERABILITY_MANAGEMENT" | filter event.provider=="Dynatrace" | filter event.type=="VULNERABILITY_STATE_REPORT_EVENT" | filter in(vulnerability.stack,{"CODE_LIBRARY","SOFTWARE","CONTAINER_ORCHESTRATION"}) | filter event.level=="ENTITY" | summarize { workloadId=arrayFirst(takeFirst(related_entities.kubernetes_workloads.ids)), vulnerability.stack=takeFirst(vulnerability.stack)}, by: {vulnerability.id, affected_entity.id} | summarize { Vulnerabilities=count() }, by: {workloadId}], sourceField:id, lookupField:workloadId, fields:{Vulnerabilities}
    | fieldsAdd Vulnerabilities=coalesce(Vulnerabilities,0)
    ${filterKubernetesId} 
    ${filterNamespace} 
    ${filterLabel}
    | fieldsAdd Logs = record({type="link", text="Show logs", url=concat(
      "${apiConfig.environmentUrl}",
      "/ui/apps/dynatrace.notebooks/intent/view-query#%7B%22dt.query%22%3A%22fetch%20logs%20%7C%20filter%20matchesValue(dt.entity.cloud_application%2C%5C%22",
      id,
      "%5C%22)%20%7C%20sort%20timestamp%20desc%22%2C%22title%22%3A%22Logs%22%7D")})
    | fieldsRemove id, name, workload.labels, cluster.id, namespace.id
    | fieldsAdd Environment = "${apiConfig.environmentName}"`;
  },
  [DynatraceQueryKeys.SRG_VALIDATIONS]: (entity, apiConfig) => {
    const catalogTags =
      entity.metadata.annotations?.['dynatrace.com/guardian-tags'];
    let filterString = '';

    if (catalogTags) {
      const tags = catalogTags.split(',').map(tag => {
        const [key, value] = tag.split('=');
        return { key, value: value !== undefined ? value || '' : undefined };
      });

      if (tags.length > 0) {
        filterString += '| filter ';
        filterString += tags
          .map(({ key, value }) =>
            value !== undefined
              ? `in (tags[\`${key}\`], "${value}")`
              : `isNotNull(tags[${key}])`,
          )
          .join(' AND ');
      }
    }
    return `
    fetch bizevents, from: -7d
    | filter event.provider == "dynatrace.site.reliability.guardian"
    | filter event.type == "guardian.validation.finished"
    | parse validation.summary, "JSON:summary"
    | parse execution_context, "JSON:context"
    | parse guardian.tags, "JSON:tags"
    ${filterString}
    | fieldsAdd Version = if(isNull(context[version]), "N/A", else: context[version])
    | fieldsRename \`Validation Result\` = validation.status
    | fieldsAdd Error = summary[error], Fail = summary[fail], Warning = summary[warning], Pass = summary[pass], Info = summary[info]
    | fieldsAdd Environment = "${apiConfig.environmentName}"
    | fieldsAdd Link = record({type="link", text="Open Validation", url=concat(
      "${apiConfig.environmentUrl}",
      "/ui/intent/dynatrace.site.reliability.guardian/view_validation#%7B%22guardian.id%22%3A%22",
      guardian.id,
      "%22%2C%22validation.id%22%3A%22",
      validation.id,
      "%22%7D")})
    | fieldsKeep Fail, Error, Pass, Info, Warning, Link, \`Validation Result\`, Version, Environment
    `;
  },
};
