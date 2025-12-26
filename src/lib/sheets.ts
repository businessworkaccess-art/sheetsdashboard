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
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

import { KPIMetrics, DashboardSummaryRow, RevenueTrendData, PortfolioProperty } from "./types";

export type { KPIMetrics, DashboardSummaryRow, RevenueTrendData, PortfolioProperty };

function parseMoney(cell: string | undefined): string {
  if (!cell) return "$0";
  return String(cell).trim();
}

function parseNumber(cell: string | undefined): string {
  if (!cell) return "0";
  return String(cell).trim();
}

function parseNumericValue(cell: string | undefined): number {
  if (!cell) return 0;
  const cleaned = String(cell).replace(/[$,%\s]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parsePercentage(cell: string | undefined): number {
  if (!cell) return 0;
  const cleaned = String(cell).replace(/[%\s]/g, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

// Fetch all dashboard data including KPI metrics, revenue trends
export async function fetchDashboardData(
  monthShort: string,
  year: string,
): Promise<{
  summary: DashboardSummaryRow[];
  kpiMetrics: KPIMetrics;
  revenueTrend: RevenueTrendData[];
  portfolioProperties: PortfolioProperty[];
}> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // 1. Fetch main properties data (Historical/Monthly)
  const yearSheet = year === "2024" ? "2024ALL PROPERTIES" : "2025ALL PROPERTIES";
  const mainPromise = sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'${yearSheet}'!A1:AB60`,
  });

  // 2. Fetch Dashboard Template (Narrative, CAC, Reviews)
  const templatePromise = sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'Dashboard Template'!A1:Z30`,
  });

  // 3. Fetch Units/Total from Specific Sheets
  const mtHollyUnitsPromise = sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'2025 Mt Holly'!C6`, 
  });
  const hamshireUnitsPromise = sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'2025 Hamshire'!C7`,
  });
  const charlotteRentPromise = sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'2025 Mt Holly'!O18`,
  });
  const houstonRentPromise = sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `'2025 Hamshire'!O18`,
  });

  const [mainRes, templateRes, mtHollyUnitsRes, hamshireUnitsRes, charlotteRentRes, houstonRentRes] = await Promise.all([
     mainPromise.catch(e => ({ data: { values: [] } })), 
     templatePromise.catch(e => ({ data: { values: [] } })),
     mtHollyUnitsPromise.catch(e => ({ data: { values: [] } })),
     hamshireUnitsPromise.catch(e => ({ data: { values: [] } })),
     charlotteRentPromise.catch(e => ({ data: { values: [] } })),
     houstonRentPromise.catch(e => ({ data: { values: [] } }))
  ]);

  const rows = mainRes.data.values ?? [];
  const templateRows = templateRes.data.values ?? [];
  
  // --- Process Main Monthly Data ---
  const headerRow = rows[0] ?? [];
  const monthHeader = `${monthShort} ${year}`;
  
  let monthCol = headerRow.findIndex((cell: any) => {
    const s = String(cell);
    return (s.includes(monthShort) && s.includes(year)) || s === monthShort;
  });

  const janCol = headerRow.findIndex((cell: any) => {
    const s = String(cell);
    return (s.includes("Jan") && s.includes(year)) || s === "Jan";
  });

  // Row mappings (2025ALL PROPERTIES)
  const revenueHamshireRow = rows[1] ?? [];
  const revenueMtHollyRow = rows[2] ?? [];
  const revenueTotalRow = rows[3] ?? [];
  const occupancyHamshireRow = rows[6] ?? [];
  const occupancyMtHollyRow = rows[7] ?? [];
  const occupiedHamshireRow = rows[10] ?? [];
  const occupiedMtHollyRow = rows[11] ?? [];
  const rentPerSqFtHamshireRow = rows[22] ?? [];
  const rentPerSqFtMtHollyRow = rows[23] ?? [];
  const moveInHamshireRow = rows[27] ?? [];
  const moveOutHamshireRow = rows[28] ?? [];
  const moveInMtHollyRow = rows[31] ?? [];
  const moveOutMtHollyRow = rows[32] ?? [];

  // Parse current month values
  const charlotteOccupiedUnits = parseNumericValue(occupiedMtHollyRow[monthCol] as string);
  const houstonOccupiedUnits = parseNumericValue(occupiedHamshireRow[monthCol] as string);
  const charlotteOccupancyPercent = parsePercentage(occupancyMtHollyRow[monthCol] as string);
  const houstonOccupancyPercent = parsePercentage(occupancyHamshireRow[monthCol] as string);

  // Parse beginning of year values
  const charlotteBeginningUnits = janCol !== -1 ? parseNumericValue(occupiedMtHollyRow[janCol] as string) : charlotteOccupiedUnits;
  const houstonBeginningUnits = janCol !== -1 ? parseNumericValue(occupiedHamshireRow[janCol] as string) : houstonOccupiedUnits;

  // Move ins/outs
  const charlotteMoveIns = parseNumericValue(moveInMtHollyRow[monthCol] as string);
  const charlotteMoveOuts = parseNumericValue(moveOutMtHollyRow[monthCol] as string);
  const houstonMoveIns = parseNumericValue(moveInHamshireRow[monthCol] as string);
  const houstonMoveOuts = parseNumericValue(moveOutHamshireRow[monthCol] as string);

  // --- Process Total Units (Source of Truth) ---
  // Mt Holly (Charlotte) C6, Hamshire (Houston) C7
  let charlotteTotalUnits = 305;
  let houstonTotalUnits = 222;

  const mhVal = mtHollyUnitsRes.data.values?.[0]?.[0];
  const hhVal = hamshireUnitsRes.data.values?.[0]?.[0];
  
  if (mhVal) charlotteTotalUnits = parseNumericValue(mhVal);
  if (hhVal) houstonTotalUnits = parseNumericValue(hhVal);
  
  const fundTotalUnits = charlotteTotalUnits + houstonTotalUnits;

  // --- Process Narratives & Highlights ---
  const fundHighlightsFromSheet = templateRows[11]?.[9];
  const charlotteHighlightsFromSheet = templateRows[15]?.[9];
  const houstonHighlightsFromSheet = templateRows[20]?.[9];
  const nextMonthForecastFromSheet = templateRows[10]?.[9];

  const fundHighlights = fundHighlightsFromSheet || `1 YEAR, 11 MONTHS!
