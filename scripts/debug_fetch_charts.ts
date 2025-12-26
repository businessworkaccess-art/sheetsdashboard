
import { google } from "googleapis";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SHEET_ID = "1wt2LaCrcWF0l6OIlg5eoeqLB2hSA3CKM4zwm464UjbA";

function parseNumericValue(cell: any): number {
  if (!cell) return 0;
  const cleaned = String(cell).replace(/[$,%\s]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

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

  const chartSheetName = "RETHINK CHART - 24MONTHS";
  console.log(`Fetching chart sheet: ${chartSheetName}`);

  try {
    const trendRes = await sheets.spreadsheets.values.get({ 
        spreadsheetId: SHEET_ID, 
        range: `'${chartSheetName}'!A1:Z30` 
    });
    const trendRows = trendRes.data.values ?? [];
    console.log(`trendRows length: ${trendRows.length}`);
    
    // Dump raw rows for verification
    if (trendRows.length > 5) {
        console.log("Row 2 (Header):", trendRows[1]);
        console.log("Row 3 (Charlotte Rev):", trendRows[2]);
        console.log("Row 11 (Charlotte Forecast):", trendRows[10]);
    }

    let revenueTrend: any[] = [];
    if (trendRows.length > 17) {
        const headerRow = trendRows[1] ?? [];
        const charlotteRevRow = trendRows[2] ?? []; 
        const houstonRevRow = trendRows[3] ?? [];
        const totalRevRow = trendRows[4] ?? [];
        const totalForecastRow = trendRows[5] ?? [];
        
        const charlotteForecastRow = trendRows[10] ?? []; 
        const houstonForecastRow = trendRows[16] ?? []; 

        for (let i = 2; i < headerRow.length && i < 26; i++) {
            const monthLabel = String(headerRow[i] || "").trim();
            if (!monthLabel) continue;

            const d = {
                month: monthLabel,
                charlotteRevenue: parseNumericValue(charlotteRevRow[i]),
                rawCharlotteRev: charlotteRevRow[i],
                houstonRevenue: parseNumericValue(houstonRevRow[i]),
                totalRev: parseNumericValue(totalRevRow[i]),
                totalForecast: parseNumericValue(totalForecastRow[i]),
                charlotteForecast: parseNumericValue(charlotteForecastRow[i]),
                houstonForecast: parseNumericValue(houstonForecastRow[i]),
            };
            revenueTrend.push(d);
        }
    }
    
    console.log("Parsed Data (First 3 months):");
    console.log(revenueTrend.slice(0, 3));
    console.log("Parsed Data (Last 3 months):");
    console.log(revenueTrend.slice(-3));

  } catch (e) {
      console.error(e);
  }
}

main();
