import { NextResponse } from "next/server";
import { getPriceConfig } from "@/lib/price-config";

export async function GET() {
  return NextResponse.json(await getPriceConfig());
}
