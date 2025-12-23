import { NextRequest, NextResponse } from "next/server";
import { fetchDashboardData } from "@/lib/sheets";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") ?? "Jun";
    const year = searchParams.get("year") ?? "2025";

    const { summary, kpiMetrics, revenueTrend } = await fetchDashboardData(month, year);
    return NextResponse.json({ summary, kpiMetrics, revenueTrend });
  } catch (error) {
    console.error("Error fetching dashboard data", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 },
    );
  }
}


