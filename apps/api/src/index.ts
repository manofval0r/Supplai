import { loadConfig } from '@supplai/config';

import { buildApp } from './app.js';
import { SupabaseSmsRepository } from './sms/supabase-repository.js';

const config = loadConfig(process.env);
const repository =
  config.SUPABASE_URL && config.SUPABASE_SECRET_KEY
    ? new SupabaseSmsRepository(config.SUPABASE_URL, config.SUPABASE_SECRET_KEY)
    : undefined;
const app = buildApp({
  logger: true,
  ...(repository ? { repository } : {}),
  ...(config.SMS_WEBHOOK_SECRET
    ? { webhookSecret: config.SMS_WEBHOOK_SECRET }
    : {}),
  ...(config.DELIVERY_PROOF_SECRET
    ? { proofSecret: config.DELIVERY_PROOF_SECRET }
    : {}),
});

try {
  await app.listen({ host: config.HOST, port: config.PORT });
} catch (error) {
  app.log.error(error);
  process.exitCode = 1;
}