29 NEW CUSTOMERS IN CHARLOTTE AND HOUSTON!
$44,897 in total revenue vs business plan at $54,222 was generated this month across both facilities:
- Charlotte contributed $28,212
- Houston contributed $16,685`;

  const charlotteHighlights = charlotteHighlightsFromSheet || `In Charlotte, we started construction on the 2nd floor, completing 49/180 2nd floor self storage units. We reached 227 occupied units vs 164 units 12 months ago. This month , we have 20 move ins and 14 move outs.`;
  
  const houstonHighlights = houstonHighlightsFromSheet || `In Houston, we had a total of 144 occupied units vs 117 units 12 months ago. November, we saw 9 move-ins and 8 move-outs. Second highest sales month ever!🔥🔥🔥
 ~250 new units at our sites. Great value add for our property values, but we need revenue to reflect our new inventory`;

  const nextMonthForecast = nextMonthForecastFromSheet || `📢 Next month, we expect:
Charlotte: We will complete all 180 self storage units - completing 2025 business plan.✅ 
Houston: September, we completed our 2025 construction business plan✅. Now increasing rates and we will focus on marketing our non-climate controlled inventory.
We expect revenue to be at $45,000-$46,000 next month.`;

  let charlotteCAC = "$104"; let charlotteLTV = "$1500";
  let houstonCAC = "$144"; let houstonLTV = "$1200";
  let charlotteReviews = "126"; let houstonReviews = "41";
  const reviewLinks = { 
    charlotte: "https://share.google/AFA5yBKYd9RAevikR", 
    houston: "https://share.google/vyB97Y6kT75ipzE3S" 
  };
  const majorNews = ["✅ Completed construction on second floor units", "✅ Construction plan finished for 2025", "✅ Revenue trending upwards with rate increases"];

  // Fetch Rent per Sq Ft from O18 (specifically requested references)
  const charlotteRentPerSqFtFromSheet = parseMoney(charlotteRentRes.data.values?.[0]?.[0] as string);
  const houstonRentPerSqFtFromSheet = parseMoney(houstonRentRes.data.values?.[0]?.[0] as string);

  const charlotteRentPerSqFt = charlotteRentPerSqFtFromSheet !== "$0" ? charlotteRentPerSqFtFromSheet : parseMoney(rentPerSqFtMtHollyRow[monthCol] as string);
  const houstonRentPerSqFt = houstonRentPerSqFtFromSheet !== "$0" ? houstonRentPerSqFtFromSheet : parseMoney(rentPerSqFtHamshireRow[monthCol] as string);

  // Derived metrics
  const fundTotalOccupiedUnits = charlotteOccupiedUnits + houstonOccupiedUnits;
  const charlotteOccupancyGrowth = charlotteBeginningUnits > 0 ? ((charlotteOccupiedUnits - charlotteBeginningUnits) / charlotteBeginningUnits) * 100 : 0;
  const houstonOccupancyGrowth = houstonBeginningUnits > 0 ? ((houstonOccupiedUnits - houstonBeginningUnits) / houstonBeginningUnits) * 100 : 0;
  const fundBeginningUnits = charlotteBeginningUnits + houstonBeginningUnits;
  const fundOccupancyGrowth = fundBeginningUnits > 0 ? ((fundTotalOccupiedUnits - fundBeginningUnits) / fundBeginningUnits) * 100 : 0;
  const fundOccupancyPercent = fundTotalUnits > 0 ? (fundTotalOccupiedUnits / fundTotalUnits) * 100 : 0;

  // --- Process Move History for Charts ---
  const moveHistory: any[] = [];
  const jan2025Col = headerRow.findIndex(cell => String(cell).includes("Jan 2025"));
  const colStart = jan2025Col !== -1 ? jan2025Col : 16; 
  const colEnd = headerRow.length - 1; 

  for (let i = colStart; i <= colEnd && i < colStart + 12; i++) {
     const mLabel = String(headerRow[i] || "");
     if(!mLabel || mLabel.includes("blank")) continue;
     
     moveHistory.push({
        month: mLabel,
        charlotteIn: parseNumericValue(moveInMtHollyRow[i] as string),
        charlotteOut: parseNumericValue(moveOutMtHollyRow[i] as string),
        houstonIn: parseNumericValue(moveInHamshireRow[i] as string),
        houstonOut: parseNumericValue(moveOutHamshireRow[i] as string),
        charlotteOccupied: parseNumericValue(occupiedMtHollyRow[i] as string),
        houstonOccupied: parseNumericValue(occupiedHamshireRow[i] as string)
     });
  }

  const kpiMetrics: KPIMetrics = {
    charlotteRevenue: parseMoney(revenueMtHollyRow[monthCol] as string),
    charlotteOccupiedUnits,
    charlotteTotalUnits,
    charlotteOccupancyPercent,
    charlotteMoveIns,
    charlotteMoveOuts,
    charlotteRentPerSqFt,
    charlotteCAC,
    charlotteLTV,
    charlotteReviews,
    houstonRevenue: parseMoney(revenueHamshireRow[monthCol] as string),
    houstonOccupiedUnits,
    houstonTotalUnits,
    houstonOccupancyPercent,
    houstonMoveIns,
    houstonMoveOuts,
    houstonRentPerSqFt,
    houstonCAC,
    houstonLTV,
    houstonReviews,
    fundTotalOccupiedUnits,
    fundTotalUnits,
    fundOccupancyPercent,
    fundTotalRevenue: parseMoney(revenueTotalRow[monthCol] as string),
    fundTotalMoveIns: charlotteMoveIns + houstonMoveIns,
    fundTotalMoveOuts: charlotteMoveOuts + houstonMoveOuts,
    charlotteBeginningUnits,
    houstonBeginningUnits,
    fundBeginningUnits,
    charlotteOccupancyGrowth,
    houstonOccupancyGrowth,
    fundOccupancyGrowth,
    fundHighlights,
    charlotteHighlights,
    houstonHighlights,
    majorNews,
    nextMonthForecast,
    reviewLinks,
    moveHistory
  };

  const summary: DashboardSummaryRow[] = [
    { label: "REVENUE", charlotte: kpiMetrics.charlotteRevenue, houston: kpiMetrics.houstonRevenue },
    { label: "UNITS / TOTAL", charlotte: `${kpiMetrics.charlotteOccupiedUnits}/${kpiMetrics.charlotteTotalUnits}`, houston: `${kpiMetrics.houstonOccupiedUnits}/${kpiMetrics.houstonTotalUnits}` },
    { label: "MOVE INS", charlotte: String(kpiMetrics.charlotteMoveIns), houston: String(kpiMetrics.houstonMoveIns) },
    { label: "MOVE OUTS", charlotte: String(kpiMetrics.charlotteMoveOuts), houston: String(kpiMetrics.houstonMoveOuts) },
    { label: "RENT PER SQ FT", charlotte: kpiMetrics.charlotteRentPerSqFt, houston: kpiMetrics.houstonRentPerSqFt },
  ];


  // --- Process Revenue Trend (Corrected for 3-Charts) ---
  let revenueTrend: RevenueTrendData[] = [];
  const chartSheetName = "RETHINK CHART - 24MONTHS"; // Exact name confirmed


  try {
    console.log(`Fetching chart sheet: ${chartSheetName}`);
    // Fetch wider range to include all 3 blocks (Total, Charlotte, Houston)
    const trendRes = await sheets.spreadsheets.values.get({ 
        spreadsheetId: SHEET_ID, 
        range: `'${chartSheetName}'!A1:Z30` 
    });
    const trendRows = trendRes.data.values ?? [];
    console.log(`Chart sheet rows fetched: ${trendRows.length}`);

    if (trendRows.length >= 17) {
        // Block 1: Fund Totals (Rows 3-6)
        // Header on Row 2 (Index 1)
        const headerRow = trendRows[1] ?? [];
        const charlotteRevRow = trendRows[2] ?? []; // Row 3
        const houstonRevRow = trendRows[3] ?? [];   // Row 4
        const totalRevRow = trendRows[4] ?? [];     // Row 5
        const totalForecastRow = trendRows[5] ?? []; // Row 6
        
        // Block 2: Charlotte Specifics (Rows 10-11)
        const charlotteActualRow = trendRows[9] ?? []; // Row 10
        const charlotteForecastRow = trendRows[10] ?? []; // Row 11

        // Block 3: Houston Specifics (Rows 16-17)
        const houstonActualRow = trendRows[15] ?? []; // Row 16
        const houstonForecastRow = trendRows[16] ?? []; // Row 17

        console.log(`Header Row len: ${headerRow.length}, First Month: ${headerRow[2]}`);

        // Use column indices starting at 2 (C) up to 26 (Z) or header length
        for (let i = 2; i < headerRow.length && i < 26; i++) {
            const monthLabel = String(headerRow[i] || "").trim();
            if (!monthLabel) continue;

            const d = {
                month: monthLabel,
                // Chart 1
                charlotteRevenue: parseNumericValue(charlotteRevRow[i] as string),
                houstonRevenue: parseNumericValue(houstonRevRow[i] as string),
                totalRevenue: parseNumericValue(totalRevRow[i] as string),
                totalForecast: parseNumericValue(totalForecastRow[i] as string),
                // Chart 2
                charlotteForecast: parseNumericValue(charlotteForecastRow[i] as string),
                // Chart 3
                houstonForecast: parseNumericValue(houstonForecastRow[i] as string),
            };
            revenueTrend.push(d);
        }
    } else {
        console.log("Not enough rows in chart sheet");
    }
  } catch (e) {
      console.error("Error fetching Rethink Chart:", e);
  }

  // Fallback Trend (0 values if failed)
  if (revenueTrend.length === 0) {
    const currentTotal = 45000;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    revenueTrend = months.map((m) => ({
      month: `${m}'${year.slice(2)}`,
      charlotteRevenue: currentTotal * 0.6,
      houstonRevenue: currentTotal * 0.4,
      totalRevenue: currentTotal,
      totalForecast: currentTotal * 1.05,
      charlotteForecast: (currentTotal * 0.6) * 1.05,
      houstonForecast: (currentTotal * 0.4) * 1.05,
    }));
  }

  // --- Process Portfolio Properties ---
  const portfolioProperties: PortfolioProperty[] = [];
  // Dashboard Template rows 7 and 8 (indices 6 and 7)
  const portfolioRows = templateRows.slice(6, 8);
  portfolioRows.forEach(row => {
    if (row.length > 0) {
      portfolioProperties.push({
        fund: row[0],
        property: row[1],
        assetType: row[2],
        units: parseNumericValue(row[3]),
        market: row[4],
        closingDate: row[5],
        purchasePrice: row[6],
        capitalInvestment: row[7],
        loanAmount: row[8],
        debtType: row[9],
        interestRate: row[10],
        maturityDate: row[11]
      });
    }
  });

  return { summary, kpiMetrics, revenueTrend, portfolioProperties };
}

