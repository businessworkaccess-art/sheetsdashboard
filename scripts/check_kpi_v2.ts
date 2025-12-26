
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

  async function getRange(range: string) {
      const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
      return res.data.values;
  }

  try {
    const rentMH = await getRange("'2025 Mt Holly'!O18");
    const rentHT = await getRange("'2025 Hamshire'!O18");
    const allPropP26 = await getRange("'2025ALL PROPERTIES'!P25:R35"); // Expanded range to find row labels
    const template = await getRange("'Dashboard Template'!A1:L30");

    console.log("--- START DATA ---");
    console.log("Rent MH:", JSON.stringify(rentMH));
    console.log("Rent HT:", JSON.stringify(rentHT));
    console.log("AllProp P25:R35:", JSON.stringify(allPropP26));
    console.log("--- END DATA ---");

  } catch (error) {
    console.error("Error:", error);
  }
}

main();
