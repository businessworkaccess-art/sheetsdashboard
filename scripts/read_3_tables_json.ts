
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
  const sheetName = "RETHINK CHART - 24MONTHS";

  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'${sheetName}'!A1:Z30`,
    });

    const rows = res.data.values;
    if (!rows) return;

    const data = {
        table1: rows.slice(0, 7), // Fund Totals area
        table2: rows.slice(8, 13), // Charlotte area
        table3: rows.slice(14, 20), // Houston area
    };

    console.log(JSON.stringify(data, null, 2));

  } catch (error) {
    console.error(error);
  }
}

main();
