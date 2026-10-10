#!/usr/bin/env python3
"""Append a batch of draft post objects to app/blog/posts.ts via posts.push().

Usage: integrate_batch.py <batch_dir> [posts_path]
  <batch_dir>  e.g. blog-drafts/oct10-a (relative to site root or absolute)
  [posts_path] defaults to ~/workspace/replypilot-site/app/blog/posts.ts
               (pass a copy path for dry-run testing)

Skips any slug already present in posts.ts (duplicate guard).
"""
import sys, os, re

SITE = os.path.expanduser("~/workspace/replypilot-site")
DEFAULT_POSTS = os.path.join(SITE, "app/blog/posts.ts")

def main():
    batch_dir = sys.argv[1]
    if not os.path.isabs(batch_dir):
        batch_dir = os.path.join(SITE, batch_dir)
    posts_path = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_POSTS

    existing = open(posts_path).read()
    existing_slugs = set(re.findall(r'slug: "([a-z0-9-]+)"', existing))

    blocks = []
    for fn in sorted(os.listdir(batch_dir)):
        if not fn.endswith(".ts"):
            continue
        text = open(os.path.join(batch_dir, fn)).read().strip()
        m = re.search(r'slug: "([a-z0-9-]+)"', text)
        slug = m.group(1) if m else fn
        if slug in existing_slugs:
            print(f"SKIP (already present): {slug}")
            continue
        if text.endswith(","):
            text = text[:-1].rstrip()
        blocks.append(text)
        existing_slugs.add(slug)

    if not blocks:
        print("nothing to append")
        return

    push_block = "\nposts.push(\n" + ",\n".join(blocks) + "\n);\n"
    with open(posts_path, "a") as f:
        f.write(push_block)
    print(f"appended {len(blocks)} posts -> {posts_path}")

if __name__ == "__main__":
    main()
