#!/usr/bin/env node
/**
 * Supabase + API smoke test for Supplai.
 * Usage:
 *   SUPABASE_URL=https://<ref>.supabase.co SUPABASE_SECRET_KEY=... API_BASE=https://supplai-api.onrender.com node scripts/supabase-smoke.mjs
 */

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const apiBase = (
  process.env.API_BASE ?? 'https://supplai-api.onrender.com'
).replace(/\/$/, '');

async function main() {
  if (!supabaseUrl || !supabaseKey) {
    console.error(
      'Missing SUPABASE_URL or SUPABASE_SECRET_KEY. Set both to run the live Supabase smoke test.',
    );
    process.exitCode = 1;
    return;
  }

  // 1. Verify Supabase REST schema + seeded facilities
  const restRes = await fetch(
    `${supabaseUrl}/rest/v1/facilities?select=id,name,phone&limit=5`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    },
  );
  if (!restRes.ok) {
    throw new Error(
      `Supabase REST check failed (${restRes.status}): ${await restRes.text()}`,
    );
  }
  const facilities = await restRes.json();
  console.log(
    `[1/4] Supabase REST ok (${facilities.length} facilities visible)`,
  );

  // 2. POST /api/requests
  const facilityPhone = facilities[0]?.phone ?? '+2348000000001';
  const reqRes = await fetch(`${apiBase}/api/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      facilityPhone,
      commodity: 'ors',
      quantity: 20,
    }),
  });
  const reqBody = await reqRes.json();
  console.log(`[2/4] POST /api/requests -> ${reqRes.status}`, reqBody);

  // 3. POST /api/orders/:reference/actions (if offered)
  if (reqBody?.requestReference) {
    const actRes = await fetch(
      `${apiBase}/api/orders/${encodeURIComponent(reqBody.requestReference)}/actions`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'lga_escalate',
          actorRole: 'lga',
          reason: 'Supabase smoke test verification',
        }),
      },
    );
    console.log(
      `[3/4] POST /api/orders/${reqBody.requestReference}/actions -> ${actRes.status}`,
      await actRes.json(),
    );
  } else {
    console.log('[3/4] Skipped order action (no requestReference returned)');
  }

  // 4. GET /api/notifications?role=lga
  const notifRes = await fetch(`${apiBase}/api/notifications?role=lga`);
  const notifBody = await notifRes.json();
  console.log(
    `[4/4] GET /api/notifications?role=lga -> ${notifRes.status} (${notifBody?.events?.length ?? 0} events)`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
