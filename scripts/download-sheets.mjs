import { google } from "googleapis";
import dotenv from "dotenv";
import fs from "node:fs/promises";
import path from "node:path";

dotenv.config({ path: ".env.local" });

const SHEET_ID = process.env.SHEET_ID ?? "1wt2LaCrcWF0l6OIlg5eoeqLB2hSA3CKM4zwm464UjbA";
const OUTPUT_DIR = path.join(process.cwd(), "sheets");

function toCsv(rows) {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell ?? "");
          if (/[",\n]/.test(value)) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(","),
    )
    .join("\n");
}

async function main() {
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

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  console.log("Downloading all sheets to:", OUTPUT_DIR);

  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheetTitles =
    meta.data.sheets?.map((s) => s.properties?.title).filter(Boolean) ?? [];

  for (const title of sheetTitles) {
    if (!title) continue;
    const safeName = title.replace(/[^\w]+/g, "_");
    const filename = path.join(OUTPUT_DIR, `${safeName}.csv`);

    console.log(`Fetching "${title}" -> ${filename}`);

    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${title}!A1:ZZ1000`,
    });

    const rows = res.data.values ?? [];
    const csv = toCsv(rows);
    await fs.writeFile(filename, csv, "utf8");
  }

  console.log("Done.");
}

main().catch((err) => {
  console.error("Error while downloading sheets:");
  console.error(err);
  process.exit(1);
});


