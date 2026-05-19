const fs = require('fs');
const path = require('path');

// Load env variables manually from .env.local
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envLines = fs.readFileSync(envPath, 'utf8').split('\n');
  let currentKey = '';
  let currentValue = '';
  let inMultiLine = false;

  for (let line of envLines) {
    if (!inMultiLine) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || '';
        if (val.startsWith('"') && !val.endsWith('"')) {
          inMultiLine = true;
          currentKey = key;
          currentValue = val.substring(1) + '\n';
        } else {
          if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
          }
          process.env[key] = val;
        }
      }
    } else {
      if (line.endsWith('"')) {
        currentValue += line.substring(0, line.length - 1);
        process.env[currentKey] = currentValue;
        inMultiLine = false;
      } else {
        currentValue += line + '\n';
      }
    }
  }
}

async function trigger() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { forceSyncAllData } = require('../lib/sheets/sync');

  console.log('Fetching database data...');
  const { data: places } = await supabase.from('places').select('*').order('name', { ascending: true });
  const { data: bills } = await supabase.from('bills').select('*').order('created_at', { ascending: false });
  const { data: logs } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false });

  console.log(`Syncing ${places.length} places, ${bills.length} bills, and ${logs.length} logs to Google Sheets...`);
  await forceSyncAllData(places, bills, logs);
  console.log('Synchronization complete!');
}

trigger();
