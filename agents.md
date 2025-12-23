## Rethink Dashboard – Context & Agent Guide

This document gives AI agents and developers a shared context for working on the **Rethink EOM dashboard** that syncs with Google Sheets.

### 1. Product Context

- **Goal**: Build a web dashboard that mirrors the client’s `Dashboard Template` tab (“EOM Report - Rethink (USE ME)”) and related sheets, showing monthly/quarterly performance for self‑storage assets.
- **Primary users**: Internal owners/operators and LPs who need a clean, readable summary: revenue, occupancy, units, move‑ins/outs, CAC/LTV, and narrative commentary.
- **Single source of truth**: Google Sheets workbook  
  `https://docs.google.com/spreadsheets/d/1wt2LaCrcWF0l6OIlg5eoeqLB2hSA3CKM4zwm464UjbA`

### 2. Data & Sheets

- Use **Google Sheets API** via service account JSON (`gen-lang-client-0967717356-8dcb92285103.json`).
- Key tab for layout and KPIs: **`Dashboard Template`** (EOM Report – Rethink).
- Supporting tabs (examples, not exhaustive): `2025ALL PROPERTIES`, `2024ALL PROPERTIES`, `2025 MONTHLY SALES`, `Expenses`, property‑specific monthly tabs (`2025Aug`, `2025Aug-MH`, etc.).
- Treat sheets as **authoritative**. The dashboard should never manually override numbers; only compute clear aggregations or formatting on top of sheet data.

### 3. Tech Stack & Access Pattern

- **Framework**: Next.js (React).
- **Data access**:
  - Server‑side API routes call Google Sheets API with the service account.
  - Data **refreshes on every page load** (no long‑lived cache unless explicitly added later).
  - Prefer reading **narrow ranges** instead of whole sheets when possible.
- **Front end**:
  - React components consume typed JSON from internal API endpoints.
  - Filters (month, year, property/market) live in the client and drive queries to API routes.

### 4. Spec‑Driven Development Workflow

When adding or changing features, follow this sequence:

1. **Requirements spec**
   - Clarify: KPI list, filters, any new charts/sections, export needs.
2. **Data contract spec**
   - Define the response shape for each API: field names, types, and example payloads.
3. **Sheet mapping spec**
   - Document exact tab and A1 ranges each field derives from (e.g. `2025ALL PROPERTIES!C6:D6`).
4. **UI spec**
   - Describe layout sections, interactions, and how filters affect components.
5. **Implementation**
   - First implement/adjust API to satisfy the data contract.
   - Then implement/adjust UI components strictly against the API spec.
6. **Verification**
   - Cross‑check dashboard values against the underlying sheets for at least one full month/year.

Keep specs light but explicit; update them before coding when behavior changes.

### 5. Dashboard Requirements (High Level)

- **Filters**:
  - At minimum: **month** and **year**.
  - Prefer also **market/property** (e.g., Charlotte, Houston, Mt Holly) when present in data.
- **Exports**:
  - A **Download** button capable of exporting the current dashboard view to **PNG, JPEG, and PDF**.
- **Layout guidance**:
  - Use the `Dashboard Template` and provided screenshots as visual reference.
  - Include KPI tiles, charts (actual vs. forecast, NOI trends), occupancy visuals, and narrative text areas.
  - Support basic responsiveness for desktop and tablet.

### 6. Agent Behavior Guidelines

- Always **read existing specs and this file** before making structural changes.
- Do not hardcode Google secrets or private keys in source files; load them via environment variables.
- Avoid destructive edits to sheets. The app should be **read‑only** to Google Sheets unless explicitly expanded later.
- When unsure about a mapping, inspect the relevant tab and annotate assumptions in comments or docs.
- After substantial changes, add a short note in this file or a dedicated changelog summarizing what changed at a high level.

---

### 7. Changelog

#### December 2025 - Dashboard Redesign (Open Door Capital Style)

**Changes made to match client's sample dashboard:**

1. **Removed**: `Primary KPIs (Charlotte vs Houston)` table - per client request

2. **Added new KPI section** with gauge-style components:

   - **Fund Occupancy Gauge**: Semi-circular progress indicator showing total fund occupancy %
   - **Occupancy Growth Bar**: Horizontal stacked bar comparing beginning vs current occupancy
   - **Actual Occupancy Metric**: Large KPI number with Charlotte/Houston breakdown
   - **Financial & Operational Comments**: Dynamic text with current metrics

3. **Enhanced Portfolio Overview table**:

   - Added `Asset Type` column
   - Added `Closing Date` column

4. **Updated data layer** (`src/lib/sheets.ts`):

   - New `KPIMetrics` type with comprehensive metrics
   - New `RevenueTrendData` type for chart data
   - `fetchDashboardData()` function returns full dashboard data
   - Fallback trend data generation if sheet fetch fails

5. **Data mapping** (2025ALL PROPERTIES):

   - Revenue: Rows 2-4 (Hamshire, Mt Holly, Total)
   - Occupancy %: Rows 7-8
   - Occupied Units: Rows 11-12
   - Move Ins/Outs: Rows 28-38
   - Rent Per Sq Ft: Rows 23-24

6. **Charts**: Connected to live Google Sheets data via revenue trend fetch

7. **Disposed Properties**: Added table for divested assets (Valdez example included)
