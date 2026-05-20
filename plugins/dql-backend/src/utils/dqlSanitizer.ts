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

const assertNoControlCharacters = (value: string, annotationName: string) => {
  // Allow only printable ASCII (0x20-0x7E). Reject control chars,
  // DEL (0x7F), and all non-ASCII Unicode characters.
  if (/[^\x20-\x7E]/.test(value)) {
    throw new Error(`Invalid ${annotationName} annotation format`);
  }
};

export const sanitizeDqlString = (
  value: string,
  annotationName: string,
): string => {
  assertNoControlCharacters(value, annotationName);
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};
