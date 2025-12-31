"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import KpiGrid from "./_components/KpiGrid";
import PortfolioTable from "./_components/PortfolioTable";
import TrendTables from "./_components/TrendTables";
import RadarMetricChart from "./_components/RadarMetricChart";
import { KPIMetrics, RevenueTrendData, PortfolioProperty } from "../lib/types";
import {
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import chartStyles from "./_components/Charts.module.css";

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
          background: "rgba(15, 23, 42, 0.95)", // Dark tooltip for dark chart
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "8px",
          padding: "10px 14px",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
          color: "#f8fafc",
        }}
      >
        <p
          style={{
            fontWeight: 600,
            marginBottom: "6px",
            fontSize: "13px",
            color: "#e2e8f0",
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
              marginTop: "4px",
              color: "#cbd5e1",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "2px",
                background: entry.color,
              }}
            />
            <span>{entry.name}:</span>
            <span style={{ fontWeight: 600, color: "#fff" }}>
              ${entry.value ? entry.value.toLocaleString() : "0"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
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

  const [portfolioData, setPortfolioData] = useState<PortfolioProperty[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    try {
      setIsSaving(true);
      const res = await fetch("/api/portfolio/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portfolio: portfolioData,
          kpiMetrics: kpiMetrics,
          revenueTrend: revenueTrend,
        }),
      });

      if (!res.ok) throw new Error("Failed to update sheet");

      setIsEditing(false);
      alert("Settings saved to Google Sheets!");
    } catch (err) {
      alert("Failed to save changes: " + (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

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
        setPortfolioData(json.portfolioProperties ?? []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    load();
    setHasMounted(true);
  }, [month, year]);

  // Transform data for charts
  const chartData = revenueTrend.map((d) => ({
    month: d.month.includes("'") ? d.month : d.month, // Keep short format for labels

    // Chart 1: Total
    charlotteRev: d.charlotteRevenue,
    houstonRev: d.houstonRevenue,
    totalForecast: d.totalForecast,

    // Chart 2: Charlotte
    charlotteForecast: d.charlotteForecast,

    // Chart 3: Houston
    houstonForecast: d.houstonForecast,
  }));

  const formatCurrencyAxis = (value: number) => {
    if (value === 0) return "$0";
    return `$${(value / 1000).toFixed(0)}k`; // e.g., $10k
  };

  async function handleExport(format: "png" | "jpeg" | "pdf") {
    if (!dashboardRef.current) return;
    
    // Scroll to top to ensure nothing is cut off
    window.scrollTo(0, 0);
    
    // Wait a brief moment for any scroll effects
    await new Promise(resolve => setTimeout(resolve, 100));

    // Temporary style adjustment for export clarity
    const originalClass = dashboardRef.current.className;
    if (styles.exportMode) {
      dashboardRef.current.classList.add(styles.exportMode);
    }
    
    // Allow a moment for styles to apply
    await new Promise(resolve => setTimeout(resolve, 200));


    const canvas = await html2canvas(dashboardRef.current, {
      scale: 4, // High resolution for clear text
      useCORS: true,
      backgroundColor: "#ffffff", // Force solid white background
      logging: false,
      windowWidth: dashboardRef.current.scrollWidth,
      windowHeight: dashboardRef.current.scrollHeight
    });

    // Remove export mode class
    if (styles.exportMode) {
      dashboardRef.current.classList.remove(styles.exportMode);
    }

    const imageData =
      format === "jpeg"
        ? canvas.toDataURL("image/jpeg", 0.95)
        : canvas.toDataURL("image/png");
        
    const filename = `rethink-dashboard-${year}-${month}.${
      format === "pdf" ? "pdf" : format
    }`;

    if (format === "pdf") {
      // PROPER SCALING LOGIC FOR A4 LANDSCAPE
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      
      // Calculate ratio to fit width
      const ratio = pageWidth / canvasWidth;
      
      // Scaled dimensions
      const imgWidth = canvasWidth * ratio;
      const imgHeight = canvasHeight * ratio;
      
      // If height is still too big for one page, you might need to adjust or let it spill (but usually dashboard fits on one)
      // For now we fit by width. If it's taller than pageHeight, it will crop or stretch depending on logic.
      // Better strategy: "Fit to Best"
      
      const widthRatio = pageWidth / canvasWidth;
      const heightRatio = pageHeight / canvasHeight;
      const bestRatio = Math.min(widthRatio, heightRatio); // Fit entirely within page
      
      const finalWidth = canvasWidth * bestRatio;
      const finalHeight = canvasHeight * bestRatio;
      
      // Center it
      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;

      pdf.addImage(imageData, "PNG", x, y, finalWidth, finalHeight);
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
            <button
              type="button"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className={isEditing ? styles.buttonSave : styles.buttonEdit}
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Edit Dashboard"}
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
              <div className={styles.businessPlanGrid}>
                <div className={styles.businessPlanProperty}>
                  <div className={styles.propertyName}>📍 Charlotte</div>
                  <div className={styles.propertyDetails}>
                    <span className={styles.propertyHighlight}>$2.70M</span> •
                    65,000 sq ft on 6 acres
                  </div>
                  <div className={styles.propertyFinancing}>
                    Seller financing: 5 years @ 6% interest only
                  </div>
                  <div className={styles.propertyPhases}>
                    <p>
                      Our business plan for Charlotte is structured in two key phases, beginning with the rapid installation of 120 relocatable and 220 first-floor units ($750K) to reach 90% occupancy within 1.5 years, followed by the addition of 220 second-floor units ($400K) to hit the same occupancy target by Year 4, totaling ~524 units property-wide.
                    </p>
                  </div>
                </div>
                <div className={styles.businessPlanProperty}>
                  <div className={styles.propertyName}>📍 Houston</div>
                  <div className={styles.propertyDetails}>
                    <span className={styles.propertyHighlight}>$1.50M</span> •
                    30,000 sq ft on 4 acres
                  </div>
                  <div className={styles.propertyFinancing}>
                    Bank financing: 2 years interest only • 46% occupancy at
                    acquisition
                  </div>
                  <div className={styles.propertyPhases}>
                    <p>
                      The strategic plan for Houston starts with a focused lease-up of all existing climate-controlled units to reach a 90% occupancy stabilization target, followed by a strategic expansion with non-climate controlled storage and dedicated RV/boat parking, scaling the facility to approximately 345 total units.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.headerRight}>
              <div>
                <div className={styles.headerLabel}>Targeted Hold</div>
                <div className={styles.headerBody}>~ 5 Years</div>
              </div>
              <div>
                <div className={styles.headerLabel}>
                  Targeted Rate of Return
                </div>
                <div className={styles.headerBody}>
                  15–25% IRR (Equity Shareclasses)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio overview table */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>Portfolio Overview</h2>
          </div>
          <PortfolioTable
            data={portfolioData}
            isEditing={isEditing}
            onUpdate={setPortfolioData}
          />
        </section>

        {/* Middle band – NEW KPI GRID + Comments */}
        {loading && (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            Loading dashboard data…
          </div>
        )}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && kpiMetrics && (
          <KpiGrid
            metrics={kpiMetrics}
            isEditing={isEditing}
            onUpdate={setKpiMetrics}
          />
        )}

        {/* Bottom band – CHARTS GRID */}
        {!loading && !error && hasMounted && (
          <section className={chartStyles.chartsGrid}>
            {/* 1. FUND TOTALS SECTION */}
            <div className={chartStyles.chartCard} style={{ gridColumn: '1 / -1' }}>
              <div className={chartStyles.chartHeader}>
                <h3 className={chartStyles.chartTitle}>
                  Rethink - Monthly Sales vs Forecast
                </h3>
              </div>
              <div className={chartStyles.chartBody}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 9 }} angle={-45} textAnchor="end" height={50} interval={0} />
                    <YAxis stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 9 }} tickFormatter={formatCurrencyAxis} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: "#fff", fontSize: "10px" }} />
                    <Area type="step" dataKey="totalForecast" name="Forecast" fill="#64748b" stroke="#94a3b8" fillOpacity={0.3} />
                    <Bar dataKey="houstonRev" name="Houston" stackId="a" fill="#ffc557" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="charlotteRev" name="Charlotte" stackId="a" fill="#3a8dde" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
               <TrendTables data={revenueTrend} type="fund" isEditing={isEditing} onUpdate={setRevenueTrend} />
            </div>

            {/* 2. PROPERTY SPECIFIC SECTION */}
            {/* Charlotte Chart */}
            <div className={chartStyles.chartCard}>
              <div className={chartStyles.chartHeader}>
                <h3 className={chartStyles.chartTitle}>
                  2025 Charlotte - Monthly Sales vs Forecast
                </h3>
              </div>
              <div className={chartStyles.chartBody}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 9 }} angle={-45} textAnchor="end" height={50} interval={0} />
                    <YAxis stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 9 }} tickFormatter={formatCurrencyAxis} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: "#fff", fontSize: "10px" }} />
                    <Area type="step" dataKey="charlotteForecast" name="Forecast" fill="#64748b" stroke="#94a3b8" fillOpacity={0.3} />
                    <Bar dataKey="charlotteRev" name="Actuals" fill="#3a8dde" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Houston Chart */}
            <div className={chartStyles.chartCard}>
              <div className={chartStyles.chartHeader}>
                <h3 className={chartStyles.chartTitle}>
                  2025 Houston - Monthly Sales vs Forecast
                </h3>
              </div>
              <div className={chartStyles.chartBody}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 9 }} angle={-45} textAnchor="end" height={50} interval={0} />
                    <YAxis stroke="#94a3b8" tick={{ fill: "#cbd5e1", fontSize: 9 }} tickFormatter={formatCurrencyAxis} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: "#fff", fontSize: "10px" }} />
                    <Area type="step" dataKey="houstonForecast" name="Forecast" fill="#64748b" stroke="#94a3b8" fillOpacity={0.3} />
                    <Bar dataKey="houstonRev" name="Actuals" fill="#ffc557" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Charlotte Table */}
            <div>
               <TrendTables data={revenueTrend} type="charlotte" isEditing={isEditing} onUpdate={setRevenueTrend} />
            </div>

            {/* Houston Table */}
            <div>
               <TrendTables data={revenueTrend} type="houston" isEditing={isEditing} onUpdate={setRevenueTrend} />
            </div>
          </section>
        )}



        {/* Growth Radar Chart */}
        {!loading && !error && kpiMetrics && (
           <section className={styles.card} style={{ minHeight: '520px', marginTop: '20px' }}>
              <RadarMetricChart metrics={kpiMetrics} />
           </section>
        )}
      </div>
    </main>
  );
}
