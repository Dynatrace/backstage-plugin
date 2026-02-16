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

function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

const INGEST_TOKEN = required("INGEST_TOKEN");
const TENANT_API_URL = required("TENANT_API_URL");
const RUN_UUID = required("RUN_UUID");

async function postEvent(payload) {
  const res = await fetch(`${TENANT_API_URL}/platform/ingest/v1/events`, {
    method: "POST",
    headers: {
      Authorization: `Api-Token ${INGEST_TOKEN}`,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text().catch(() => "");

  if (res.ok) {
    return;
  }

  console.error(`Ingest failed: (${res.status}) ${res.statusText}`);
  if (text) {
    console.error(`Body: ${text}`);
  }
  process.exit(1);
}

async function main() {
  console.log(`Prepare events using UUID "${RUN_UUID}"`)
  await postEvent({ testId: RUN_UUID });
  await postEvent({ testId: RUN_UUID });
  console.log("Events ingested successfully.");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
