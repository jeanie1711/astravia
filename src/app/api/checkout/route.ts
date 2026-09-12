import { NextResponse } from "next/server";
import { createCheckoutSession } from "../../../payments/dodo";

export async function POST(request: Request): Promise<NextResponse> {
  let body: { returnPath?: string };
  try {
    body = (await request.json()) as { returnPath?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const returnPath = body.returnPath ?? "/results";
  const origin = request.headers.get("origin") ?? new URL(request.url).origin;

  try {
    const { url, sessionId } = await createCheckoutSession(origin, returnPath);
    return NextResponse.json({ url, sessionId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Checkout failed" }, { status: 500 });
  }
}
