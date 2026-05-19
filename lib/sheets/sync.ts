import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { SyncEvent, Place, Bill } from '@/types';

// Sync service account authorization configuration
const getSheetsClient = () => {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
  
  // Replace literal '\n' characters with actual newlines
  privateKey = privateKey.replace(/\\n/g, '\n');

  if (!email || !privateKey) {
    throw new Error('Google Service Account credentials are not configured.');
  }

  const auth = new JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
};

// Simple retry helper
const runWithRetry = async <T>(fn: () => Promise<T>, retries = 1): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Sync operation failed. Retrying... (${retries} attempt remaining)`);
      return await fn();
    }
    throw error;
  }
};

/**
 * Perform non-blocking, real-time database sync to Google Sheets.
 */
export const syncToSheets = async (event: SyncEvent): Promise<void> => {
  // Execute async to ensure non-blocking server API responses
  setTimeout(async () => {
    try {
      const sheetId = process.env.GOOGLE_SHEET_ID;
      if (!sheetId) {
        console.warn('GOOGLE_SHEET_ID environment variable is not defined. Skipping sync.');
        return;
      }

      const sheets = getSheetsClient();

      // Auto-ensure all required tabs exist with beautiful headers
      await ensureSheetTabInitialized(sheets, sheetId, 'Places', ['Place ID', 'Name', 'Created At']);
      await ensureSheetTabInitialized(sheets, sheetId, 'Pending Bills', ['Bill ID', 'Place ID', 'Bill Number', 'Amount', 'Status', 'Created At', 'Completed At', 'Due Date', 'Notes']);
      await ensureSheetTabInitialized(sheets, sheetId, 'Completed Bills', ['Bill ID', 'Place ID', 'Bill Number', 'Amount', 'Status', 'Created At', 'Completed At', 'Due Date', 'Notes']);
      await ensureSheetTabInitialized(sheets, sheetId, 'Activity Logs', ['Log ID', 'Action Type', 'Bill ID', 'Place ID', 'Place Name', 'Bill Number', 'Amount', 'Status', 'Triggered By', 'Timestamp']);

      await runWithRetry(async () => {
        // 1. Process place actions
        if (event.type === 'place_created' && event.place) {
          await appendRow(sheets, sheetId, 'Places', [
            event.place.id,
            event.place.name,
            event.place.created_at,
          ]);
        } 
        
        else if (event.type === 'place_updated' && event.place) {
          await updateRowInTab(sheets, sheetId, 'Places', event.place.id, [
            event.place.id,
            event.place.name,
            event.place.created_at,
          ]);
        } 
        
        else if (event.type === 'place_deleted' && event.place) {
          await deleteRowInTab(sheets, sheetId, 'Places', event.place.id);
        }

        // 2. Process bill actions
        else if (event.type === 'bill_created' && event.bill) {
          const tab = event.bill.status === 'completed' ? 'Completed Bills' : 'Pending Bills';
          await appendRow(sheets, sheetId, tab, formatBillRow(event.bill));
        }

        else if (event.type === 'bill_updated' && event.bill) {
          // A bill can be updated in either Pending or Completed tabs
          const rowValues = formatBillRow(event.bill);
          const didUpdatePending = await updateRowInTab(sheets, sheetId, 'Pending Bills', event.bill.id, rowValues);
          if (!didUpdatePending) {
            await updateRowInTab(sheets, sheetId, 'Completed Bills', event.bill.id, rowValues);
          }
        }

        else if (event.type === 'bill_completed' && event.bill) {
          // Delete from Pending Bills, Append to Completed Bills
          await deleteRowInTab(sheets, sheetId, 'Pending Bills', event.bill.id);
          await appendRow(sheets, sheetId, 'Completed Bills', formatBillRow(event.bill));
        }

        else if (event.type === 'bill_deleted' && event.bill) {
          const didDeletePending = await deleteRowInTab(sheets, sheetId, 'Pending Bills', event.bill.id);
          if (!didDeletePending) {
            await deleteRowInTab(sheets, sheetId, 'Completed Bills', event.bill.id);
          }
        }

        // 3. Log all sync actions to the "Activity Logs" tab
        await logActivity(sheets, sheetId, event);
      });

    } catch (err) {
      // Log errors silently as per spec (non-blocking)
      console.error('Google Sheets Synchronization Error:', err);
    }
  }, 0);
};

// Google Sheet helper functions
const formatBillRow = (bill: Bill) => {
  return [
    bill.id,
    bill.place_id,
    bill.bill_number,
    bill.amount.toString(),
    bill.status,
    bill.created_at,
    bill.completed_at || '',
    bill.due_date || '',
    bill.notes || '',
  ];
};

const appendRow = async (sheets: any, spreadsheetId: string, range: string, values: string[]) => {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${range}!A:A`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
};

