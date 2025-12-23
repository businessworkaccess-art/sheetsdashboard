"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
  Line,
  LineChart,
} from "recharts";

type KPIMetrics = {
  charlotteRevenue: string;
  charlotteOccupiedUnits: number;
  charlotteTotalUnits: number;
  charlotteOccupancyPercent: number;
  charlotteMoveIns: number;
  charlotteMoveOuts: number;
  charlotteRentPerSqFt: string;
  houstonRevenue: string;
  houstonOccupiedUnits: number;
  houstonTotalUnits: number;
  houstonOccupancyPercent: number;
  houstonMoveIns: number;
  houstonMoveOuts: number;
  houstonRentPerSqFt: string;
  fundTotalOccupiedUnits: number;
  fundTotalUnits: number;
  fundOccupancyPercent: number;
  fundTotalRevenue: string;
  fundTotalMoveIns: number;
  fundTotalMoveOuts: number;
  charlotteBeginningUnits: number;
  houstonBeginningUnits: number;
  fundBeginningUnits: number;
  charlotteOccupancyGrowth: number;
  houstonOccupancyGrowth: number;
  fundOccupancyGrowth: number;
};

type RevenueTrendData = {
  month: string;
  charlotte: number;
  houston: number;
  total: number;
  forecast: number;
};

