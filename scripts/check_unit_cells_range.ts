
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
    // Fetch wider range around C6/C7 to see the values
    const mtHollyRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'2025 Mt Holly'!A1:F10`, 
    });
    console.log("2025 Mt Holly Range (Rows 1-10):");
    mtHollyRes.data.values?.forEach((row: any, i: number) => console.log(`Row ${i+1}:`, row));

    const hamshireRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'2025 Hamshire'!A1:F10`,
    });
    console.log("2025 Hamshire Range (Rows 1-10):");
    hamshireRes.data.values?.forEach((row: any, i: number) => console.log(`Row ${i+1}:`, row));

  } catch (error) {
    console.error("Error fetching cells:", error);
  }
}

main();