const updateRowInTab = async (sheets: any, spreadsheetId: string, range: string, id: string, values: string[]): Promise<boolean> => {
  // Fetch existing rows to locate row index
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${range}!A:A`,
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) return false;

  const rowIndex = rows.findIndex((row: string[]) => row[0] === id);
  if (rowIndex === -1) return false;

  const realRowNumber = rowIndex + 1; // 1-indexed for Google Sheets
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${range}!A${realRowNumber}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
  
  return true;
};

const deleteRowInTab = async (sheets: any, spreadsheetId: string, range: string, id: string): Promise<boolean> => {
  // Fetch existing rows to locate row index
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${range}!A:A`,
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) return false;

  const rowIndex = rows.findIndex((row: string[]) => row[0] === id);
  if (rowIndex === -1) return false;

  // Fetch sheet metadata to find correct sheetId
  const sheetMetadata = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = sheetMetadata.data.sheets.find((s: any) => s.properties.title === range);
  if (!sheet) return false;

  const sheetDbId = sheet.properties.sheetId;

  // Call batchUpdate to delete row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetDbId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });

  return true;
};

const logActivity = async (sheets: any, spreadsheetId: string, event: SyncEvent) => {
  const timestamp = new Date().toISOString();
  const logValues = [
    crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    event.type,
    event.bill?.id || '',
    event.place?.id || event.bill?.place_id || '',
    event.place?.name || '',
    event.bill?.bill_number || '',
    event.bill?.amount?.toString() || '',
    event.bill?.status || '',
    'System App User',
    timestamp,
  ];
  await appendRow(sheets, spreadsheetId, 'Activity Logs', logValues);
};

/**
 * Robustly ensures a sheet tab exists in Google Sheets, and if newly created, initializes headers.
 */
export const ensureSheetTabInitialized = async (sheets: any, spreadsheetId: string, tabName: string, headers: string[]) => {
  const metadata = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetExists = metadata.data.sheets.some((s: any) => s.properties.title === tabName);
  
  if (!sheetExists) {
    // 1. Add the sheet
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          addSheet: {
            properties: { title: tabName }
          }
        }]
      }
    });
    
    // 2. Append the headers
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${tabName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [headers] },
    });
  }
};

/**
 * Clear data rows in a sheet tab (leaving the headers in row 1 intact)
 */
const clearSheetTab = async (sheets: any, spreadsheetId: string, range: string) => {
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${range}!A2:Z10000`,
    });
  } catch (error) {
    console.warn(`Clearing tab ${range} failed or was already clean:`, error);
  }
};

/**
 * Bulk append rows to a sheet tab
 */
const bulkAppendRows = async (sheets: any, spreadsheetId: string, range: string, values: any[][]) => {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${range}!A2`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values },
  });
};

/**
 * Wipes the Google Sheets and does a full rewrite from current database.
 */
export const forceSyncAllData = async (places: Place[], bills: Bill[], logs: any[]): Promise<void> => {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) throw new Error('GOOGLE_SHEET_ID is not defined.');
  
  const sheets = getSheetsClient();
  
  // Ensure all tabs exist and are initialized with headers
  await ensureSheetTabInitialized(sheets, sheetId, 'Places', ['Place ID', 'Name', 'Created At']);
  await ensureSheetTabInitialized(sheets, sheetId, 'Pending Bills', ['Bill ID', 'Place ID', 'Bill Number', 'Amount', 'Status', 'Created At', 'Completed At', 'Due Date', 'Notes']);
  await ensureSheetTabInitialized(sheets, sheetId, 'Completed Bills', ['Bill ID', 'Place ID', 'Bill Number', 'Amount', 'Status', 'Created At', 'Completed At', 'Due Date', 'Notes']);
  await ensureSheetTabInitialized(sheets, sheetId, 'Activity Logs', ['Log ID', 'Action Type', 'Bill ID', 'Place ID', 'Place Name', 'Bill Number', 'Amount', 'Status', 'Triggered By', 'Timestamp']);

  // Clear existing rows (leaving headers in row 1)
  await clearSheetTab(sheets, sheetId, 'Places');
  await clearSheetTab(sheets, sheetId, 'Pending Bills');
  await clearSheetTab(sheets, sheetId, 'Completed Bills');
  await clearSheetTab(sheets, sheetId, 'Activity Logs');

  // Bulk append places
  if (places.length > 0) {
    const values = places.map(p => [p.id, p.name, p.created_at]);
    await bulkAppendRows(sheets, sheetId, 'Places', values);
  }

  // Bulk append bills
  const pendingBills = bills.filter(b => b.status === 'pending');
  const completedBills = bills.filter(b => b.status === 'completed');

  if (pendingBills.length > 0) {
    const values = pendingBills.map(formatBillRow);
    await bulkAppendRows(sheets, sheetId, 'Pending Bills', values);
  }

  if (completedBills.length > 0) {
    const values = completedBills.map(formatBillRow);
    await bulkAppendRows(sheets, sheetId, 'Completed Bills', values);
  }

  // Bulk append activity logs
  if (logs.length > 0) {
    const values = logs.map(l => [
      l.id,
      l.action_type,
      l.bill_id || '',
      l.place_id || l.bill_place_id || '',
      l.place_name || '',
      l.bill_number || '',
      l.amount?.toString() || '',
      l.status || '',
      'System App User',
      l.timestamp,
    ]);
    await bulkAppendRows(sheets, sheetId, 'Activity Logs', values);
  }
};
