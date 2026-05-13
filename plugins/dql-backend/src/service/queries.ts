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
import { sanitizeDqlString } from '../utils/dqlSanitizer';
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

const getKubernetesAnnotation = (entity: Entity, annotationName: string): string | undefined => {
  const value = entity.metadata.annotations?.[annotationName];
  return value ? sanitizeDqlString(value, annotationName) : value;
}

export const dynatraceQueries: Record<
  DynatraceQueryKeys,
  (entity: Entity, apiConfig: ApiConfig) => string
> = {
  [DynatraceQueryKeys.KUBERNETES_DEPLOYMENTS]: (entity, apiConfig) => {
    const labelSelector = getKubernetesAnnotation(entity, 'backstage.io/kubernetes-label-selector');
    const kubernetesId = getKubernetesAnnotation(entity, 'backstage.io/kubernetes-id');
    const namespace = getKubernetesAnnotation(entity, 'backstage.io/kubernetes-namespace');

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

    const dql = `smartscapeNodes "K8S_*", from: -10m
| filter in(type, {"K8S_CRONJOB", "K8S_DAEMONSET", "K8S_DEPLOYMENT", "K8S_STATEFULSET"})
| fields id, id_classic, type, name, Cluster = k8s.cluster.name, Namespace = k8s.namespace.name, workload.labels = \`tags:k8s.labels\`
| sort upper(name) asc
${filterKubernetesId}
${filterNamespace}
${filterLabel}
| fieldsAdd environmentUrl = "${apiConfig.environmentUrl}"
| fieldsAdd Version = coalesce(workload.labels[\`app.kubernetes.io/version\`], "")
| fieldsAdd WorkloadLink = concat(environmentUrl, "/ui/intent/dynatrace.kubernetes/view-entity-dt.smartscape.", lower(type), "#", """{"nodeId":"""", toString(id) ,""""}""")
| fieldsAdd Workload = record({type="link", text=name, url=WorkloadLink})
| fieldsAdd LogLink = concat(
  environmentUrl,
  "/ui/apps/dynatrace.notebooks/intent/view-query#",
  """{"dt.query":"""",
  "fetch logs",
  concat("""\\n| filter k8s.cluster.name == \\"""", Cluster, """\\""""),
  concat("""\\n| filter k8s.namespace.name == \\"""", Namespace, """\\""""),
  concat("""\\n| filter k8s.workload.name == \\"""", name, """\\""""),
  """\\n or in(k8s.pod.name, lookup([smartscapeEdges \\"is_part_of\\"""",
  concat("""\\n | filter target_id == toSmartscapeId(\\"""", toString(id), """\\")"""),
  """ and source_type == \\"K8S_POD\\"\\n | fields k8s.pod.name = getNodeName(source_id)], sourceField:k8s.pod.name, lookupField:k8s.pod.name)[k8s.pod.name])""",
  """\\n| sort timestamp desc""",
  """","title":"Logs"}"""
)
| fieldsAdd Logs = record({type="link", text="Show logs", url=LogLink})
| lookup [fetch events, from: -30m | filter event.kind == "DAVIS_PROBLEM" | fieldsAdd affected_entity_id = smartscape.affected_entities[0][id] | summarize collectDistinct(event.status), by:{display_id, affected_entity_id}, alias:problem_status | filter NOT in(problem_status, "CLOSED") | summarize Problems = count(), by:{affected_entity_id}], sourceField:id, lookupField:affected_entity_id, fields:{Problems}
| fieldsAdd Problems=coalesce(Problems,0)
| lookup [ fetch security.events, from: -30m | filter event.kind=="SECURITY_EVENT" | filter event.category=="VULNERABILITY_MANAGEMENT" | filter event.provider=="Dynatrace" | filter event.type=="VULNERABILITY_STATE_REPORT_EVENT" | filter in(vulnerability.stack,{"CODE_LIBRARY","SOFTWARE","CONTAINER_ORCHESTRATION"}) | filter event.level=="ENTITY" | summarize { workloadId=arrayFirst(takeFirst(related_entities.kubernetes_workloads.ids)), vulnerability.stack=takeFirst(vulnerability.stack)}, by: {vulnerability.id, affected_entity.id} | summarize { Vulnerabilities=count() }, by: {workloadId}], sourceField:id_classic, lookupField:workloadId, fields:{Vulnerabilities}
| fieldsAdd Vulnerabilities=coalesce(Vulnerabilities,0)
| fieldsAdd Environment = "${apiConfig.environmentName}"
| fields Workload, Cluster, Namespace, Problems, Vulnerabilities, Logs, Environment, Version
`
    return dql;
  },
  [DynatraceQueryKeys.SRG_VALIDATIONS]: (entity, apiConfig) => {
    const annotationName = 'dynatrace.com/guardian-tags';
    const catalogTags = entity.metadata.annotations?.[annotationName];
    let filterString = '';

    if (catalogTags) {
      const tags = catalogTags.split(',').map(tag => {
        const [key, value] = tag.split('=').map(v => sanitizeDqlString(v, annotationName));
        return { key, value: value !== undefined ? value || '' : undefined };
      });

      if (tags.length > 0) {
        filterString += '| filter ';
        filterString += tags
          .map(({ key, value }) =>
            value !== undefined
              ? `in (tags[\`${key}\`], "${value}")`
              : `isNotNull(tags[\`${key}\`])`,
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
