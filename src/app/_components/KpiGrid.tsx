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

  // Helper function to format text with proper line breaks and structure
  const formatText = (text: string) => {
    if (!text) return null;
    
    return text.split('\n').map((line, index) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;
      
      // Check if line starts with a dash (bullet point)
      if (trimmedLine.startsWith('-')) {
        return (
          <div key={index} style={{ marginLeft: '16px', marginBottom: '6px' }}>
            <span style={{ color: '#c9a962', marginRight: '8px' }}>•</span>
            {trimmedLine.substring(1).trim()}
          </div>
        );
      }
      
      // Check if line contains emojis or special markers
      const hasEmoji = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/u.test(trimmedLine);
      
      return (
        <div 
          key={index} 
          style={{ 
            marginBottom: hasEmoji ? '8px' : '6px',
            fontWeight: hasEmoji ? 600 : 400,
            lineHeight: '1.6'
          }}
        >
          {trimmedLine}
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <div className={styles.gridContainer}>
        {/* Card 1: Rent Per Square Foot - Refactored as prominent boxes */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>Rent Per Square Foot 📈</div>
          <div className={styles.reviewBoxes}>
            <div className={styles.reviewBox}>
              <div className={styles.reviewMarket}>Charlotte</div>
              <div className={styles.reviewValue}>{metrics.charlotteRentPerSqFt}</div>
              <div className={styles.reviewRating}>Target: $1.00+</div>
            </div>
            <div className={styles.reviewBox}>
              <div className={styles.reviewMarket}>Houston</div>
              <div className={styles.reviewValue}>{metrics.houstonRentPerSqFt}</div>
              <div className={styles.reviewRating}>Target: $0.80+</div>
            </div>
          </div>
        </div>

        {/* Card 2: 5 Star Reviews - Refactored as prominent boxes */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>Google Reviews ⭐</div>
          <div className={styles.reviewBoxes}>
            <div className={styles.reviewBox}>
              <div className={styles.reviewMarket}>Charlotte</div>
              <div className={styles.reviewValue}>{metrics.charlotteReviews}</div>
              <div className={styles.reviewRating}>4.9/5 ⭐⭐⭐⭐⭐</div>
              <a href={metrics.reviewLinks.charlotte} className={styles.reviewBtn} target="_blank">View on Google</a>
            </div>
            <div className={styles.reviewBox}>
              <div className={styles.reviewMarket}>Houston</div>
              <div className={styles.reviewValue}>{metrics.houstonReviews}</div>
              <div className={styles.reviewRating}>4.6/5 ⭐⭐⭐⭐✬</div>
              <a href={metrics.reviewLinks.houston} className={styles.reviewBtn} target="_blank">View on Google</a>
            </div>
          </div>
          <div style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '12px', textAlign: 'center'}}>Help us grow! Leave a 5-star review.</div>
        </div>

        {/* Card 3: Units / Total Growth */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>Units / Total 🏢</div>
          <div style={{ height: '100px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metrics.moveHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" hide />
                <YAxis domain={[0, 'auto']} hide />
                <Tooltip 
                  contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  itemStyle={{ padding: '0px' }}
                />
                <Bar dataKey="charlotteOccupied" name="Charlotte" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="houstonOccupied" name="Houston" fill="#c9a962" radius={[2, 2, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div style={{fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginTop: '8px', fontWeight: 600}}>
             CLT: {metrics.charlotteOccupiedUnits}/{metrics.charlotteTotalUnits} | HOU: {metrics.houstonOccupiedUnits}/{metrics.houstonTotalUnits}
          </div>
        </div>

        {/* Card 4: MoveIn / Move Outs Activity */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>MoveIn / Move Outs 🔄</div>
          <div style={{ height: '100px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metrics.moveHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="charlotteIn" name="CLT In" fill="#3b82f6" barSize={8} />
                <Line type="monotone" dataKey="charlotteOut" name="CLT Out" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Bar dataKey="houstonIn" name="HOU In" fill="#c9a962" barSize={8} />
                <Line type="monotone" dataKey="houstonOut" name="HOU Out" stroke="#c9a962" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div style={{fontSize: '0.72rem', color: '#64748b', textAlign: 'center', marginTop: '6px'}}>
             CLT: 12/9 | HOU: 7/4
          </div>
        </div>

        {/* Card 5: This Quarter's Major News */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>This Quarter's Major News 🗞️</div>
          <ul className={styles.checklist}>
            <li className={styles.checklistItem}>
              <span className={styles.checkEmoji}>✅</span>
              <span>Completed construction on second floor units</span>
            </li>
            <li className={styles.checklistItem}>
              <span className={styles.checkEmoji}>✅</span>
              <span>Construction plan finished for 2025</span>
            </li>
            <li className={styles.checklistItem}>
              <span className={styles.checkEmoji}>✅</span>
              <span>Revenue trending upwards with rate increases</span>
            </li>
          </ul>
        </div>

        {/* Card 5: FUND Highlights (Spans 3) */}
        <div className={`${styles.card} ${styles.span3}`}>
            <div className={styles.cardHeader}>FUND Highlights</div>
            {isEditing ? (
              <textarea 
                value={metrics.fundHighlights} 
                onChange={(e) => handleUpdate("fundHighlights", e.target.value)} 
                className={styles.textarea}
              />
            ) : (
              <div className={styles.highlightText} style={{fontSize: '0.9rem'}}>
                  {formatText("1 YEAR, 11 MONTHS!\n\n29 NEW CUSTOMERS IN CHARLOTTE AND HOUSTON!\n\n$44,897 in total revenue vs business plan at $54,222 was generated this month across both facilities:\n\n•Charlotte contributed $28,212\n•Houston contributed $16,685")}
              </div>
            )}
        </div>

        {/* Card 6: Property Highlights (Spans 3) */}
        <div className={`${styles.card} ${styles.span3}`}>
           <div className={styles.cardHeader}>Property Highlights</div>
           <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
              <div>
                  <div style={{fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '8px'}}>CHARLOTTE 🏙️</div>
                  {isEditing ? (
                    <textarea 
                      value={metrics.charlotteHighlights} 
                      onChange={(e) => handleUpdate("charlotteHighlights", e.target.value)} 
                      className={styles.textarea}
                    />
                  ) : (
                    <div style={{fontSize: '0.85rem', color: '#475569'}}>
                      {formatText("In Charlotte, we started construction on the 2nd floor, completing 49/180 2nd floor self storage units. We reached 227 occupied units vs 164 units 12 months ago. This month, we have 20 move ins and 14 move outs.")}
                    </div>
                  )}
              </div>
              <div>
                  <div style={{fontWeight: 700, fontSize: '0.85rem', color: '#1e293b', marginBottom: '8px'}}>HOUSTON 🤠</div>
                  {isEditing ? (
                    <textarea 
                      value={metrics.houstonHighlights} 
                      onChange={(e) => handleUpdate("houstonHighlights", e.target.value)} 
                      className={styles.textarea}
                    />
                  ) : (
                    <div style={{fontSize: '0.85rem', color: '#475569'}}>{formatText(metrics.houstonHighlights)}</div>
                  )}
              </div>
           </div>
        </div>

      {/* Card 7: Next Month Forecast (Full Width) */}
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
                {formatText("📢 Next month, we expect:\n\nCharlotte: We will complete all 180 self storage units - completing 2025 business plan.✅\n\nHouston: September, we completed our 2025 construction business plan✅. Now increasing rates and we will focus on marketing our non-climate controlled inventory.\n\nWe expect revenue to be at $45,000-$46,000 next month.")}
            </div>
          )}
      </div>
    </div>
  );
}
