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
import { test, expect } from '@playwright/test';

const getEnvVar = (varName: string): string => {
  if (!process.env[varName]) {
    throw new Error(`Env Var "${varName} must be set"`);
  }
  return process.env[varName];
}

const isoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{9}Z$/;

test('if custom query with tab shows events', async ({ page }) => {
  const runUuid = getEnvVar("RUN_UUID");

  // arrange
  await page.goto("http://localhost:3000");
  await expect(page).toHaveTitle(/Scaffolded Backstage App/);
  await page.getByRole('button', { name: 'Enter' }).click();
  await page.getByRole('link', { name: 'demo-backstage' }).click();
  await page.getByTestId('header-tab-4').click();
  await page.getByRole('tab', { name: 'Davis Events' }).click();
  await expect(page).toHaveTitle(/Davis Events/);
  const cells = page.getByRole('cell');
  await cells.first().waitFor({ state: 'visible' }); // Wait until table is loaded

  // assert
  await expect(cells.nth(0)).toHaveText(runUuid);
  await expect(cells.nth(1)).toHaveText(isoDate);
  await expect(cells.nth(2)).toHaveText(runUuid);
  await expect(cells.nth(3)).toHaveText(isoDate);
});
