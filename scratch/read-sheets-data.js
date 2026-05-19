const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

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

async function verifyData() {
  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
    privateKey = privateKey.replace(/\\n/g, '\n');

    const auth = new JWT({
      email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Fetch and print Places rows
    console.log('--- PLACES TAB ---');
    const placesRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Places!A1:C10',
    });
    console.log(placesRes.data.values || 'No rows found');

    // Fetch and print Pending Bills rows
    console.log('\n--- PENDING BILLS TAB ---');
    const pendingRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Pending Bills!A1:E10',
    });
    console.log(pendingRes.data.values || 'No rows found');

    // Fetch and print Completed Bills rows
    console.log('\n--- COMPLETED BILLS TAB ---');
    const completedRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Completed Bills!A1:E10',
    });
    console.log(completedRes.data.values || 'No rows found');
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

verifyData();