// Custom tooltip component for charts
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          borderRadius: "10px",
          padding: "12px 16px",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
        }}
      >
        <p
          style={{
            fontWeight: 600,
            color: "#0f172a",
            marginBottom: "8px",
            fontSize: "13px",
          }}
        >
          {label}
        </p>
        {payload.map((entry, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              color: "#475569",
              marginTop: "4px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: entry.color,
              }}
            />
            <span>{entry.name}:</span>
            <span style={{ fontWeight: 600, color: "#0f172a" }}>
              ${entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Semi-circular gauge component
const OccupancyGauge = ({
  percentage,
  label,
  sublabel,
  beginningValue,
  currentValue,
}: {
  percentage: number;
  label: string;
  sublabel: string;
  beginningValue?: number;
  currentValue?: number;
}) => {
  const radius = 70;
  const strokeWidth = 14;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={styles.gaugeContainer}>
      <div className={styles.gaugeLabel}>{label}</div>
      <div className={styles.gaugeSublabel}>{sublabel}</div>
      <div className={styles.gaugeWrapper}>
        <svg
          height={radius + 10}
          width={radius * 2 + 20}
          viewBox={`0 0 ${radius * 2 + 20} ${radius + 10}`}
        >
          {/* Background arc */}
          <path
            d={`M ${10 + strokeWidth/2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 + 10 - strokeWidth/2} ${radius}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Foreground arc */}
          <path
            d={`M ${10 + strokeWidth/2} ${radius} A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${radius * 2 + 10 - strokeWidth/2} ${radius}`}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0a1628" />
              <stop offset="100%" stopColor="#1e3a5f" />
            </linearGradient>
          </defs>
        </svg>
        <div className={styles.gaugeValue}>{percentage.toFixed(1)}%</div>
      </div>
      {beginningValue !== undefined && currentValue !== undefined && (
        <div className={styles.gaugeLegend}>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: "#0a1628" }}></span>
            Beginning: {beginningValue}
          </span>
          <span className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: "#c9a962" }}></span>
            Current: {currentValue}
          </span>
        </div>
      )}
    </div>
  );
};

// Horizontal bar chart for occupancy growth
const OccupancyGrowthBar = ({
  currentValue,
  beginningValue,
  growthPercent,
  label,
}: {
  currentValue: number;
  beginningValue: number;
  growthPercent: number;
  label: string;
}) => {
  const maxValue = Math.max(currentValue, beginningValue) * 1.1;
  const beginningWidth = (beginningValue / maxValue) * 100;
  const currentWidth = (currentValue / maxValue) * 100;

  return (
    <div className={styles.growthBarContainer}>
      <div className={styles.growthBarHeader}>
        <span className={styles.growthBarLabel}>{label}</span>
        <span className={styles.growthBarPercent} style={{ color: growthPercent >= 0 ? "#10b981" : "#ef4444" }}>
          {growthPercent >= 0 ? "+" : ""}{growthPercent.toFixed(1)}%
        </span>
      </div>
      <div className={styles.growthBarTrack}>
        <div 
          className={styles.growthBarFillBeginning} 
          style={{ width: `${beginningWidth}%` }}
        >
          <span className={styles.growthBarValue}>{beginningValue}</span>
        </div>
      </div>
      <div className={styles.growthBarTrack}>
        <div 
          className={styles.growthBarFillCurrent} 
          style={{ width: `${currentWidth}%` }}
        >
          <span className={styles.growthBarValue}>{currentValue}</span>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const [kpiMetrics, setKpiMetrics] = useState<KPIMetrics | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<string>("2025");
  const [month, setMonth] = useState<string>("Dec");
  const [hasMounted, setHasMounted] = useState(false);
  const dashboardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const params = new URLSearchParams({ month, year });
        const res = await fetch(`/api/dashboard?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const json = await res.json();
        setKpiMetrics(json.kpiMetrics ?? null);
        setRevenueTrend(json.revenueTrend ?? []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    load();
    setHasMounted(true);
  }, [month, year]);

  // Get last 12 months of revenue data for charts
  const chartRevenueData = revenueTrend.slice(-12).map((d) => ({
    month: d.month.replace("'", " 20"),
    noi: d.total,
    projected: d.forecast,
    recurring: d.total * 0.85, // Approximate recurring revenue
  }));

  // Property NOI data from KPI metrics
  const propertyNoiData = kpiMetrics
    ? [
        {
          name: "Mt Holly (Charlotte)",
          projected: 35000,
          actual: parseFloat(kpiMetrics.charlotteRevenue.replace(/[$,]/g, "")) || 0,
        },
        {
          name: "Hamshire (Houston)",
          projected: 18000,
          actual: parseFloat(kpiMetrics.houstonRevenue.replace(/[$,]/g, "")) || 0,
        },
      ]
    : [];

  // Fund NOI data
  const fundNoiData = kpiMetrics
    ? [
        {
          name: "ODC Fund",
          projected: 55000,
          actual: parseFloat(kpiMetrics.fundTotalRevenue.replace(/[$,]/g, "")) || 0,
        },
      ]
    : [];

  async function handleExport(format: "png" | "jpeg" | "pdf") {
    if (!dashboardRef.current) return;

    const canvas = await html2canvas(dashboardRef.current, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#f1f5f9",
    });

    const imageData =
      format === "jpeg"
        ? canvas.toDataURL("image/jpeg", 0.95)
        : canvas.toDataURL("image/png");

    const filename = `rethink-dashboard-${year}-${month}.${
      format === "pdf" ? "pdf" : format
    }`;

    if (format === "pdf") {
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(filename);
    } else {
      const link = document.createElement("a");
      link.href = imageData;
      link.download = filename;
      link.click();
    }
  }

  // Icon components for buttons
  const DownloadIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  const PDFIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );

  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <div className={styles.titleBlock}>
          <h1>Rethink Self Storage Fund – EOM Report</h1>
          <p>Live sync with Google Sheets</p>
        </div>

        <div className={styles.controls}>
          <label>
            Year
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className={styles.select}
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </label>

          <label>
            Month
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className={styles.select}
            >
              <option value="Jan">January</option>
              <option value="Feb">February</option>
              <option value="Mar">March</option>
              <option value="Apr">April</option>
              <option value="May">May</option>
              <option value="Jun">June</option>
              <option value="Jul">July</option>
              <option value="Aug">August</option>
              <option value="Sep">September</option>
              <option value="Oct">October</option>
              <option value="Nov">November</option>
              <option value="Dec">December</option>
            </select>
          </label>

          <div className={styles.exportGroup}>
            <button
              type="button"
              onClick={() => void handleExport("png")}
              className={styles.button}
              title="Export as PNG"
            >
              <DownloadIcon /> PNG
            </button>
            <button
              type="button"
              onClick={() => void handleExport("jpeg")}
              className={styles.button}
              title="Export as JPEG"
            >
              <DownloadIcon /> JPEG
            </button>
            <button
              type="button"
              onClick={() => void handleExport("pdf")}
              className={styles.buttonPrimary}
              title="Export as PDF"
            >
              <PDFIcon /> Export PDF
            </button>
          </div>
        </div>
      </div>

      <div ref={dashboardRef} className={styles.dashboard}>
        {/* Top band – Hero with logo + fund meta */}
        <section className={styles.heroSection}>
          <div className={styles.heroBackground}>
            <img
              src="/heroimage.jpeg"
              alt="Investment Properties"
              className={styles.heroImage}
            />
            <div className={styles.heroOverlay}></div>
          </div>
          <div className={styles.heroContent}>
            <div className={styles.logoBlock}>
              <div className={styles.logoWrapper}>
                <img
                  src="/logo.png"
                  alt="Rethink Logo"
                  className={styles.logoImage}
                />
              </div>
              <div>
                <div className={styles.fundTitle}>Gamma Income</div>
                <div className={styles.fundSubtitle}>
                  Rethink Self Storage Fund
                </div>
                <div className={styles.fundPeriod}>
                  {month} {year}
                </div>
              </div>
            </div>
            <div className={styles.headerMiddle}>
              <div className={styles.headerLabel}>Original Business Plan</div>
              <div className={styles.headerBody}>
                Increase value through a combination of increasing occupancy,
                improving management, revenue optimization and increasing rents.
              </div>
            </div>
            <div className={styles.headerRight}>
              <div>
                <div className={styles.headerLabel}>Targeted Hold</div>
                <div className={styles.headerBody}>~ 5 Years</div>
              </div>
              <div>
                <div className={styles.headerLabel}>Targeted Rate of Return</div>
                <div className={styles.headerBody}>
                  15–25% IRR (Equity Shareclasses)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio overview table */}
        <section className={styles.card}>
          <h2>Portfolio Overview</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fund</th>
                <th>Property</th>
                <th>Asset Type</th>
                <th>Units</th>
                <th>Market</th>
                <th>Closing Date</th>
                <th>Purchase Price</th>
                <th>Capital Investment</th>
                <th>Loan Amount</th>
                <th>Debt Type</th>
                <th>Interest Rate</th>
                <th>Maturity Date</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rethink Self Storage Fund</td>
                <td>Hamshire</td>
                <td>Self Storage</td>
                <td>222</td>
                <td>Houston, TX</td>
                <td>12/22/2023</td>
                <td>$1,500,000</td>
                <td>$300,000</td>
                <td>$1,435,000</td>
                <td>Principal &amp; Interest</td>
                <td>8.25%</td>
                <td>1/2030</td>
              </tr>
              <tr>
                <td>Rethink Self Storage Fund</td>
                <td>Mt Holly</td>
                <td>Self Storage</td>
                <td>501</td>
                <td>Charlotte, NC</td>
                <td>1/4/2024</td>
                <td>$2,100,000</td>
                <td>$915,000</td>
                <td>$2,532,000</td>
                <td>Interest Only</td>
                <td>6.0%</td>
                <td>1/2029</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Disposed Properties table */}
        <section className={styles.card}>
          <h2>Disposed Properties</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fund</th>
                  <th>Property</th>
                  <th>Asset Type</th>
                  <th>Units</th>
                  <th>Market</th>
                  <th>Acquisition Date</th>
                  <th>Purchase Price</th>
                  <th>Capital Investment</th>
                  <th>Disposition Date</th>
                  <th>Disposition Price</th>
                  <th>Disposition Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Rethink Self Storage Fund</td>
                  <td>Valdez</td>
                  <td>MHP</td>
                  <td>175</td>
                  <td>Valdez, AK</td>
                  <td>1/12/2021</td>
                  <td>$3,950,000</td>
                  <td>$2,165,623</td>
                  <td>11/3/2023</td>
                  <td>$4,500,000</td>
                  <td className={styles.dispositionNotes}>
                    Infrastructure and logistical challenges at Valdez made infill unfeasible, 
                    preventing execution of the original business plan. To mitigate long-term risks, 
                    the property was divested in 2023. The strong performance of the remaining Fund 
                    assets, which are exceeding original NOI projections, is expected to offset the 
                    underperformance. We still project the fund to achieve its originally projected returns.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Middle band – KPI Gauges + Comments */}
        {loading && (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            Loading dashboard data…
          </div>
        )}
        {error && <p className={styles.error}>{error}</p>}
        
        {!loading && !error && kpiMetrics && (
          <section className={styles.kpiSection}>
            {/* Fund Occupancy Gauge */}
            <div className={styles.kpiCard}>
              <OccupancyGauge
                percentage={kpiMetrics.fundOccupancyPercent}
                label="Fund Occupancy"
                sublabel="End of Quarter"
                beginningValue={kpiMetrics.fundBeginningUnits}
                currentValue={kpiMetrics.fundTotalOccupiedUnits}
              />
            </div>

            {/* Occupancy Growth */}
            <div className={styles.kpiCard}>
              <div className={styles.kpiCardHeader}>
                <h3>Occupancy Growth since Acquisition</h3>
                <span className={styles.kpiSubtext}>End of Quarter, All Unit Types</span>
              </div>
              <div className={styles.growthBarWrapper}>
                <OccupancyGrowthBar
                  currentValue={kpiMetrics.fundTotalOccupiedUnits}
                  beginningValue={kpiMetrics.fundBeginningUnits}
                  growthPercent={kpiMetrics.fundOccupancyGrowth}
                  label="Rethink Fund"
                />
              </div>
              <div className={styles.growthLegend}>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "#0a1628" }}></span>
                  Beginning Occupancy
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: "#c9a962" }}></span>
                  Current Occupancy
                </span>
              </div>
            </div>

            {/* Actual Occupancy Big Number */}
            <div className={styles.kpiCard}>
              <div className={styles.kpiCardHeader}>
                <h3>Actual Occupancy</h3>
                <span className={styles.kpiSubtext}>End of Quarter</span>
              </div>
              <div className={styles.bigNumber}>
                {kpiMetrics.fundOccupancyPercent.toFixed(1)}%
              </div>
              <div className={styles.kpiDetails}>
                <div className={styles.kpiDetailRow}>
                  <span>Charlotte (Mt Holly)</span>
                  <span className={styles.kpiDetailValue}>{kpiMetrics.charlotteOccupancyPercent.toFixed(0)}%</span>
                </div>
                <div className={styles.kpiDetailRow}>
                  <span>Houston (Hamshire)</span>
                  <span className={styles.kpiDetailValue}>{kpiMetrics.houstonOccupancyPercent.toFixed(0)}%</span>
                </div>
              </div>
            </div>

            {/* Financial & Operational Comments */}
            <div className={styles.kpiCardWide}>
              <h3>Financial &amp; Operational Comments</h3>
              <p className={styles.bodyText}>
                {month} {year} continued to build on prior rent increases and
                occupancy gains across both Charlotte and Houston. Total fund occupancy 
                stands at <strong>{kpiMetrics.fundOccupancyPercent.toFixed(1)}%</strong> with {" "}
                <strong>{kpiMetrics.fundTotalOccupiedUnits}</strong> occupied units out of {" "}
                <strong>{kpiMetrics.fundTotalUnits}</strong> total units. Net move-ins for the 
                period: <strong>{kpiMetrics.fundTotalMoveIns - kpiMetrics.fundTotalMoveOuts}</strong>.
                Marketing spend remains disciplined while lead volume and move‑ins track ahead of
                plan. We are focused on sustaining high-quality occupancy and
                selective rate increases as we move into the next quarter.
              </p>
              <p className={styles.bodyText} style={{ marginTop: "12px" }}>
                We are currently exploring value-add opportunities across both properties. 
                The fund will continue pushing value through expense reduction and revenue 
                optimization, regardless of market conditions.
              </p>
            </div>
          </section>
        )}

        {/* Bottom band – charts */}
        {!loading && !error && hasMounted && (
          <section className={styles.bottomGrid}>
            <div className={styles.card}>
              <h2>Recurring Revenue &amp; NOI</h2>
              <div className={styles.chartSubtext}>*Trailing Twelve Months</div>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartRevenueData}>
                    <defs>
                      <linearGradient
                        id="noiGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#0a1628" stopOpacity={0.3} />
                        <stop
                          offset="95%"
                          stopColor="#0a1628"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                      <linearGradient
                        id="projectedGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#c9a962" stopOpacity={0.3} />
                        <stop
                          offset="95%"
                          stopColor="#c9a962"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                      <linearGradient
                        id="recurringGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="#94a3b8"
                      tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: "16px" }}
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span
                          style={{
                            color: "#475569",
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          {value}
                        </span>
                      )}
                    />
                    <Area
                      type="monotone"
                      dataKey="noi"
                      stroke="#0a1628"
                      strokeWidth={2.5}
                      fill="url(#noiGradient)"
                      name="NOI"
                      dot={{ fill: "#0a1628", strokeWidth: 0, r: 3 }}
                      activeDot={{
                        fill: "#0a1628",
                        strokeWidth: 2,
                        stroke: "#fff",
                        r: 5,
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="projected"
                      stroke="#c9a962"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="url(#projectedGradient)"
                      name="Projected NOI"
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="recurring"
                      stroke="#10b981"
                      strokeWidth={2}
                      fill="url(#recurringGradient)"
                      name="Recurring Revenue"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={styles.card}>
              <h2>Fund NOI vs Projected NOI</h2>
              <div className={styles.chartSubtext}>*Quarterly Sum</div>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fundNoiData} barGap={8}>
                    <defs>
                      <linearGradient
                        id="barProjected"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#e2e8f0" />
                        <stop offset="100%" stopColor="#cbd5e1" />
                      </linearGradient>
                      <linearGradient id="barActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c9a962" />
                        <stop offset="100%" stopColor="#b8973f" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: "16px" }}
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span
                          style={{
                            color: "#475569",
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          {value}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="projected"
                      fill="url(#barProjected)"
                      name="Projected NOI"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={60}
                    />
                    <Bar
                      dataKey="actual"
                      fill="url(#barActual)"
                      name="Actual NOI"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className={styles.card}>
              <h2>Property NOI vs Projected NOI</h2>
              <div className={styles.chartSubtext}>*Quarterly Sum</div>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={propertyNoiData} layout="vertical" barGap={4}>
                    <defs>
                      <linearGradient
                        id="barProjectedH"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#cbd5e1" />
                        <stop offset="100%" stopColor="#e2e8f0" />
                      </linearGradient>
                      <linearGradient id="barActualH" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#b8973f" />
                        <stop offset="100%" stopColor="#c9a962" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="#94a3b8"
                      tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                      tickLine={false}
                      axisLine={{ stroke: "#e2e8f0" }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#94a3b8"
                      tick={{ fontSize: 10, fill: "#475569", fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ paddingTop: "16px" }}
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span
                          style={{
                            color: "#475569",
                            fontSize: "12px",
                            fontWeight: 500,
                          }}
                        >
                          {value}
                        </span>
                      )}
                    />
                    <Bar
                      dataKey="projected"
                      fill="url(#barProjectedH)"
                      name="Projected NOI"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={24}
                    />
                    <Bar
                      dataKey="actual"
                      fill="url(#barActualH)"
                      name="Actual NOI"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={24}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
