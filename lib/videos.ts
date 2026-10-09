import { createPublicClient } from "@/lib/supabase/public";
import { readdirSync, existsSync } from "fs";
import { join } from "path";

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
  if (supabase) {
    const { data, error } = await supabase
      .from("videos")
      .select("id, file, poster, niche, channel, title, description")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (!error && data && data.length > 0) return data as DemoVideo[];
  }
  // Fallback: local public/videos files (DB empty or unreachable).
  return getLocalVideos();
}

/**
 * Safe fallback — builds video list from local public/videos/*.mp4 files.
 * Never throws; returns [] if directory is missing.
 */
function getLocalVideos(): DemoVideo[] {
  try {
    const dir = join(process.cwd(), "public", "videos");
    if (!existsSync(dir)) return [];
    const files = readdirSync(dir).filter((f) => f.endsWith(".mp4")).sort();
    return files.map((file, i) => {
      const base = file.replace(/\.mp4$/, "");
      // demo-boutique-whatsapp → niche: boutique, channel: whatsapp
      const parts = base.replace(/^demo-/, "").split("-");
      const channel = parts[parts.length - 1] || "website";
      const niche = parts.slice(0, -1).join(" ") || base;
      const posterPng = base + ".png";
      const poster = existsSync(join(dir, posterPng)) ? `/videos/${posterPng}` : null;
      return {
        id: `local-${i}`,
        file: `/videos/${file}`,
        poster,
        niche: niche.charAt(0).toUpperCase() + niche.slice(1),
        channel: channel.charAt(0).toUpperCase() + channel.slice(1),
        title: `${niche.charAt(0).toUpperCase() + niche.slice(1)} — ${channel} AI demo`,
        description: `Watch a ReplyPilot AI agent handle ${niche} enquiries over ${channel}.`,
      };
    });
  } catch {
    return [];
  }
}
