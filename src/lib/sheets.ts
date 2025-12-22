import { google } from "googleapis";

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

export type DashboardSummaryRow = {
  label: string;
  charlotte: string;
  houston: string;
};

function parseMoney(cell: string | undefined): string {
  if (!cell) return "";
  return String(cell).trim();
}

function parseNumber(cell: string | undefined): string {
  if (!cell) return "";
  return String(cell).trim();
}

export async function fetchDashboardSummary(
  monthShort: string,
  year: string,
): Promise<DashboardSummaryRow[]> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // Use 2025ALL PROPERTIES sheet to compute KPIs directly
  const range = "'2025ALL PROPERTIES'!A1:AA60";
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range,
  });

  const rows = res.data.values ?? [];

  const headerRow = rows[0] ?? [];
  const monthHeader = `${monthShort} ${year}`;
  const monthCol = headerRow.findIndex((cell) => cell === monthHeader);

  if (monthCol === -1) {
    throw new Error(`Month column not found for ${monthHeader}`);
  }

  // Based on the observed structure of 2025ALL_PROPERTIES
  const revenueHamshireRow = rows[1] ?? [];
  const revenueMtHollyRow = rows[2] ?? [];

  const occupiedHamshireRow = rows[11] ?? [];
  const occupiedMtHollyRow = rows[12] ?? [];

  const moveInHamshireRow = rows[28] ?? [];
  const moveOutHamshireRow = rows[29] ?? [];

  const moveInMtHollyRow = rows[37] ?? [];
  const moveOutMtHollyRow = rows[38] ?? [];

  const rentPerSqFtHamshireRow = rows[23] ?? [];
  const rentPerSqFtMtHollyRow = rows[24] ?? [];

  const summary: DashboardSummaryRow[] = [
    {
      label: "REVENUE",
      charlotte: parseMoney(revenueMtHollyRow[monthCol] as string | undefined),
      houston: parseMoney(revenueHamshireRow[monthCol] as string | undefined),
    },
    {
      label: "UNITS / TOTAL (OCCUPIED)",
      charlotte: parseNumber(
        occupiedMtHollyRow[monthCol] as string | undefined,
      ),
      houston: parseNumber(
        occupiedHamshireRow[monthCol] as string | undefined,
      ),
    },
    {
      label: "MOVE INS",
      charlotte: parseNumber(moveInMtHollyRow[monthCol] as string | undefined),
      houston: parseNumber(
        moveInHamshireRow[monthCol] as string | undefined,
      ),
    },
    {
      label: "MOVE OUTS",
      charlotte: parseNumber(
        moveOutMtHollyRow[monthCol] as string | undefined,
      ),
      houston: parseNumber(
        moveOutHamshireRow[monthCol] as string | undefined,
      ),
    },
    {
      label: "RENT PER SQ FT",
      charlotte: parseNumber(
        rentPerSqFtMtHollyRow[monthCol] as string | undefined,
      ),
      houston: parseNumber(
        rentPerSqFtHamshireRow[monthCol] as string | undefined,
      ),
    },
  ];

  return summary;
}


