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
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";

type DashboardSummaryRow = {
  label: string;
  charlotte: string;
  houston: string;
};

// Custom tooltip component for charts
const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
        borderRadius: '10px',
        padding: '12px 16px',
        boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
      }}>
        <p style={{ 
          fontWeight: 600, 
          color: '#0f172a', 
          marginBottom: '8px',
          fontSize: '13px'
        }}>{label}</p>
        {payload.map((entry, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: '#475569',
            marginTop: '4px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: entry.color
            }} />
            <span>{entry.name}:</span>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>
              ${entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Home() {
  const [summary, setSummary] = useState<DashboardSummaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<string>("2025");
  const [month, setMonth] = useState<string>("Jun");
  const dashboardRef = useRef<HTMLDivElement | null>(null);

  // Temporary demo data for charts
  const revenueData = [
    { month: "Jul", noi: 25000, projected: 26000 },
    { month: "Aug", noi: 24500, projected: 25500 },
    { month: "Sep", noi: 25200, projected: 26200 },
    { month: "Oct", noi: 25800, projected: 26800 },
    { month: "Nov", noi: 26500, projected: 27200 },
    { month: "Dec", noi: 27200, projected: 27800 },
  ];

  const fundNoiData = [{ name: "Fund", projected: 345000, actual: 335000 }];

  const propertyNoiData = [
    { name: "Hamshire", projected: 160000, actual: 150000 },
    { name: "Mt Holly", projected: 183000, actual: 175000 },
  ];

  useEffect(() => {
    async function load() {
      try {
        const params = new URLSearchParams({ month, year });
        const res = await fetch(`/api/dashboard?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const json = await res.json();
        setSummary(json.summary ?? []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [month, year]);

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

    const filename = `rethink-dashboard-${year}-${month}.${format === "pdf" ? "pdf" : format}`;

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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );

  const PDFIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
        {/* Top band – logo + fund meta */}
        <section className={styles.reportHeader}>
          <div className={styles.logoBlock}>
            <div className={styles.logoCircle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 21h18" />
                <path d="M5 21V7l8-4v18" />
                <path d="M19 21V11l-6-4" />
              </svg>
            </div>
            <div>
              <div className={styles.fundTitle}>Gamma Income</div>
              <div className={styles.fundSubtitle}>Rethink Self Storage Fund</div>
              <div className={styles.fundPeriod}>
                As of {month} {year}
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
              <div className={styles.headerBody}>15–25% IRR (Equity Shareclasses)</div>
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
                <th>Market</th>
                <th>Units</th>
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
                <td>Houston, TX</td>
                <td>222</td>
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
                <td>Charlotte, NC</td>
                <td>501</td>
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

        {/* Middle band – KPIs + comments */}
        <section className={styles.middleGrid}>
          <div className={styles.card}>
            <h2>Primary KPIs (Charlotte vs Houston)</h2>
            {loading && (
              <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
                Loading dashboard data…
              </div>
            )}
            {error && <p className={styles.error}>{error}</p>}
            {!loading && !error && (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>KPI</th>
                    <th>Charlotte</th>
                    <th>Houston</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((row) => (
                    <tr key={row.label}>
                      <td>{row.label}</td>
                      <td>{row.charlotte}</td>
                      <td>{row.houston}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className={styles.card}>
            <h2>Financial &amp; Operational Comments</h2>
            <p className={styles.bodyText}>
              This quarter continued to build on prior rent increases and
              occupancy gains across both Charlotte and Houston. Marketing spend
              remains disciplined while lead volume and move‑ins track ahead of
              plan. We are focused on sustaining high-quality occupancy and
              selective rate increases as we move into the next quarter.
            </p>
          </div>
        </section>

        {/* Bottom band – charts */}
        <section className={styles.bottomGrid}>
          <div className={styles.card}>
            <h2>Recurring Revenue &amp; NOI Trend</h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="noiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0f766e" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="projectedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
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
                    wrapperStyle={{ paddingTop: '16px' }}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: "#475569", fontSize: '12px', fontWeight: 500 }}>{value}</span>
                    )}
                  />
                  <Area
                    type="monotone"
                    dataKey="noi"
                    stroke="#0f766e"
                    strokeWidth={2.5}
                    fill="url(#noiGradient)"
                    name="NOI"
                    dot={{ fill: '#0f766e', strokeWidth: 0, r: 4 }}
                    activeDot={{ fill: '#0f766e', strokeWidth: 2, stroke: '#fff', r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="projected"
                    stroke="#f97316"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fill="url(#projectedGradient)"
                    name="Projected NOI"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className={styles.card}>
            <h2>Fund NOI Performance</h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={fundNoiData} barGap={8}>
                  <defs>
                    <linearGradient id="barProjected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#e2e8f0" />
                      <stop offset="100%" stopColor="#cbd5e1" />
                    </linearGradient>
                    <linearGradient id="barActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="100%" stopColor="#0f766e" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
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
                    wrapperStyle={{ paddingTop: '16px' }}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: "#475569", fontSize: '12px', fontWeight: 500 }}>{value}</span>
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
            <h2>Property NOI Comparison</h2>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={propertyNoiData} layout="vertical" barGap={4}>
                  <defs>
                    <linearGradient id="barProjectedH" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#cbd5e1" />
                      <stop offset="100%" stopColor="#e2e8f0" />
                    </linearGradient>
                    <linearGradient id="barActualH" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0f766e" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: "#475569", fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '16px' }}
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: "#475569", fontSize: '12px', fontWeight: 500 }}>{value}</span>
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
      </div>
    </main>
  );
}
