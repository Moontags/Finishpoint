import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const urlEnvNames = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_URL",
  "STORAGE_NEXT_PUBLIC_SUPABASE_URL",
  "STORAGE_SUPABASE_URL",
];

const serviceRoleEnvNames = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "STORAGE_SUPABASE_SERVICE_ROLE_KEY",
];

let cachedClient: SupabaseClient | null = null;

function readEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }

  return "";
}

export function isSupabaseConfigured() {
  return Boolean(readEnv(urlEnvNames) && readEnv(serviceRoleEnvNames));
}

export function getSupabaseAdminClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const url = readEnv(urlEnvNames);
  const serviceRoleKey = readEnv(serviceRoleEnvNames);

  if (!url || !serviceRoleKey) {
    return null;
  }

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return cachedClient;
}