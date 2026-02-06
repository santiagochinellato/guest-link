import { NextResponse } from "next/server";
import { runCheckoutReminderAutomation } from "@/lib/actions/automations";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runCheckoutReminderAutomation();
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[cron] send-checkout-reminder failed:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
