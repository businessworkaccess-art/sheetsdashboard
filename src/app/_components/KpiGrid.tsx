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
  ResponsiveContainer
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

  const cleanUnits = (unitStr: string, total: number) => {
    if (!unitStr) return `0/${total}`;
    // Strip property names and handle redundant total display
    let clean = unitStr.replace(/Charlotte|Houston/gi, '').trim();
    if (!clean.includes('/')) {
        return `${clean}/${total}`;
    }
    // If it shows "221/305/305", clean it to "221/305"
    const parts = clean.split('/');
    if (parts.length > 2) {
        return `${parts[0].trim()}/${parts[1].trim()}`;
    }
    return clean;
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
                    {formatText(metrics.fundHighlights)}
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

                {/* 2. Performance Chart - Brand Colors */}
                <div className={styles.chartContainer}>
                    <div style={{fontSize:'0.7rem', color:'#64748b', marginBottom:'4px', textAlign:'center', fontWeight:600}}>MOVE IN (Bar) vs MOVE OUT (Line)</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={metrics.moveHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" hide />
                        <YAxis hide />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="charlotteIn" name="Move In" fill="#3a8dde" barSize={20} radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="charlotteOut" name="Move Out" stroke="#2381a0" strokeWidth={3} dot={{r:3}} />
                      </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. Metrics Row */}
                <div className={styles.kpiRow}>
                    <div className={styles.kpiBox}>
                        <div className={styles.kpiLabel}>Revenue</div>
                        {isEditing ? (
                            <input 
                                value={metrics.charlotteRevenue} 
                                onChange={(e) => handleUpdate("charlotteRevenue", e.target.value)} 
                                className={styles.newsInput}
                                style={{ textAlign: 'center', color: '#3a8dde', fontWeight: 700 }}
                            />
                        ) : (
                            <div className={styles.kpiValue} style={{color:'#3a8dde'}}>{metrics.charlotteRevenue}</div>
                        )}
                    </div>
                     <div className={styles.kpiBox}>
                        <div className={styles.kpiLabel}>Units / Total</div>
                        {isEditing ? (
                            <input 
                                value={metrics.charlotteOccupiedUnits} 
                                onChange={(e) => handleUpdate("charlotteOccupiedUnits", e.target.value)} 
                                className={styles.newsInput}
                                style={{ textAlign: 'center', fontSize: '0.8rem' }}
                            />
                        ) : (
                            <div className={styles.kpiValue} style={{fontSize:'1rem'}}>
                                {cleanUnits(metrics.charlotteOccupiedUnits, metrics.charlotteTotalUnits)}
                            </div>
                        )}
                    </div>
                    <div className={styles.kpiBox}>
                        <div className={styles.kpiLabel}>Rent / SqFt</div>
                        {isEditing ? (
                            <input 
                                value={metrics.charlotteRentPerSqFt} 
                                onChange={(e) => handleUpdate("charlotteRentPerSqFt", e.target.value)} 
                                className={styles.newsInput}
                                style={{ textAlign: 'center' }}
                            />
                        ) : (
                            <div className={styles.kpiValue} style={{fontSize:'1.1rem'}}>{metrics.charlotteRentPerSqFt}</div>
                        )}
                    </div>
                    <div className={styles.kpiBox}>
                         <div className={styles.kpiLabel}>Reviews</div>
                         {isEditing ? (
                            <input 
                                value={metrics.charlotteReviews} 
                                onChange={(e) => handleUpdate("charlotteReviews", e.target.value)} 
                                className={styles.newsInput}
                                style={{ textAlign: 'center' }}
                            />
                         ) : (
                            <div className={styles.kpiValue} style={{fontSize:'1.1rem'}}>{metrics.charlotteReviews}</div>
                         )}
                         <div style={{fontSize:'0.75rem', marginBottom:'2px'}}>4.9/5 ⭐⭐⭐⭐⭐</div>
                         <a href={metrics.reviewLinks.charlotte} style={{fontSize:'0.7rem', color:'#3a8dde', textDecoration:'underline'}} target="_blank">View</a>
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

                {/* 2. Performance Chart - Brand Colors */}
                <div className={styles.chartContainer}>
                    <div style={{fontSize:'0.7rem', color:'#64748b', marginBottom:'4px', textAlign:'center', fontWeight:600}}>MOVE IN (Bar) vs MOVE OUT (Line)</div>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={metrics.moveHistory}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="month" hide />
                        <YAxis hide />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="houstonIn" name="Move In" fill="#ffc557" barSize={20} radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="houstonOut" name="Move Out" stroke="#ca8a04" strokeWidth={3} dot={{r:3}} />
                      </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* 3. Metrics Row */}
                <div className={styles.kpiRow}>
                    <div className={styles.kpiBox}>
                        <div className={styles.kpiLabel}>Revenue</div>
                        {isEditing ? (
                            <input 
                                value={metrics.houstonRevenue} 
                                onChange={(e) => handleUpdate("houstonRevenue", e.target.value)} 
                                className={styles.newsInput}
                                style={{ textAlign: 'center', color: '#ffc557', fontWeight: 700 }}
                            />
                        ) : (
                            <div className={styles.kpiValue} style={{color:'#ffc557'}}>{metrics.houstonRevenue}</div>
                        )}
                    </div>
                     <div className={styles.kpiBox}>
                        <div className={styles.kpiLabel}>Units / Total</div>
                        {isEditing ? (
                            <input 
                                value={metrics.houstonOccupiedUnits} 
                                onChange={(e) => handleUpdate("houstonOccupiedUnits", e.target.value)} 
                                className={styles.newsInput}
                                style={{ textAlign: 'center', fontSize: '0.8rem' }}
                            />
                        ) : (
                            <div className={styles.kpiValue} style={{fontSize:'1rem'}}>
                                {cleanUnits(metrics.houstonOccupiedUnits, metrics.houstonTotalUnits)}
                            </div>
                        )}
                    </div>
                    <div className={styles.kpiBox}>
                        <div className={styles.kpiLabel}>Rent / SqFt</div>
                        {isEditing ? (
                            <input 
                                value={metrics.houstonRentPerSqFt} 
                                onChange={(e) => handleUpdate("houstonRentPerSqFt", e.target.value)} 
                                className={styles.newsInput}
                                style={{ textAlign: 'center' }}
                            />
                        ) : (
                            <div className={styles.kpiValue} style={{fontSize:'1.1rem'}}>{metrics.houstonRentPerSqFt}</div>
                        )}
                    </div>
                    <div className={styles.kpiBox}>
                         <div className={styles.kpiLabel}>Reviews</div>
                         {isEditing ? (
                            <input 
                                value={metrics.houstonReviews} 
                                onChange={(e) => handleUpdate("houstonReviews", e.target.value)} 
                                className={styles.newsInput}
                                style={{ textAlign: 'center' }}
                            />
                         ) : (
                            <div className={styles.kpiValue} style={{fontSize:'1.1rem'}}>{metrics.houstonReviews}</div>
                         )}
                         <div style={{fontSize:'0.75rem', marginBottom:'2px'}}>4.6/5 ⭐⭐⭐⭐⭐</div>
                         <a href={metrics.reviewLinks.houston} style={{fontSize:'0.7rem', color:'#ffc557', textDecoration:'underline'}} target="_blank">View</a>
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