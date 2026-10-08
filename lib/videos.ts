import { createPublicClient } from "@/lib/supabase/public";

export interface DemoVideo {
  id: string;
  file: string;
  poster: string | null;
  niche: string;
  channel: string;
  title: string;
  description: string;
}

/** Published demo videos, in sort order (public read). */
export async function getPublishedVideos(): Promise<DemoVideo[]> {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("videos")
    .select("id, file, poster, niche, channel, title, description")
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as DemoVideo[];
}
