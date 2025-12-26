import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const SHEET_ID = "1wt2LaCrcWF0l6OIlg5eoeqLB2hSA3CKM4zwm464UjbA";

async function main() {
  try {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, "\n");
    const auth = new google.auth.JWT({
      email: clientEmail, key: privateKey, scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = google.sheets({ version: "v4", auth });

    // 1. Google Reviews
    console.log("\n--- 'Google Reviews' Sheet ---");
    try {
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "'Google Reviews'!A1:F10" });
        console.log(res.data.values);
    } catch(e) { console.log(e.message); }

    // 2. Mapping Mt Holly
    console.log("\n--- 'Mapping Mt Holly' Sheet ---");
    try {
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "'Mapping Mt Holly'!A1:F10" });
        console.log(res.data.values);
    } catch(e) { console.log(e.message); }

    // 3. For Automation
    console.log("\n--- 'For Automation' Sheet ---");
    try {
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "'For Automation'!A1:H20" });
        console.log(res.data.values);
    } catch(e) { console.log(e.message); }

    // 4. Client Acquisition / LTV Search
    console.log("\n--- Searching for CAC / LTV in '2025ALL PROPERTIES' & 'Dashboard Template' ---");
    // Check Dashboard Template for these values as they appear in the sample image there
    try {
        const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range: "'Dashboard Template'!A1:F40" });
        const rows = res.data.values || [];
        rows.forEach((row, i) => {
            row.forEach((cell, j) => {
                if(String(cell).includes("Client Acquisition") || String(cell).includes("LTV") || String(cell).includes("Life Time")) {
                    console.log(`Found '${cell}' in Dashboard Template at Row ${i+1}, Col ${j+1}`);
                }
            });
        });
    } catch(e) { console.log(e.message); }

  } catch (err) { console.error("Error:", err); }
}

main();
