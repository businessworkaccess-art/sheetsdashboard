
import { google } from "googleapis";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load env vars
dotenv.config({ path: path.resolve(__dirname, "../../.env.local") });

const SHEET_ID = "1wt2LaCrcWF0l6OIlg5eoeqLB2hSA3CKM4zwm464UjbA";

function log(msg: string) {
    fs.appendFileSync("debug_output.txt", msg + "\n");
}

function getAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (!clientEmail || !privateKey) {
    log("Error: Google Sheets credentials are not configured");
    throw new Error("Google Sheets credentials are not configured");
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

async function debugSheet() {
  try {
    fs.writeFileSync("debug_output.txt", "Starting debug...\n");
    const auth = getAuth();
    const sheets = google.sheets({ version: "v4", auth });

    log("Fetching Dashboard Template A10:C20...");
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "'Dashboard Template'!A10:C20",
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      log("No data found.");
      return;
    }

    log("Row Index | [A] | [B] | [C]");
    rows.forEach((row, index) => {
        const rowNum = 10 + index; // Range starts at 10
        log(`${rowNum} | ${row[0] || ''} | ${row[1] || ''} | ${row[2] || ''}`);
    });

  } catch (error) {
    log("Error: " + JSON.stringify(error));
  }
}

debugSheet();
