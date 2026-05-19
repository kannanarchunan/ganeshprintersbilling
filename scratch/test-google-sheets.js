const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { JWT } = require('google-auth-library');

// 1. Load env variables manually from .env.local
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

async function testConnection() {
  try {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
    privateKey = privateKey.replace(/\\n/g, '\n');

    console.log('Testing Google Sheets connection...');
    console.log('Service Account Email:', email);
    console.log('Private Key length:', privateKey.length);
    console.log('Sheet ID:', process.env.GOOGLE_SHEET_ID);

    if (!email || !privateKey) {
      throw new Error('Google Service Account credentials are not configured.');
    }

    const auth = new JWT({
      email,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    console.log('Fetching spreadsheet metadata...');
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID
    });

    console.log('Success! Connected to Spreadsheet:', metadata.data.properties.title);
    console.log('Sheets (tabs) found in this spreadsheet:');
    metadata.data.sheets.forEach(s => {
      console.log(`- ${s.properties.title} (ID: ${s.properties.sheetId})`);
    });
  } catch (error) {
    console.error('Connection failed with error details:', error);
  }
}

testConnection();
