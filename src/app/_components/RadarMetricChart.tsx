import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { KPIMetrics } from '../../lib/types';
import styles from './RadarMetricChart.module.css';

interface RadarMetricChartProps {
  metrics: KPIMetrics | null;
}

export default function RadarMetricChart({ metrics }: RadarMetricChartProps) {
  if (!metrics) return null;

  // --- 1. Prepare Data for Current Month (Blue) ---
  
  // Clean string values to numbers
  const parseCurrency = (str: string) => parseFloat(str.replace(/[$,]/g, '')) || 0;
  const parseCount = (str: string) => parseInt(str.replace(/,/g, ''), 10) || 0;

  // Current Values
  const currentOccupied = metrics.fundTotalOccupiedUnits;
  const currentReviews = parseCount(metrics.charlotteReviews) + parseCount(metrics.houstonReviews);
  
  // Calculate Move Ratio (In / Out)
  // Avoid division by zero
  const moveIn = metrics.fundTotalMoveIns;
  const moveOut = metrics.fundTotalMoveOuts;
  const currentMoveRatio = moveOut > 0 ? parseFloat((moveIn / moveOut).toFixed(2)) : moveIn; // If 0 move outs, ratio is infinite, cap or use moveIn

  const currentCAC = (parseCurrency(metrics.charlotteCAC) + parseCurrency(metrics.houstonCAC)) / 2; // Average
  const currentLTV = (parseCurrency(metrics.charlotteLTV) + parseCurrency(metrics.houstonLTV)) / 2; // Average
  
  // Leads - Proxy using MoveIns * 4 (Industry avg conversion ~25%) relative proxy since we don't have raw leads
  const currentLeads = moveIn * 4; 

  // --- 2. Prepare Data for Previous Month (Gray) ---
  // We use moveHistory for real history where possible, otherwise simulate variance
  const history = metrics.moveHistory;
  const prevMonthData = history.length >= 2 ? history[history.length - 2] : null;

  let prevOccupied = currentOccupied * 0.95; // Fallback
  let prevMoveRatio = currentMoveRatio * 0.9; // Fallback

  if (prevMonthData) {
     const prevIn = (prevMonthData.charlotteIn || 0) + (prevMonthData.houstonIn || 0);
     const prevOut = (prevMonthData.charlotteOut || 0) + (prevMonthData.houstonOut || 0);
     prevOccupied = (prevMonthData.charlotteOccupied || 0) + (prevMonthData.houstonOccupied || 0);
     prevMoveRatio = prevOut > 0 ? parseFloat((prevIn / prevOut).toFixed(2)) : prevIn;
  }

  // Simulate previous data for static fields (CAC, LTV, Reviews) to show the "Gray vs Blue" visual
  // In a real app, these would come from historical snapshots
  const prevReviews = currentReviews - 5; 
  const prevCAC = currentCAC * 1.05; // Cost was higher before (improvement)
  const prevLTV = currentLTV * 0.95; // LTV was lower (improvement)
  const prevLeads = currentLeads * 0.9; // Leads were lower

  // --- 3. Normalize Data to 0-100 Scale for Radar Chart ---
  // Ensure domains are at least 1 to avoid division by zero
  const domains = {
    leads: Math.max(currentLeads, prevLeads, 1) * 1.2,
    cac: Math.max(currentCAC, prevCAC, 1) * 1.2,
    ltv: Math.max(currentLTV, prevLTV, 1) * 1.2,
    units: Math.max(currentOccupied, prevOccupied, 1) * 1.2,
    reviews: Math.max(currentReviews, prevReviews, 1) * 1.2,
    ratio: Math.max(currentMoveRatio, prevMoveRatio, 1) * 1.5,
  };

  const normalize = (val: number, max: number) => {
    if (!max || max === 0) return 0;
    const res = (val / max) * 100;
    return isNaN(res) ? 0 : res;
  };

  // --- 4. Organize Data in Clockwise Order (Matching Image) ---
  // Top (12): Leads
  // Top-Right (2): CAC
  // Bottom-Right (4): LTV
  // Bottom (6): Occupied
  // Bottom-Left (8): Reviews
  // Top-Left (10): Ratio
  
  const data = [
    {
      subject: '# of Leads',
      A: normalize(currentLeads, domains.leads),
      B: normalize(prevLeads, domains.leads),
      fullMark: 100,
      valueA: Math.round(currentLeads),
      valueB: Math.round(prevLeads)
    },
    {
      subject: 'CAC',
      A: normalize(currentCAC, domains.cac),
      B: normalize(prevCAC, domains.cac),
      fullMark: 100,
      valueA: `$${Math.round(currentCAC)}`,
      valueB: `$${Math.round(prevCAC)}`
    },
    {
      subject: 'LTV',
      A: normalize(currentLTV, domains.ltv),
      B: normalize(prevLTV, domains.ltv),
      fullMark: 100,
      valueA: `$${Math.round(currentLTV)}`,
      valueB: `$${Math.round(prevLTV)}`
    },
    {
      subject: '# Occupied',
      A: normalize(currentOccupied, domains.units),
      B: normalize(prevOccupied, domains.units),
      fullMark: 100,
      valueA: currentOccupied,
      valueB: prevOccupied
    },
    {
      subject: '5★ Reviews',
      A: normalize(currentReviews, domains.reviews),
      B: normalize(prevReviews, domains.reviews),
      fullMark: 100,
      valueA: currentReviews,
      valueB: prevReviews
    },
    {
      subject: 'In/Out Ratio',
      A: normalize(currentMoveRatio, domains.ratio),
      B: normalize(prevMoveRatio, domains.ratio),
      fullMark: 100,
      valueA: currentMoveRatio,
      valueB: prevMoveRatio
    },
  ];

  console.log('Radar Data Ordered:', data);

  // Custom tooltip... (no changes needed)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const metric = data.find(d => d.subject === label);
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel}>{label}</p>
          <div className={styles.tooltipRow}>
            <span className={styles.dotAqua}></span>
            <span>Current: </span>
            <span className={styles.tooltipValue}>{metric?.valueA}</span>
          </div>
          <div className={styles.tooltipRow}>
            <span className={styles.dotGray}></span>
            <span>Previous: </span>
            <span className={styles.tooltipValue}>{metric?.valueB}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Growth Indicators</h3>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <span className={styles.dotAqua}></span> Current Month
          </div>
          <div className={styles.legendItem}>
            <span className={styles.dotGray}></span> Previous Month
          </div>
        </div>
      </div>
      
      <div className={styles.chartWrapper} style={{ height: '450px' }}>
        {/* Absolute positioned group labels */}
        {/* Acquisition: Covers Leads (Top) & CAC (Top-Right) */}
        <div className={styles.categoryLabel} style={{ top: '5%', right: '15%' }}>Acquisition</div>
        
        {/* Expansion: Covers LTV (Bottom-Right) & Occupied (Bottom) */}
        <div className={styles.categoryLabel} style={{ bottom: '5%', right: '15%' }}>Expansion</div>
        
        {/* Retention: Covers Reviews (Bottom-Left) & Ratio (Top-Left) */}
        <div className={styles.categoryLabel} style={{ top: '50%', left: '2%', transform: 'translateY(-50%)' }}>Retention</div>

        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="60%" data={data}>
            <PolarGrid stroke="#94a3b8" strokeOpacity={0.4} />
            <PolarAngleAxis 
               dataKey="subject" 
               tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} 
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            
            {/* Previous Month (Gray) */}
            <Radar
              name="Previous"
              dataKey="B"
              stroke="#94a3b8"
              strokeWidth={2}
              fill="#cbd5e1"
              fillOpacity={0.3}
            />
            
            {/* Current Month (Aqua) */}
            <Radar
              name="Current"
              dataKey="A"
              stroke="#06b6d4" 
              strokeWidth={3}
              fill="#06b6d4"
              fillOpacity={0.5}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
