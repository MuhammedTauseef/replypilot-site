-- ReplyPilot article buffer + auto-publisher — queue tables.
-- Run in Supabase SQL Editor. Safe to re-run.
--
-- Finished, QC-passed drafts wait in blog_publish_queue. A post becomes
-- published ONLY when the cron invokes the admin publish API
-- (POST /api/admin/blog) with a real admin session — nothing in this
-- system flips blog_posts.published directly.

CREATE TABLE IF NOT EXISTS blog_publish_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  cover_image TEXT,
  scheduled_publish_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'publishing', 'published', 'failed')),
  published_post_id UUID,
  published_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS blog_publish_queue_due_idx
  ON blog_publish_queue (status, scheduled_publish_at, created_at);

ALTER TABLE blog_publish_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_publish_queue_admin_all" ON blog_publish_queue;
CREATE POLICY "blog_publish_queue_admin_all"
  ON blog_publish_queue FOR ALL TO authenticated
  USING (public.is_admin());

-- One row per publisher run (published / noop / error / ...).
CREATE TABLE IF NOT EXISTS blog_publish_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at TIMESTAMPTZ DEFAULT NOW(),
  action TEXT NOT NULL,
  queue_id UUID,
  slug TEXT,
  detail TEXT
);

CREATE INDEX IF NOT EXISTS blog_publish_log_run_idx
  ON blog_publish_log (run_at DESC);

ALTER TABLE blog_publish_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "blog_publish_log_admin_all" ON blog_publish_log;
CREATE POLICY "blog_publish_log_admin_all"
  ON blog_publish_log FOR ALL TO authenticated
  USING (public.is_admin());
