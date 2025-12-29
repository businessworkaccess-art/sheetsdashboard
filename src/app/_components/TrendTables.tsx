
import styles from "./TrendTables.module.css";
import { RevenueTrendData } from "../../lib/types";

interface TrendTablesProps {
  data: RevenueTrendData[];
}

export default function TrendTables({ data }: TrendTablesProps) {
  if (!data || data.length === 0) return null;

  // Only show last 6 months
  const filteredData = data.slice(-6);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const renderTable = (title: string, metrics: { label: string; key: keyof RevenueTrendData; color?: string }[]) => (
    <div className={styles.tableWrapper}>
      <h3 className={styles.tableTitle}>{title}</h3>
      <div className={styles.scrollContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.stickyCol}>Metric</th>
              {filteredData.map((d) => (
                <th key={d.month}>{d.month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => (
              <tr key={m.label}>
                <td className={styles.stickyCol}>
                    <div className={styles.metricLabel}>
                        {m.color && <span className={styles.colorDot} style={{ background: m.color }} />}
                        {m.label}
                    </div>
                </td>
                {filteredData.map((d) => (
                  <td key={d.month}>{formatCurrency(d[m.key] as number)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <section className={styles.container}>
      {renderTable("Fund Totals", [
        { label: "Charlotte Revenue", key: "charlotteRevenue", color: "#3b82f6" },
        { label: "Houston Revenue", key: "houstonRevenue", color: "#4169E1" },
        { label: "Total Revenue", key: "totalRevenue" },
        { label: "Total Forecast", key: "totalForecast", color: "#64748b" },
      ])}

      {renderTable("Charlotte Monthly", [
        { label: "Actual Revenue", key: "charlotteRevenue", color: "#4169E1" },
        { label: "Forecast Revenue", key: "charlotteForecast", color: "#64748b" },
      ])}

      {renderTable("Houston Monthly", [
        { label: "Actual Revenue", key: "houstonRevenue", color: "#4169E1" },
        { label: "Forecast Revenue", key: "houstonForecast", color: "#64748b" },
      ])}
    </section>
  );
}
