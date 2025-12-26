
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SHEET_ID = "1wt2LaCrcWF0l6OIlg5eoeqLB2hSA3CKM4zwm464UjbA";

async function main() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    console.error("Missing credentials");
    return;
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  // Try exact name provided by USER
  const sheetName = "RETHINK CHART - 24MONTHS";
  console.log(`Reading ${sheetName}...`);

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'${sheetName}'!A1:Z30`,
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log("No data found.");
      return;
    }

    console.log("Headers (Row 1-2):");
    console.log(rows[0]);
    console.log(rows[1]);
    
    console.log("\nSample Data (Rows 10-30):");
    rows.slice(9, 30).forEach((row, i) => {
        console.log(`Row ${i+10}:`, row);
    });

  } catch (error) {
    console.error("Error reading sheet:", error);
  }
}

main();
