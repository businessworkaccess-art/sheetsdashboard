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
             CLT: {metrics.charlotteMoveIns}/{metrics.charlotteMoveOuts} | HOU: {metrics.houstonMoveIns}/{metrics.houstonMoveOuts}
          </div>
        </div>

        {/* Card 5: Celebration Board */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>Celebration Board 🎉</div>
          <div className={styles.emojiGrid}>
            <span>💰</span>
            <span>👏🏻👏🏻</span>
            <span>🙌 🙌</span>
            <span>⭐⭐⭐⭐⭐</span>
            <span>🔥🔥🔥</span>
            <span>🏗 🏗 🏗</span>
            <span>💸💸💸</span>
            <span>🤦🏻‍♂️🤦🏻‍♂️</span>
          </div>
          <div style={{fontSize: '0.7rem', color: '#94a3b8', marginTop: 'auto', textAlign: 'center'}}>Property Milestones</div>
        </div>

        {/* Card 5: This Quarter's Major News */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>This Quarter's Major News 🗞️</div>
          <ul className={styles.checklist}>
            {metrics.majorNews.map((news, i) => (
              <li key={i} className={styles.checklistItem}>
                <span className={styles.checkEmoji}>✅</span>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={news} 
                    onChange={(e) => handleNewsChange(i, e.target.value)} 
                    className={styles.newsInput}
                  />
                ) : (
                  <span>{news}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Card 5: FUND Highlights (Spans 2) */}
        <div className={`${styles.card} ${styles.span2}`}>
            <div className={styles.cardHeader}>FUND Highlights</div>
            {isEditing ? (
              <textarea 
                value={metrics.fundHighlights} 
                onChange={(e) => handleUpdate("fundHighlights", e.target.value)} 
                className={styles.textarea}
              />
            ) : (
              <div className={styles.highlightText} style={{fontSize: '0.9rem'}}>
                  {metrics.fundHighlights}
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
                    <div style={{fontSize: '0.85rem', color: '#475569'}}>{metrics.charlotteHighlights}</div>
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
                    <div style={{fontSize: '0.85rem', color: '#475569'}}>{metrics.houstonHighlights}</div>
                  )}
              </div>
           </div>
        </div>

      {/* Card 7: Next Month Forecast (Full Width) */}
      <div className={styles.forecastBox}>
          <h3>🚀 Next Month Forecast</h3>
          {isEditing ? (
            <textarea 
              value={metrics.nextMonthForecast} 
              onChange={(e) => handleUpdate("nextMonthForecast", e.target.value)} 
              className={styles.textareaDark}
            />
          ) : (
            <div className={styles.highlightText} style={{color: '#e2e8f0', fontSize: '1rem'}}>
                {metrics.nextMonthForecast}
            </div>
          )}
      </div>
    </div>
  );
}
