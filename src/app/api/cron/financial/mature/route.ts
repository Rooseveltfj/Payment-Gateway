import { NextResponse } from "next/server";
import { processMaturity } from "@/lib/financial";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // Simples proteção por secret key
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const maturedCount = await processMaturity();
    
    return NextResponse.json({ 
      success: true, 
      maturedCount, 
      timestamp: new Date().toISOString() 
    });
  } catch (error: unknown) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal Cron Error" 
    }, { status: 500 });
  }
}
