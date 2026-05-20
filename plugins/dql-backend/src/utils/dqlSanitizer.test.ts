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
import { sanitizeDqlString } from './dqlSanitizer';

describe('dql-sanitizer', () => {
  it('should escape backslashes and quotes for DQL strings', () => {
    // act
    const escaped = sanitizeDqlString('a\\b"c', 'some-annotation');

    // assert
    expect(escaped).toBe('a\\\\b\\"c');
  });

  it('should fail for control characters in DQL strings', () => {
    // act, assert
    expect(() => sanitizeDqlString('line1\nline2', 'some-annotation')).toThrow(
      'Invalid some-annotation annotation format',
    );
  });
});
