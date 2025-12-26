# Dashboard Implementation Plan

## 1. Goal

Update the Rethink Self Storage Dashboard to match the client's provided design sample, syncing real values from the Google Sheet. The sample includes specific sheet references that must be honored.

## 2. Data Mapping Analysis (From Sample Image)

### A. Properties Table (Top Section)

The sample shows a table listing "Rethink Self Storage Fund" properties (Charlotte, Houston).

- **Columns to Display**:
  - Property Name (e.g., "Rethink Self Storage Fund" / "Charlotte")
  - Address (Annotation: _"fetch address from Self Storage"_)
  - Acquisition Date
  - Purchase Price
  - Debt / Equity
  - Loan Terms (Interest Only, Rate, Maturity Date)
- **Data Source**: Likely the `Dashboard Template` or a summary sheet. The annotation "fetch address from Self Storage" implies a lookup or direct reference to a "Self Storage" tab or section.

### B. KPI Cards (Middle Section)

| KPI Metric                        | Sample Annotation / Reference                                                             | Proposed Source Strategy                                                                                                                                                                            |
| :-------------------------------- | :---------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Client Acquisition Cost / LTV** | Charlotte $104 / Houston $144                                                             | Look for "CAC" and "LTV" rows in `2025ALL PROPERTIES` or `Dashboard Template`.                                                                                                                      |
| **Rent Per Sq Foot**              | Charlotte $.99 / Houston $.74                                                             | **Existing**: `sheets.ts` maps rows 22-23 of `2025ALL PROPERTIES`. Verify if this matches current sheet.                                                                                            |
| **5 Star Reviews**                | Charlotte 6, Houston 2                                                                    | Search for "Reviews" row in `2025ALL PROPERTIES` or `Dashboard Template`.                                                                                                                           |
| **Units / Total**                 | _"Sheet: MT Holly Ref: C6"_                                                               | **Action**: Fetch specifically from `MT Holly!C6` and `Hamshire!C6` (for Houston) if applicable, OR verify if `2025ALL PROPERTIES` has this aggregated. The sample explicitly points to `MT Holly`. |
| **MoveIn / Move Outs**            | _"Sheet: 2025ALL PROPERTIES Ref: P28 / P29"_                                              | **Existing**: `sheets.ts` uses indices 27/28 (Rows 28/29). **Action**: Confirm Column P corresponds to the specific month being viewed, or if P implies a static reference.                         |
| **Dashboard Narrative**           | "Fund Highlights", "Charlotte Highlights", "Houston Highlights", "Major News (Checklist)" | Likely static cells in `Dashboard Template` or `EOM Report`. Need to identify specific Range (e.g., "Fund Highlights - lot of words..." area).                                                      |

### C. Charts (Bottom Section)

| Chart                                   | Description           | Source                                                                                                                     |
| :-------------------------------------- | :-------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| **Rethink - Monthly Sales vs Forecast** | Large Area/Line Chart | **Existing**: `sheets.ts` fetches from `RETHINK CHART-24MONTHS`. **Action**: Ensure "Forecast" series is correctly mapped. |
| **Charlotte Revenue**                   | Mini chart + Trend    | `2025ALL PROPERTIES` (Revenue Row) or dedicated chart sheet.                                                               |
| **Houston Revenue**                     | Mini chart + Trend    | `2025ALL PROPERTIES` (Revenue Row) or dedicated chart sheet.                                                               |

## 3. Implementation Steps

### Step 1: Update `src/lib/sheets.ts` (Data Layer)

1.  **Extend `DashboardData` Interface**: Add fields for `address`, `cac`, `ltv`, `reviews`, `highlights`, `majorNews`.
2.  **Implements Specific Fetches**:
    - Add fetch logic for `MT Holly!C6` (Units).
    - Add fetch logic for "Self Storage" sheet (Addresses).
    - Add fetch logic for Narrative/Highlights range (likely from `Dashboard Template`).
3.  **Verify Row Mappings**: Ensure `MoveIn/MoveOuts` (P28/P29) logic correctly handles the "Month" column dynamically (if P is a static month column, we need to know; usually it implies the row number, but we must verify).

### Step 2: Create Components (UI Layer)

- [x] **`PropertiesTable`**: Build a new component to match the top table layout. (Refined existing).
- [x] **`KPIGrid`**: Update existing or create new grid to hold the 5-6 metric cards.
  - [x] Implement "Checklist with emoji" style for the "Major News" card.
- [x] **`NarrativeSection`**: Create a text-heavy section for Fund/Property highlights. (Integrated into KpiGrid).
- [x] **`Charts`**: Refine the Recharts implementation to match the black/gold aesthetic of the sample.

## 4. Immediate Check Actions

Before coding, I will:

1.  **Read values from `2025ALL PROPERTIES`** specifically around Rows 28-29 to confirm headers.
2.  **Locate "Self Storage"** info to confirm address source.
3.  **Locate Narrative** text in the sheet structure.
