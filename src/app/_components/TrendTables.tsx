
import styles from "./TrendTables.module.css";
import { RevenueTrendData } from "../../lib/types";

interface TrendTablesProps {
  data: RevenueTrendData[];
  isEditing?: boolean;
  onUpdate?: (newData: RevenueTrendData[]) => void;
  type?: "fund" | "charlotte" | "houston" | "all";
}

export default function TrendTables({ data, isEditing, onUpdate, type = "all" }: TrendTablesProps) {
  if (!data || data.length === 0) return null;

  // Show last 8 months to utilize space
  const filteredData = data.slice(-8);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleInputChange = (month: string, key: keyof RevenueTrendData, value: string) => {
    if (!onUpdate) return;
    const newData = data.map(d => {
      if (d.month === month) {
        return { ...d, [key]: parseFloat(value) || 0 };
      }
      return d;
    });
    onUpdate(newData);
  };

  const renderTableContent = (title: string, metrics: { label: string; key: keyof RevenueTrendData; color?: string }[]) => (
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
                  <td key={d.month}>
                    {isEditing ? (
                        <input
                            type="number"
                            className={styles.editInput}
                            value={d[m.key] as number}
                            onChange={(e) => handleInputChange(d.month, m.key, e.target.value)}
                        />
                    ) : (
                        formatCurrency(d[m.key] as number)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const fundTable = () => renderTableContent("Fund Totals", [
    { label: "Charlotte", key: "charlotteRevenue", color: "#3a8dde" },
    { label: "Houston", key: "houstonRevenue", color: "#ffc557" },
    { label: "Total", key: "totalRevenue" },
    { label: "Total Forecast", key: "totalForecast", color: "#64748b" },
  ]);

  const charlotteTable = () => renderTableContent("Charlotte Monthly", [
    { label: "Actual", key: "charlotteRevenue", color: "#3a8dde" },
    { label: "Forecast", key: "charlotteForecast", color: "#64748b" },
  ]);

  const houstonTable = () => renderTableContent("Houston Monthly", [
    { label: "Actual", key: "houstonRevenue", color: "#ffc557" },
    { label: "Forecast", key: "houstonForecast", color: "#64748b" },
  ]);

  return (
    <section className={styles.container}>
      {(type === "all" || type === "fund") && fundTable()}
      {(type === "all" || type === "charlotte") && charlotteTable()}
      {(type === "all" || type === "houston") && houstonTable()}
    </section>
  );
}
