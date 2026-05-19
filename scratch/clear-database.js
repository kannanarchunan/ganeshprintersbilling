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

async function wipeAllData() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { google } = require('googleapis');
  const { JWT } = require('google-auth-library');

  console.log('--- Wiping Supabase Database ---');
  
  // 1. Delete all activity logs
  console.log('Wiping activity_logs table...');
  const { error: logsError } = await supabase.from('activity_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (logsError) console.error('Error wiping logs:', logsError);

  // 2. Delete all places (cascade deletes bills automatically)
  console.log('Wiping places table (cascade deletes bills)...');
  const { error: placesError } = await supabase.from('places').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (placesError) console.error('Error wiping places:', placesError);

  console.log('Supabase database wiped cleanly!');

  console.log('\n--- Wiping Google Sheets Tabs ---');
  
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
  
  privateKey = privateKey.trim();
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.substring(1, privateKey.length - 1);
  } else if (privateKey.startsWith("'") && privateKey.endsWith("'")) {
    privateKey = privateKey.substring(1, privateKey.length - 1);
  }
  privateKey = privateKey.trim();
  privateKey = privateKey.replace(/\\n/g, '\n');

  const auth = new JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.GOOGLE_SHEET_ID;

  const tabs = ['Places', 'Pending Bills', 'Completed Bills', 'Activity Logs'];
  for (const tab of tabs) {
    console.log(`Clearing Google Sheet tab: ${tab}...`);
    try {
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: `${tab}!A2:Z10000`,
      });
      console.log(`Tab ${tab} cleared successfully.`);
    } catch (error) {
      console.warn(`Clearing tab ${tab} failed or was already clean:`, error.message);
    }
  }

  console.log('\nAll data successfully and cleanly wiped! You can start fresh testing now.');
}

wipeAllData();
