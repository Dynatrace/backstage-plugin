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

const FIXED_TEST_ID = 'dynatrace-e2e-fixed-test-id';

const isoDate = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{9}Z/;

test('if custom query with tab shows events', async ({ page }) => {
  // arrange
  await page.goto('/');
  await expect(page).toHaveTitle(/Scaffolded Backstage App/);
  await page.getByRole('button', { name: 'Enter' }).click();
  await page.waitForTimeout(1000);
  await page.reload();
  await page.getByRole('link', { name: 'demo-backstage' }).click();
  await page.getByRole('tab', { name: 'Dynatrace' }).click();
  await page.getByRole('tab', { name: 'Davis Events' }).click();
  await expect(page).toHaveTitle(/Davis Events/);

  // assert
  const rowsWithRun = page.getByRole('row', { name: FIXED_TEST_ID });
  await rowsWithRun.first().waitFor({ state: 'visible' });
  await expect(rowsWithRun).toHaveCount(1);
  const expectRowText = async (testId: string, index: number) => {
    await expect(rowsWithRun.nth(index)).toContainText(testId);
    await expect(rowsWithRun.nth(index)).toContainText(isoDate);
  };
  await expectRowText(FIXED_TEST_ID, 0);
});
