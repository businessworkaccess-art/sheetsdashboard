export type DashboardSummaryRow = {
  label: string;
  charlotte: string;
  houston: string;
};

export type PortfolioProperty = {
  fund: string;
  property: string;
  assetType: string;
  units: number;
  market: string;
  closingDate: string;
  purchasePrice: string;
  capitalInvestment: string;
  loanAmount: string;
  debtType: string;
  interestRate: string;
  maturityDate: string;
};

export type KPIMetrics = {
  // Charlotte (Mt Holly) metrics
  charlotteRevenue: string;
  charlotteOccupiedUnits: number;
  charlotteTotalUnits: number;
  charlotteOccupancyPercent: number;
  charlotteMoveIns: number;
  charlotteMoveOuts: number;
  charlotteRentPerSqFt: string;
  charlotteCAC: string; 
  charlotteLTV: string; 
  charlotteReviews: string; 
  
  // Houston (Hamshire) metrics
  houstonRevenue: string;
  houstonOccupiedUnits: number;
  houstonTotalUnits: number;
  houstonOccupancyPercent: number;
  houstonMoveIns: number;
  houstonMoveOuts: number;
  houstonRentPerSqFt: string;
  houstonCAC: string; 
  houstonLTV: string; 
  houstonReviews: string; 

  // Fund-level metrics
  fundTotalOccupiedUnits: number;
  fundTotalUnits: number;
  fundOccupancyPercent: number;
  fundTotalRevenue: string;
  fundTotalMoveIns: number;
  fundTotalMoveOuts: number;
  
  // Beginning occupancy 
  charlotteBeginningUnits: number;
  houstonBeginningUnits: number;
  fundBeginningUnits: number;
  
  // Occupancy growth percentage
  charlotteOccupancyGrowth: number;
  houstonOccupancyGrowth: number;
  fundOccupancyGrowth: number;

  // Narratives
  fundHighlights: string;
  charlotteHighlights: string;
  houstonHighlights: string;
  majorNews: string[];
  nextMonthForecast: string;
  reviewLinks: { charlotte: string; houston: string };
  moveHistory: { month: string; charlotteIn: number; charlotteOut: number; houstonIn: number; houstonOut: number; charlotteOccupied: number; houstonOccupied: number }[];
};

export type RevenueTrendData = {
  month: string;
  // Totals
  charlotteRevenue: number;
  houstonRevenue: number;
  totalRevenue: number;
  totalForecast: number;
  // Specific Forecasts
  charlotteForecast: number;
  houstonForecast: number;
};
