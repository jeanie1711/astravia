import { NextResponse } from "next/server";
import { verifyCheckoutSession } from "../../../payments/dodo";

export async function GET(request: Request): Promise<NextResponse> {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) {
    return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
  }

  try {
    const { paid } = await verifyCheckoutSession(sessionId);
    return NextResponse.json({ paid });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Verification failed" }, { status: 500 });
  }
}
