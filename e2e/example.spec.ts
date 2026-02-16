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

const url = "http://localhost:3000/catalog/default/component/demo-backstage/dynatrace/davis-events";

test('has title', async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page).toHaveTitle(/Scaffolded Backstage App/);
  await page.getByRole('button', { name: 'Enter' }).click();
  await page.getByRole('link', { name: 'demo-backstage' }).click();
  await page.getByTestId('header-tab-4').click();
  await page.getByRole('tab', { name: 'Davis Events' }).click();
  await expect(page).toHaveTitle(/Davis Events/);
});
