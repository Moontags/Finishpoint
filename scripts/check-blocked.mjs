import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const client = createClient(url, key, { auth: { persistSession: false } });

async function fetchRange(a, l) {
  const { data, error } = await client
    .from('blocked_dates')
    .select('blocked_date,reason')
    .gte('blocked_date', a)
    .lte('blocked_date', l);
  console.log(`  ${a} → ${l}:`, error ? `ERR ${error.message}` : data.map(d => d.blocked_date));
}

console.log('Direct supabase calls (no Next.js cache):');
await fetchRange('2026-05-15', '2026-05-21');
await fetchRange('2026-05-18', '2026-05-24');
await fetchRange('2026-05-19', '2026-05-25');
await fetchRange('2026-05-20', '2026-05-26');
await fetchRange('2026-05-21', '2026-05-27');
await fetchRange('2026-06-10', '2026-06-16');

console.log('\nAll rows in blocked_dates:');
const { data } = await client.from('blocked_dates').select('*').order('blocked_date');
console.log(data);
