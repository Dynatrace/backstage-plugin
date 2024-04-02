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
import { generateKubernetesSelectorFilter } from './labelSelectorParser';

describe('label-parser', () => {
  it('should correctly parse labels', () => {
    // act
    const filter = generateKubernetesSelectorFilter(
      'label1=value1,label2=value2',
    );

    // assert
    expect(filter).toBe(
      '| filter workload.labels[`label1`] == "value1" AND workload.labels[`label2`] == "value2"',
    );
  });

  it('should return empty if there are no labels', () => {
    // act
    const filter = generateKubernetesSelectorFilter('');

    // assert
    expect(filter).toBe('');
  });

  it('should dismiss selectors if they do not contain a key value pair', () => {
    // act
    const filter = generateKubernetesSelectorFilter('label1,label2=value2');

    // assert
    expect(filter).toBe('| filter workload.labels[`label2`] == "value2"');
  });

  it('should return empty string if selector is invalid', () => {
    // act
    const filter = generateKubernetesSelectorFilter('label1=');

    // assert
    expect(filter).toBe('');
  });
});
