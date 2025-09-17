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

const getKubernetesLogLink = (idField: string, apiConfig: ApiConfig) => {
  // Resulting DQL:
  // fetch logs
  // | filter dt.entity.cloud_application == "CLOUD_APPLICATION-XY" or in(dt.entity.cloud_application, "CLOUD_APPLICATION-XY") or in(dt.entity.cloud_application_instance, classicEntitySelector("type(CLOUD_APPLICATION_INSTANCE),fromRelationShip.IS_INSTANCE_OF(type(CLOUD_APPLICATION),entityId(\"CLOUD_APPLICATION-XY\"))"))
  // | sort timestamp desc
  const concatArray = [
    `concat("${apiConfig.environmentUrl}"`,
    `"/ui/apps/dynatrace.notebooks/intent/view-query#${encodeURIComponent(
      '{"dt.query":"fetch logs\\n| filter dt.entity.cloud_application == \\"',
    )}"`,
    idField,
    `"${encodeURIComponent('\\" or in(dt.entity.cloud_application, \\"')}"`,
    idField,
    `"${encodeURIComponent(
      '\\") or in(dt.entity.cloud_application_instance, classicEntitySelector(\\"type(CLOUD_APPLICATION_INSTANCE),fromRelationShip.IS_INSTANCE_OF(type(CLOUD_APPLICATION),entityId(\\\\\\"',
    )}"`,
    idField,
    `"${encodeURIComponent(
      '\\\\\\"))\\"))\\n| sort timestamp desc","title":"Logs"}',
    )}")`,
  ];
  return concatArray.join(',');
};

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
    | fieldsAdd Workload = record({type="link", text=name, url=concat("${
      apiConfig.environmentUrl
    }/ui/intent/dynatrace.kubernetes/entityKubernetesWorkload/#%7B%22dt.entity.cloud_application%22%3A%22", id,"%22%7D")})
    | fieldsAdd Cluster = clusterName, Namespace = namespaceName
    | fieldsRemove clusterName, namespaceName
    | lookup [fetch events, from: -30m | filter event.kind == "DAVIS_PROBLEM" | fieldsAdd affected_entity_id = affected_entity_ids[0] | summarize collectDistinct(event.status), by:{display_id, affected_entity_id}, alias:problem_status | filter NOT in(problem_status, "CLOSED") | summarize Problems = count(), by:{affected_entity_id}], sourceField:id, lookupField:affected_entity_id, fields:{Problems}
    | fieldsAdd Problems=coalesce(Problems,0)
    | lookup [ fetch security.events, from: -30m | filter event.kind=="SECURITY_EVENT" | filter event.category=="VULNERABILITY_MANAGEMENT" | filter event.provider=="Dynatrace" | filter event.type=="VULNERABILITY_STATE_REPORT_EVENT" | filter in(vulnerability.stack,{"CODE_LIBRARY","SOFTWARE","CONTAINER_ORCHESTRATION"}) | filter event.level=="ENTITY" | summarize { workloadId=arrayFirst(takeFirst(related_entities.kubernetes_workloads.ids)), vulnerability.stack=takeFirst(vulnerability.stack)}, by: {vulnerability.id, affected_entity.id} | summarize { Vulnerabilities=count() }, by: {workloadId}], sourceField:id, lookupField:workloadId, fields:{Vulnerabilities}
    | fieldsAdd Vulnerabilities=coalesce(Vulnerabilities,0)
    ${filterKubernetesId} 
    ${filterNamespace} 
    ${filterLabel}
    | fieldsAdd Logs = record({type="link", text="Show logs", url=${getKubernetesLogLink(
      'id',
      apiConfig,
    )}})
    | fieldsAdd Environment = "${apiConfig.environmentName}"
    | fieldsAdd Version = coalesce(workload.labels[\`app.kubernetes.io/version\`], "")
    | fieldsRemove id, name, workload.labels, cluster.id, namespace.id`;
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
     fetch events, from: -7d
      | filter event.kind == "SDLC_EVENT" AND event.type == "validation"
      | filter event.provider == "dynatrace.site.reliability.guardian"
      | filter event.status == "finished"
      | parse dt.srg.validation.summary, "JSON:summary"
      | parse execution_context, "JSON:context"
      | parse dt.srg.tags, "JSON:tags"
      ${filterString}
      | fieldsAdd Version = if(isNull(context[version]), "N/A", else: context[version])
      | fieldsRename \`Validation Result\` = validation.result
      | fieldsAdd Error = summary[error], Fail = summary[fail], Warning = summary[warning], Pass = summary[pass], Info = summary[info]
      | fieldsAdd Environment = "${apiConfig.environmentName}"
      | fieldsAdd Link = record({type="link", text="Open Validation", url=concat(
        "${apiConfig.environmentUrl}",
        "/ui/intent/dynatrace.site.reliability.guardian/view_validation#%7B%22guardian.id%22%3A%22",
        dt.srg.id,
        "%22%2C%22validation.id%22%3A%22",
        task.id,
        "%22%7D")})
      | fieldsKeep Fail, Error, Pass, Info, Warning, Link, \`Validation Result\`, Version, Environment
      | append [ 
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
    ]
    `;
  },
};
