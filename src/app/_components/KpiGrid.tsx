import styles from "./KpiGrid.module.css";
import { KPIMetrics } from "../../lib/types";
import { 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";

export default function KpiGrid({ 
  metrics, 
  isEditing, 
  onUpdate 
}: { 
  metrics: KPIMetrics; 
  isEditing?: boolean;
  onUpdate?: (newMetrics: KPIMetrics) => void;
}) {
  if (!metrics) return null;

  const handleUpdate = (field: keyof KPIMetrics, value: any) => {
    if (onUpdate) {
      onUpdate({ ...metrics, [field]: value });
    }
  };

  const handleNewsChange = (index: number, value: string) => {
    const newNews = [...metrics.majorNews];
    newNews[index] = value;
    handleUpdate("majorNews", newNews);
  };

  // Helper function to format text with proper line breaks
  const formatText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;
      if (trimmedLine.startsWith('-')) {
        return (
          <div key={index} style={{ marginLeft: '16px', marginBottom: '6px' }}>
            <span style={{ color: '#4169E1', marginRight: '8px' }}>•</span>
            {trimmedLine.substring(1).trim()}
          </div>
        );
      }
      const hasEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(trimmedLine);
      return (
        <div key={index} style={{ marginBottom: hasEmoji ? '8px' : '6px', fontWeight: hasEmoji ? 600 : 400, lineHeight: '1.6' }}>
          {trimmedLine}
        </div>
      );
    }).filter(Boolean);
  };

  const ChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '4px', fontSize: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ fontWeight: 600, marginBottom: '4px' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
             <div key={index} style={{ color: entry.color, marginBottom: '2px' }}>
               {entry.name}: {entry.value}
             </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.gridContainer}>
        {/* TOP SECTION: Fund Highlights & News */}
        <div className={styles.headerSection}>
            <div className={styles.propertyColumn}>
                <div className={styles.propertyHeader} style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>
                    FUND HIGHLIGHTS 🌟
                </div>
                {isEditing ? (
                  <textarea 
                    value={metrics.fundHighlights} 
                    onChange={(e) => handleUpdate("fundHighlights", e.target.value)} 
                    className={styles.textarea}
                  />
                ) : (
                  <div className={styles.highlightText}>
                    {formatText(metrics.fundHighlights || `📢 Next month, we expect:
Charlotte: We will complete all 180 self storage units - completing 2025 business plan.✅
Houston: September, we completed our 2025 construction business plan✅. Now increasing rates and we will focus on marketing our non-climate controlled inventory.
We expect revenue to be at $45,000-$46,000 next month.`)}
                  </div>
                )}
            </div>

            <div className={styles.propertyColumn}>
                <div className={styles.propertyHeader} style={{ color: '#0f172a', borderColor: '#cbd5e1' }}>
                    Major News 🗞️
                </div>
                <ul className={styles.checklist}>
                   {metrics.majorNews.map((news, idx) => (
                      <li key={idx} className={styles.checklistItem}>
                         <span className={styles.checkEmoji}>✅</span>
                         {isEditing ? (
                           <input 
                             className={styles.newsInput}
                             value={news}
                             onChange={(e) => handleNewsChange(idx, e.target.value)}
                           />
                         ) : <span>{news.replace('✅', '').trim()}</span>}
                      </li>
                   ))}
                </ul>
            </div>
        </div>

        {/* PROPERTY GRID: Charlotte vs Houston */}
        <div className={styles.propertyGrid}>
            {/* CHARLOTTE COLUMN */}
            <div className={styles.propertyColumn}>
                <div className={`${styles.propertyHeader} ${styles.charlotteHeader}`}>
                     <span>CHARLOTTE 🏙️</span>
                </div>
                
                {/* 1. Highlights Text */}
                {isEditing ? (
                    <textarea 
                      value={metrics.charlotteHighlights} 
                      onChange={(e) => handleUpdate("charlotteHighlights", e.target.value)} 
                      className={styles.textarea}
                    />
                ) : (
                    <div className={styles.highlightText} style={{minHeight: '80px'}}>
                        {formatText(metrics.charlotteHighlights)}
                    </div>
                )}

                {/* 2. Chart (Move In / Move Out) - Blue */}
                <div className={styles.chartContainer}>
                    <div style={{fontSize:'0.7rem', color:'#64748b', marginBottom:'4px', textAlign:'center', fontWeight:600}}>MOVE IN (Bar) vs MOVE OUT (Line)</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={metrics.moveHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" hide />
                        <YAxis hide />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="charlotteIn" name="Move In" fill="#3b82f6" barSize={20} radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="charlotteOut" name="Move Out" stroke="#2563eb" strokeWidth={3} dot={{r:3}} />
                      </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. KPIs */}
                <div className={styles.kpiRow}>
                    <div className={styles.kpiBox}>
                        <div className={styles.kpiLabel}>Revenue</div>
                        <div className={styles.kpiValue} style={{color:'#3b82f6'}}>{metrics.charlotteRevenue}</div>
                    </div>
                     <div className={styles.kpiBox}>
                        <div className={styles.kpiLabel}>Occupancy</div>
                        <div className={styles.kpiValue} style={{fontSize:'1rem'}}>
                           {metrics.charlotteOccupiedUnits}<span style={{fontSize:'0.8rem', color:'#94a3b8', fontWeight:400}}>/{metrics.charlotteTotalUnits}</span>
                        </div>
                        <div style={{fontSize:'0.75rem', color:'#3b82f6', fontWeight:600}}>{metrics.charlotteOccupancyPercent}%</div>
                    </div>
                    <div className={styles.kpiBox}>
                        <div className={styles.kpiLabel}>Rent / SqFt</div>
                        <div className={styles.kpiValue} style={{fontSize:'1.1rem'}}>{metrics.charlotteRentPerSqFt}</div>
                    </div>
                    <div className={styles.kpiBox}>
                         <div className={styles.kpiLabel}>Reviews</div>
                         <div className={styles.kpiValue} style={{fontSize:'1.1rem'}}>{metrics.charlotteReviews}</div>
                         <div style={{fontSize:'0.75rem', marginBottom:'2px'}}>4.9/5 ⭐⭐⭐⭐⭐</div>
                         <a href={metrics.reviewLinks.charlotte} style={{fontSize:'0.7rem', color:'#3b82f6', textDecoration:'underline'}} target="_blank">View</a>
                    </div>
                </div>
            </div>

            {/* HOUSTON COLUMN */}
            <div className={styles.propertyColumn}>
                <div className={`${styles.propertyHeader} ${styles.houstonHeader}`}>
                     <span>HOUSTON 🤠</span>
                </div>

                {/* 1. Highlights Text */}
                {isEditing ? (
                    <textarea 
                      value={metrics.houstonHighlights} 
                      onChange={(e) => handleUpdate("houstonHighlights", e.target.value)} 
                      className={styles.textarea}
                    />
                ) : (
                    <div className={styles.highlightText} style={{minHeight: '80px'}}>
                        {formatText(metrics.houstonHighlights)}
                    </div>
                )}

                {/* 2. Chart (Move In / Move Out) - Yellow */}
                <div className={styles.chartContainer}>
                    <div style={{fontSize:'0.7rem', color:'#64748b', marginBottom:'4px', textAlign:'center', fontWeight:600}}>MOVE IN (Bar) vs MOVE OUT (Line)</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={metrics.moveHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" hide />
                        <YAxis hide />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="houstonIn" name="Move In" fill="#eab308" barSize={20} radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="houstonOut" name="Move Out" stroke="#ca8a04" strokeWidth={3} dot={{r:3}} />
                      </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. KPIs */}
                <div className={styles.kpiRow}>
                    <div className={styles.kpiBox}>
                        <div className={styles.kpiLabel}>Revenue</div>
                        <div className={styles.kpiValue} style={{color:'#eab308'}}>{metrics.houstonRevenue}</div>
                    </div>
                     <div className={styles.kpiBox}>
                        <div className={styles.kpiLabel}>Occupancy</div>
                        <div className={styles.kpiValue} style={{fontSize:'1rem'}}>
                           {metrics.houstonOccupiedUnits}<span style={{fontSize:'0.8rem', color:'#94a3b8', fontWeight:400}}>/{metrics.houstonTotalUnits}</span>
                        </div>
                        <div style={{fontSize:'0.75rem', color:'#eab308', fontWeight:600}}>{metrics.houstonOccupancyPercent}%</div>
                    </div>
                    <div className={styles.kpiBox}>
                        <div className={styles.kpiLabel}>Rent / SqFt</div>
                        <div className={styles.kpiValue} style={{fontSize:'1.1rem'}}>{metrics.houstonRentPerSqFt}</div>
                    </div>
                    <div className={styles.kpiBox}>
                         <div className={styles.kpiLabel}>Reviews</div>
                         <div className={styles.kpiValue} style={{fontSize:'1.1rem'}}>{metrics.houstonReviews}</div>
                         <div style={{fontSize:'0.75rem', marginBottom:'2px'}}>4.6/5 ⭐⭐⭐⭐⭐</div>
                         <a href={metrics.reviewLinks.houston} style={{fontSize:'0.7rem', color:'#eab308', textDecoration:'underline'}} target="_blank">View</a>
                    </div>
                </div>
            </div>
        </div>

      {/* BOTTOM: Next Month Forecast */}
      <div className={styles.forecastBox}>
          <h3>🚀 Next Month Forecast: Charlotte $24,000 | Houston $16,000</h3>
          {isEditing ? (
            <textarea 
              value={metrics.nextMonthForecast} 
              onChange={(e) => handleUpdate("nextMonthForecast", e.target.value)} 
              className={styles.textareaDark}
            />
          ) : (
            <div className={styles.highlightText} style={{color: '#e2e8f0', fontSize: '1rem'}}>
                {formatText(metrics.nextMonthForecast)}
            </div>
          )}
      </div>
    </div>
  );
}
