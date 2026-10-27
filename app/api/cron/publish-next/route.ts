import { NextRequest, NextResponse } from "next/server";
import { extractCronSecret, cronSecretMatches } from "@/lib/cron-auth";
import {
  signInAutomationAdmin,
  publishViaAdminApi,
} from "@/lib/admin-automation";
import {
  createSupabaseQueueDeps,
  runPublishQueue,
} from "@/lib/publish-queue";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/publish-next — daily auto-publisher (Vercel Cron, 05:20 UTC).
 *
 * Publishes AT MOST ONE due item from blog_publish_queue, and only by
 * invoking the admin publish API (POST /api/admin/blog) with a genuine
 * automation-admin session — the same action the /admin panel uses,
 * including its auto-deploy trigger. There is no direct blog_posts
 * write anywhere in this path.
 *
 * Auth: CRON_SECRET (Vercel sends `Authorization: Bearer <secret>`).
 * Fail-closed: until CRON_SECRET and the automation-admin credentials
 * are provisioned, this route answers 503 and publishes nothing.
 *
 * GET /api/cron/publish-next?mode=status — queue snapshot, no publish.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      {
        ok: false,
        error: "not_configured",
        detail: "CRON_SECRET is not set; the auto-publisher is not armed.",
      },
      { status: 503 }
    );
  }
  if (!cronSecretMatches(extractCronSecret(req), secret)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const signin = await signInAutomationAdmin();
  if (!signin.ok) {
    return NextResponse.json(
      { ok: false, error: "not_configured", detail: signin.error },
      { status: 503 }
    );
  }
  const { admin } = signin;

  const deps = createSupabaseQueueDeps(admin.client, (item) =>
    publishViaAdminApi(req.nextUrl.origin, admin.cookieHeader(), item)
  );

  if (req.nextUrl.searchParams.get("mode") === "status") {
    return NextResponse.json({
      ok: true,
      mode: "status",
      queue: await deps.queueSnapshot(),
    });
  }

  const result = await runPublishQueue(deps);
  return NextResponse.json({ ok: true, ...result });
}
