export const dynatraceQueries: Record<string, string | undefined> = {
  'kubernetes-deployments': `
    fetch dt.entity.cloud_application, from: -10m
    | fields id,
        name = entity.name,
        deploymentVersion = cloudApplicationLabels[\`app.kubernetes.io/version\`],
        workload.labels = cloudApplicationLabels,
        cluster.id = clustered_by[dt.entity.kubernetes_cluster],
        namespace.id = belongs_to[dt.entity.cloud_application_namespace]
    | sort upper(name) asc
    | lookup [fetch dt.entity.cloud_application_instance, from: -10m | fields matchedId = instance_of[dt.entity.cloud_application], podVersion = cloudApplicationLabels[\`app.kubernetes.io/version\`]], sourceField:id, lookupField:matchedId, fields:{podVersion}
    | fieldsAdd Workload = record({type="link", text=name, url=concat("\${environmentUrl}/ui/apps/dynatrace.kubernetes/resources/pod?entityId=", id)})
    | lookup [fetch dt.entity.kubernetes_cluster, from: -10m | fields id, Cluster = entity.name],sourceField:cluster.id, lookupField:id, fields:{Cluster}
    | lookup [fetch dt.entity.cloud_application_namespace, from: -10m | fields id, Namespace = entity.name], sourceField:namespace.id, lookupField:id, fields:{Namespace}
    | lookup [fetch events, from: -30m | filter event.kind == "DAVIS_PROBLEM" | fieldsAdd affected_entity_id = affected_entity_ids[0] | summarize collectDistinct(event.status), by:{display_id, affected_entity_id}, alias:problem_status | filter NOT in(problem_status, "CLOSED") | summarize Problems = count(), by:{affected_entity_id}], sourceField:id, lookupField:affected_entity_id, fields:{Problems}
    | fieldsAdd Problems=coalesce(Problems,0)
    | lookup [ fetch events, from: -30m | filter event.kind=="SECURITY_EVENT" | filter event.category=="VULNERABILITY_MANAGEMENT" | filter event.provider=="Dynatrace" | filter event.type=="VULNERABILITY_STATE_REPORT_EVENT" | filter in(vulnerability.stack,{"CODE_LIBRARY","SOFTWARE","CONTAINER_ORCHESTRATION"}) | filter event.level=="ENTITY" | summarize { workloadId=arrayFirst(takeFirst(related_entities.kubernetes_workloads.ids)), vulnerability.stack=takeFirst(vulnerability.stack)}, by: {vulnerability.id, affected_entity.id} | summarize { Vulnerabilities=count() }, by: {workloadId}], sourceField:id, lookupField:workloadId, fields:{Vulnerabilities}
    | fieldsAdd Vulnerabilities=coalesce(Vulnerabilities,0)
    | filter workload.labels[\`backstage.io/component\`] == "\${componentNamespace}.\${componentName}"
    | fieldsAdd Logs = record({type="link", text="Show logs", url=concat(
      "\${environmentUrl}",
      "/ui/apps/dynatrace.notebooks/intent/view-query#%7B%22dt.query%22%3A%22fetch%20logs%20%7C%20filter%20matchesValue(dt.entity.cloud_application%2C%5C%22",
      id,
      "%5C%22)%20%7C%20sort%20timestamp%20desc%22%2C%22title%22%3A%22Logs%22%7D")})
    | fieldsRemove id, deploymentVersion, podVersion, name, workload.labels, cluster.id, namespace.id
    | fieldsAdd Environment = "\${environmentName}"`,
};
