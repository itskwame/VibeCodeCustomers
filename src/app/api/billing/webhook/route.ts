import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const payload = await req.json().catch(() => null);
  console.log("Received billing webhook:", payload);
  return NextResponse.json({ received: true });
}
