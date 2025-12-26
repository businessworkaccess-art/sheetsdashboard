import { google } from "googleapis";
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const SHEET_ID = "1wt2LaCrcWF0l6OIlg5eoeqLB2hSA3CKM4zwm464UjbA";

function getAuth() {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (!clientEmail || !privateKey) {
    throw new Error("Google Sheets credentials are not configured");
  }

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });
}

async function inspectSheet() {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  console.log("--- Inspecting '2025ALL PROPERTIES' Row Labels ---");
  try {
    // Fetch Column A (Labels) for the first 50 rows
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "'2025ALL PROPERTIES'!A1:A60",
    });
    const rows = res.data.values;
    if (rows) {
      rows.forEach((row, index) => {
        console.log(`Row ${index + 1}: ${row[0]}`);
      });
    } else {
      console.log("No data found in '2025ALL PROPERTIES'.");
    }
  } catch (err) {
    console.error("Error reading '2025ALL PROPERTIES':", err);
  }

  console.log("\n--- Inspecting 'MT Holly!C6' (Expected Units) ---");
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "'MT Holly'!C6",
    });
    console.log(`MT Holly C6 Content: ${JSON.stringify(res.data.values)}`);
  } catch (err) {
    console.error("Error reading 'MT Holly!C6':", err);
  }
  
  console.log("\n--- Inspecting Narrative/Highlights Candidates in 'Dashboard Template' ---");
   try {
    // Check ranges that might contain text
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "'Dashboard Template'!A1:Z50",
    });
    // Just dump a structural view
    const rows = res.data.values;
    if(rows) {
        // Look for keywords "Highlights", "News", "Comments"
        rows.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if(typeof cell === 'string' && (cell.toLowerCase().includes("highlight") || cell.toLowerCase().includes("news") || cell.toLowerCase().includes("review"))) {
                    console.log(`Found '${cell}' at Row ${rowIndex+1}, Col ${colIndex+1} (Index ${colIndex})`);
                }
            })
        })
    }
  } catch (err) {
    console.error("Error reading 'Dashboard Template':", err);
  }
}

inspectSheet();
