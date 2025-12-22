import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SHEET_ID = process.env.SHEET_ID ?? "1wt2LaCrcWF0l6OIlg5eoeqLB2hSA3CKM4zwm464UjbA";

async function main() {
  try {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, "\n");

    if (!clientEmail || !privateKey) {
      console.error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_SERVICE_ACCOUNT_KEY");
      process.exit(1);
    }

    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    console.log("Fetching metadata for spreadsheet:", SHEET_ID);
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const sheetTitles =
      meta.data.sheets?.map((s) => s.properties?.title).filter(Boolean) ?? [];
    console.log("Available sheets:", sheetTitles);

    for (const title of sheetTitles) {
      if (!title) continue;
      console.log("\n========================================");
      console.log(`Sheet: ${title}`);
      console.log("Range: A1:Z20");

      const res = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `${title}!A1:Z20`,
      });

      const rows = res.data.values ?? [];
      console.log(`Row count returned: ${rows.length}`);
      rows.slice(0, 20).forEach((row, idx) => {
        console.log(idx + 1, row);
      });
    }
  } catch (err) {
    console.error("Error while testing Sheets access:");
    console.error(err);
    process.exit(1);
  }
}

main();