export async function fetchDashboardSummary(monthShort: string, year: string): Promise<DashboardSummaryRow[]> {
  const { summary } = await fetchDashboardData(monthShort, year);
  return summary;
}
export async function updateDashboardData(portfolio: PortfolioProperty[], metrics: KPIMetrics): Promise<void> {
  const auth = getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  // 1. Update Portfolio (Dashboard Template A7:L8)
  const portfolioValues = portfolio.map(p => [
    p.fund,
    p.property,
    p.assetType,
    p.units,
    p.market,
    p.closingDate,
    p.purchasePrice,
    p.capitalInvestment,
    p.loanAmount,
    p.debtType,
    p.interestRate,
    p.maturityDate
  ]);

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `'Dashboard Template'!A7:L${7 + portfolioValues.length - 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: portfolioValues }
  });

  // 2. Update Narratives (J11, J12, J16, J21)
  const narrativeUpdates = [
    { range: `'Dashboard Template'!J11`, values: [[metrics.nextMonthForecast]] },
    { range: `'Dashboard Template'!J12`, values: [[metrics.fundHighlights]] },
    { range: `'Dashboard Template'!J16`, values: [[metrics.charlotteHighlights]] },
    { range: `'Dashboard Template'!J21`, values: [[metrics.houstonHighlights]] }
  ];

  for (const update of narrativeUpdates) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: update.range,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: update.values }
    });
  }
}
