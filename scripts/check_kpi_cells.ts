
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

  try {
    // Check Rent Per Sq Ft
    const rentMH = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'2025 Mt Holly'!O18`, 
    });
    console.log("2025 Mt Holly!O18 (Rent):", rentMH.data.values);

    const rentHT = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'2025 Hamshire'!O18`,
    });
    console.log("2025 Hamshire!O18 (Rent):", rentHT.data.values);

    // Check Move Ins/Outs from 2025ALL PROPERTIES
    // User says Ref P26. Let's see Row 26 across few columns or specifically Col P.
    const allPropP26 = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'2025ALL PROPERTIES'!P26:S28`, 
    });
    console.log("2025ALL PROPERTIES!P26 range:");
    console.log(allPropP26.data.values);

    // Also check reviews in Dashboard Template if they are there
    const template = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'Dashboard Template'!A1:Z30`,
    });
    console.log("Dashboard Template sample row 12:");
    console.log(template.data.values?.[11]);

  } catch (error) {
    console.error("Error fetching cells:", error);
  }
}

main();
