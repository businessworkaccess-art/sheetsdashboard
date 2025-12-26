
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
    // Check 2025 Mt Holly C6
    const mtHollyRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'2025 Mt Holly'!C6`, 
    });
    console.log("2025 Mt Holly!C6:", mtHollyRes.data.values);

    // Check 2024 Mt Holly C6 (Just in case)
    const mtHolly24Res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'2024 Mt Holly'!C6`, 
    });
    console.log("2024 Mt Holly!C6:", mtHolly24Res.data.values);

    // Check 2025 Hamshire C7
    const hamshireRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `'2025 Hamshire'!C7`,
    });
    console.log("2025 Hamshire!C7:", hamshireRes.data.values);

  } catch (error) {
    console.error("Error fetching cells:", error);
  }
}

main();
