import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SHEET_ID = "1wt2LaCrcWF0l6OIlg5eoeqLB2hSA3CKM4zwm464UjbA";

async function main() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(
    /\\n/g,
    "\n"
  );

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

    console.log("--- TABLE 1: FUND TOTALS ---");
    for (let i = 1; i < 6; i++) {
      console.log(rows[i]?.join(" | "));
    }

    console.log("\n--- TABLE 2: CHARLOTTE ---");
    for (let i = 8; i < 11; i++) {
      console.log(rows[i]?.join(" | "));
    }

    console.log("\n--- TABLE 3: HOUSTON ---");
    for (let i = 14; i < 17; i++) {
      console.log(rows[i]?.join(" | "));
    }
  } catch (error) {
    console.error(error);
  }
}

main();
