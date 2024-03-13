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
interface LabelKeyValue {
  key: string;
  value: string;
}

function parseKubernetesSelector(labelSelector: string): LabelKeyValue[] {
  const statements = labelSelector.split(',');
  return statements
    .map<LabelKeyValue | undefined>(statement => {
      const keyValue = statement.split('=');
      if (keyValue.length < 2) {
        return undefined;
      }
      return {
        key: keyValue[0].trim(),
        value: keyValue[1].trim(),
      };
    })
    .filter((label): label is LabelKeyValue => !!label);
}

/**
 * Parses a kubernetes label selector to a DQL query filter
 * @example
 * 'backstage.io/kubernetes-label-selector': 'label1=value1,label2=value2' to "| filter workload.labels[`label1`] == value1 AND workload.labels[`label2`] == value2
 * @param labelSelector
 */
export function generateKubernetesSelectorFilter(
  labelSelector: string,
): string {
  const labels = parseKubernetesSelector(labelSelector);
  if (labels.length === 0) {
    return '';
  }
  const labelMap = labels
    .map(label => `workload.labels[\`${label.key}\`] == ${label.value}`)
    .join(' AND ');

  return `| filter ${labelMap}`;
}
