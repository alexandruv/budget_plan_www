# Agent and automation context (Budget Plan website)

This file orients **AI coding agents**, **weekly blog automation**, and **human editors** to the same rules. Authoritative detail lives in [`CONTRIBUTING_BLOG.md`](CONTRIBUTING_BLOG.md).

## Blog: weekly GitHub Actions + Gemini

- **Workflow:** [`.github/workflows/generate-blog-post.yml`](.github/workflows/generate-blog-post.yml) — scheduled **Mondays 07:00 UTC** and `workflow_dispatch`.
- **Generator:** [`scripts/generate_blog_post.py`](scripts/generate_blog_post.py) — picks the **next unused** image in [`blog/assets/`](blog/assets/) (filenames already embedded in [`posts/*.md`](posts/) are skipped), sends the image to Gemini (multimodal) plus style rules, enforces **exactly one** screenshot per post, validates output, runs [`scripts/build_blog.py`](scripts/build_blog.py). [`content/blog_topics.json`](content/blog_topics.json) is optional human-only backlog; the bot does not read it for topic selection.
- **Style injected into the model:** [`content/blog_style.md`](content/blog_style.md) (includes **Screenshots** rules).
- **After changing Markdown sources:** run `npm run build:blog` so `blog/**/*.html`, RSS, and related outputs stay consistent.

## Blog images (non‑negotiable)

1. **Assets directory:** [`blog/assets/`](blog/assets/) — screenshots are stored as **optimized WebP** (`.webp`).
2. **Markdown embedding:** use **site-root absolute URLs only**:

   `![Meaningful alt text](/blog/assets/some-name.webp)`

   Relative paths (e.g. `../assets/...`) **fail** [`scripts/build_blog.py`](scripts/build_blog.py) validation.

3. **Weekly generator:** each run selects **one** unused asset, passes it to the model with vision, and requires **one** Markdown image line for that URL only.

4. **Topic emphasis:** filenames (without extension) drive what to emphasize; the post must be **about that screen**; see **§1** in [`CONTRIBUTING_BLOG.md`](CONTRIBUTING_BLOG.md).

## Cursor

- File-scoped guidance for posts and generator tooling lives in [`.cursor/rules/blog-content.mdc`](.cursor/rules/blog-content.mdc).
