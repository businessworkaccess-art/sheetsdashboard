import { NextRequest, NextResponse } from "next/server";
import { updateDashboardData } from "@/lib/sheets";

export async function POST(req: NextRequest) {
  try {
    const { portfolio, kpiMetrics } = await req.json();
    
    if (!portfolio || !kpiMetrics) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    await updateDashboardData(portfolio, kpiMetrics);
    
    return NextResponse.json({ success: true, message: "Sheet updated successfully" });
  } catch (error) {
    console.error("Error updating portfolio data", error);
    return NextResponse.json(
      { error: "Failed to update sheet" },
      { status: 500 },
    );
  }
}
