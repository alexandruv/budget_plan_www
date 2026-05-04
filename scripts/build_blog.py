#!/usr/bin/env python3
"""Build the static Budget Plan blog from Markdown posts."""

from __future__ import annotations

import datetime as dt
import email.utils
import html
import re
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.parse import urljoin


ROOT = Path(__file__).resolve().parents[1]
POSTS_DIR = ROOT / "posts"
BLOG_DIR = ROOT / "blog"
INDEX_PATH = ROOT / "index.html"
RSS_PATH = ROOT / "rss.xml"
SITEMAP_PATH = ROOT / "sitemap.xml"
SITE_URL = "https://alexandruv.github.io/budget_plan_www/"

REQUIRED_FIELDS = {"title", "description", "date", "slug", "tags", "status"}
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
PLACEHOLDER_RE = re.compile(r"\b(lorem ipsum|todo|tbd|placeholder|insert\b)", re.IGNORECASE)


@dataclass(frozen=True)
class Post:
    title: str
    description: str
    date: dt.date
    slug: str
    tags: tuple[str, ...]
    status: str
    source_path: Path
    body_markdown: str

    @property
    def url_path(self) -> str:
        return f"blog/{self.slug}/"

    @property
    def absolute_url(self) -> str:
        return urljoin(SITE_URL, self.url_path)


def parse_front_matter(path: Path) -> tuple[dict[str, str], str]:
    raw = path.read_text(encoding="utf-8").strip()
    if not raw.startswith("---\n"):
        raise ValueError(f"{path}: missing front matter block")

    try:
        _, front_matter, body = raw.split("---", 2)
    except ValueError as exc:
        raise ValueError(f"{path}: invalid front matter block") from exc

    metadata: dict[str, str] = {}
    for line in front_matter.strip().splitlines():
        if not line.strip():
            continue
        if ":" not in line:
            raise ValueError(f"{path}: invalid front matter line: {line}")
        key, value = line.split(":", 1)
        metadata[key.strip()] = value.strip().strip('"')

    return metadata, body.strip()


def load_posts() -> list[Post]:
    posts: list[Post] = []
    seen_slugs: set[str] = set()
    seen_titles: set[str] = set()

    for path in sorted(POSTS_DIR.glob("*.md")):
        metadata, body = parse_front_matter(path)
        missing = REQUIRED_FIELDS - set(metadata)
        if missing:
            raise ValueError(f"{path}: missing required metadata: {', '.join(sorted(missing))}")

        status = metadata["status"].lower()
        if status not in {"draft", "ready"}:
            raise ValueError(f"{path}: status must be 'draft' or 'ready'")

        slug = metadata["slug"]
        if not SLUG_RE.match(slug):
            raise ValueError(f"{path}: slug must be lowercase kebab-case")
        if slug in seen_slugs:
            raise ValueError(f"{path}: duplicate slug '{slug}'")
        seen_slugs.add(slug)

        title = metadata["title"]
        title_key = title.casefold()
        if title_key in seen_titles:
            raise ValueError(f"{path}: duplicate title '{title}'")
        seen_titles.add(title_key)

        try:
            published_at = dt.date.fromisoformat(metadata["date"])
        except ValueError as exc:
            raise ValueError(f"{path}: date must use YYYY-MM-DD") from exc

        if PLACEHOLDER_RE.search(body) or PLACEHOLDER_RE.search(title) or PLACEHOLDER_RE.search(metadata["description"]):
            raise ValueError(f"{path}: placeholder text is not allowed")

        tags = tuple(tag.strip() for tag in metadata["tags"].split(",") if tag.strip())
        if not tags:
            raise ValueError(f"{path}: at least one tag is required")

        posts.append(
            Post(
                title=title,
                description=metadata["description"],
                date=published_at,
                slug=slug,
                tags=tags,
                status=status,
                source_path=path,
                body_markdown=body,
            )
        )

    ready_posts = [post for post in posts if post.status == "ready"]
    if not ready_posts:
        raise ValueError("No ready posts found. Add at least one post with status: ready.")

    return sorted(ready_posts, key=lambda post: post.date, reverse=True)


def inline_markdown(text: str) -> str:
    escaped = html.escape(text)
    escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", escaped)
    escaped = re.sub(r"\[([^\]]+)\]\((https?://[^)]+)\)", r'<a href="\2">\1</a>', escaped)
    return escaped


def markdown_to_html(markdown: str, title: str) -> str:
    lines = markdown.splitlines()
    blocks: list[str] = []
    paragraph: list[str] = []
    list_items: list[str] = []
    skipped_h1 = False

    def flush_paragraph() -> None:
        if paragraph:
            blocks.append(f"<p>{inline_markdown(' '.join(paragraph))}</p>")
            paragraph.clear()

    def flush_list() -> None:
        if list_items:
            items = "".join(f"<li>{inline_markdown(item)}</li>" for item in list_items)
            blocks.append(f"<ul>{items}</ul>")
            list_items.clear()

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            flush_paragraph()
            flush_list()
            continue

        if line.startswith("# "):
            flush_paragraph()
            flush_list()
            heading = line[2:].strip()
            if not skipped_h1 and heading == title:
                skipped_h1 = True
                continue
            blocks.append(f"<h2>{inline_markdown(heading)}</h2>")
            continue

        if line.startswith("## "):
            flush_paragraph()
            flush_list()
            blocks.append(f"<h2>{inline_markdown(line[3:].strip())}</h2>")
            continue

        if line.startswith("### "):
            flush_paragraph()
            flush_list()
            blocks.append(f"<h3>{inline_markdown(line[4:].strip())}</h3>")
            continue

        if line.startswith("- "):
            flush_paragraph()
            list_items.append(line[2:].strip())
            continue

        paragraph.append(line)

    flush_paragraph()
    flush_list()
    return "\n".join(blocks)


def render_logo(fill: str = "#e6edf3") -> str:
    return f"""<svg width="26" height="26" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="9" y="10" width="22" height="4" rx="1" fill="{fill}"/>
      <rect x="9" y="18" width="16" height="4" rx="1" fill="{fill}"/>
      <rect x="9" y="26" width="10" height="4" rx="1" fill="{fill}"/>
      <circle cx="29" cy="28" r="2.5" fill="#3fb950"/>
    </svg>"""


def render_head(title: str, description: str, canonical_path: str) -> str:
    canonical = urljoin(SITE_URL, canonical_path)
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(description)}" />
<link rel="canonical" href="{canonical}" />
<link rel="alternate" type="application/rss+xml" title="Budget Plan Blog" href="{urljoin(SITE_URL, 'rss.xml')}" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>
:root {{
  --bg: #0d1117;
  --bg-elevated: #151b23;
  --bg-subtle: #1c2430;
  --border: #2a3441;
  --border-strong: #3a4655;
  --text: #e6edf3;
  --text-muted: #8b949e;
  --text-dim: #6e7681;
  --blue: #58a6ff;
  --green: #3fb950;
  --font-display: "Geist", "Inter", system-ui, -apple-system, sans-serif;
  --font-body: "Geist", "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace;
  --r-lg: 16px;
}}
*, *::before, *::after {{ box-sizing: border-box; }}
html, body {{
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  scroll-behavior: smooth;
}}
body {{
  background:
    radial-gradient(ellipse 50% 35% at 85% 8%, rgba(88, 166, 255, 0.14), transparent 60%),
    radial-gradient(ellipse 45% 30% at 8% 28%, rgba(63, 185, 80, 0.08), transparent 65%),
    var(--bg);
}}
.container {{ max-width: 1120px; margin: 0 auto; padding: 0 40px; }}
.mono {{ font-family: var(--font-mono); }}
nav.top {{
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(13, 17, 23, 0.76);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}}
nav.top .inner {{
  max-width: 1120px;
  margin: 0 auto;
  padding: 18px 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}}
.brand {{
  color: inherit;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  font-weight: 600;
  letter-spacing: -0.02em;
}}
.nav-links {{ display: flex; gap: 28px; }}
.nav-links a {{
  color: var(--text-muted);
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}}
.nav-links a:hover, .nav-links a:focus-visible {{ color: var(--text); }}
.blog-hero {{ padding: 86px 0 64px; }}
.eyebrow {{
  color: var(--green);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 20px;
}}
h1 {{
  max-width: 900px;
  margin: 0;
  font-size: clamp(3rem, 8vw, 88px);
  line-height: 0.98;
  letter-spacing: -0.04em;
  font-weight: 500;
}}
.lead {{
  max-width: 700px;
  margin: 28px 0 0;
  color: var(--text-muted);
  font-size: 21px;
  line-height: 1.5;
}}
.post-grid {{
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  margin: 0 0 96px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
}}
.post-card {{
  min-height: 280px;
  padding: 32px;
  background: rgba(13, 17, 23, 0.96);
  color: inherit;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 18px;
}}
.post-card:hover, .post-card:focus-visible {{ background: var(--bg-elevated); outline: none; }}
.post-card time, .post-meta {{
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}}
.post-card h2 {{
  margin: 0;
  font-size: 32px;
  line-height: 1.08;
  letter-spacing: -0.025em;
  font-weight: 500;
}}
.post-card p {{ color: var(--text-muted); line-height: 1.55; margin: 0; }}
.post-card .read-more {{
  margin-top: auto;
  color: var(--blue);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}}
article {{
  max-width: 780px;
  padding-bottom: 96px;
}}
article .post-meta {{ margin-top: 28px; }}
article .content {{
  margin-top: 56px;
  color: var(--text);
  font-size: 19px;
  line-height: 1.72;
}}
article .content h2 {{
  margin: 56px 0 14px;
  font-size: 34px;
  line-height: 1.15;
  letter-spacing: -0.025em;
  font-weight: 500;
}}
article .content h3 {{
  margin: 36px 0 12px;
  font-size: 24px;
  letter-spacing: -0.015em;
}}
article .content p {{ margin: 0 0 24px; color: var(--text-muted); }}
article .content ul {{ margin: 0 0 28px; padding-left: 22px; color: var(--text-muted); }}
article .content li {{ margin: 8px 0; }}
article .content a {{ color: var(--blue); }}
article .content code {{
  font-family: var(--font-mono);
  font-size: 0.88em;
  background: var(--bg-subtle);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1px 5px;
}}
.back-link {{
  display: inline-flex;
  margin: 48px 0 0;
  color: var(--blue);
  text-decoration: none;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}}
footer {{
  padding: 48px 0;
  border-top: 1px solid var(--border);
  color: var(--text-dim);
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.08em;
}}
@media (max-width: 720px) {{
  .container, nav.top .inner {{ padding-left: 20px; padding-right: 20px; }}
  nav.top .inner {{ align-items: flex-start; flex-direction: column; }}
  .nav-links {{ flex-wrap: wrap; gap: 16px 22px; }}
  .blog-hero {{ padding: 56px 0 44px; }}
  .lead {{ font-size: 17px; }}
  .post-grid {{ grid-template-columns: 1fr; margin-bottom: 64px; }}
  .post-card {{ min-height: 0; padding: 24px 20px; }}
  .post-card h2 {{ font-size: 25px; }}
  article .content {{ font-size: 17px; margin-top: 40px; }}
  article .content h2 {{ font-size: 27px; }}
}}
</style>
</head>"""


def render_nav(*, home_prefix: str, blog_href: str) -> str:
    """Blog pages live under blog/; article pages live under blog/<slug>/.

    home_prefix is the relative path from the current HTML file to the site root index,
    including trailing slash semantics via "../" segments only (no leading slash).
    blog_href is the relative URL for the blog listing page from the current file.
    """
    root_index = f"{home_prefix}index.html"
    return f"""<nav class="top">
  <div class="inner">
    <a class="brand" href="{root_index}">
      {render_logo()}
      <span>Budget Plan</span>
    </a>
    <div class="nav-links" aria-label="Primary navigation">
      <a href="{root_index}#product">Product</a>
      <a href="{root_index}#privacy">Privacy</a>
      <a href="{root_index}#method">Method</a>
      <a href="{blog_href}">Blog</a>
    </div>
  </div>
</nav>"""


def render_post_card(post: Post) -> str:
    tags = " | ".join(html.escape(tag) for tag in post.tags[:3])
    return f"""<a class="post-card" href="{html.escape(post.slug)}/">
  <time datetime="{post.date.isoformat()}">{post.date.strftime('%b %d, %Y')}</time>
  <h2>{html.escape(post.title)}</h2>
  <p>{html.escape(post.description)}</p>
  <span class="post-meta">{tags}</span>
  <span class="read-more">Read article -></span>
</a>"""


def render_blog_index(posts: Iterable[Post]) -> str:
    post_cards = "\n".join(render_post_card(post) for post in posts)
    return f"""{render_head('Budget Plan Blog - Practical budgeting habits', 'Practical, privacy-first budgeting articles from Budget Plan.', 'blog/')}
<body>
{render_nav(home_prefix="../", blog_href="index.html")}
<main>
  <section class="blog-hero">
    <div class="container">
      <div class="eyebrow">Budget Plan blog</div>
      <h1>Budgeting that respects your time and your privacy.</h1>
      <p class="lead">Short, practical articles about zero-based budgeting, monthly routines, and keeping personal finance local-first.</p>
    </div>
  </section>
  <section class="container" aria-label="Latest articles">
    <div class="post-grid">
      {post_cards}
    </div>
  </section>
</main>
<footer>
  <div class="container">&copy; 2026 | Every dollar has a job.</div>
</footer>
</body>
</html>
"""


def render_article(post: Post) -> str:
    content = markdown_to_html(post.body_markdown, post.title)
    tags = " | ".join(html.escape(tag) for tag in post.tags)
    return f"""{render_head(f'{post.title} - Budget Plan Blog', post.description, post.url_path)}
<body>
{render_nav(home_prefix="../../", blog_href="../index.html")}
<main>
  <section class="blog-hero">
    <div class="container">
      <div class="eyebrow">Budget Plan blog</div>
      <article>
        <h1>{html.escape(post.title)}</h1>
        <p class="lead">{html.escape(post.description)}</p>
        <div class="post-meta">
          <time datetime="{post.date.isoformat()}">{post.date.strftime('%B %d, %Y')}</time>
          <span> | {tags}</span>
        </div>
        <div class="content">
          {content}
        </div>
        <a class="back-link" href="../index.html">Back to blog</a>
      </article>
    </div>
  </section>
</main>
<footer>
  <div class="container">&copy; 2026 | Every dollar has a job.</div>
</footer>
</body>
</html>
"""


def render_home_latest(posts: list[Post]) -> str:
    cards = []
    for post in posts[:3]:
        tags = " | ".join(html.escape(tag) for tag in post.tags[:2])
        cards.append(
            f"""      <a class="blog-card" href="blog/{html.escape(post.slug)}/">
        <time datetime="{post.date.isoformat()}">{post.date.strftime('%b %d, %Y')}</time>
        <h3>{html.escape(post.title)}</h3>
        <p>{html.escape(post.description)}</p>
        <span>{tags} -></span>
      </a>"""
        )

    return f"""<!-- BLOG_LATEST_START -->
<section class="band blog-preview" id="blog">
  <div class="container">
    <div class="section-head">
      <h2>Blog</h2>
      <span class="idx">04 | Practical money habits</span>
    </div>
    <h2 class="display">Small money systems.<br/><em>Written for real months.</em></h2>
    <p class="lead-p">Practical notes on zero-based budgeting, privacy-first tools, and month-end routines.</p>
    <div class="blog-grid">
{chr(10).join(cards)}
    </div>
    <a class="blog-more" href="blog/">All articles -></a>
  </div>
</section>
<!-- BLOG_LATEST_END -->"""


def update_homepage(posts: list[Post]) -> None:
    if not INDEX_PATH.exists():
        return

    html_text = INDEX_PATH.read_text(encoding="utf-8")
    start = "<!-- BLOG_LATEST_START -->"
    end = "<!-- BLOG_LATEST_END -->"
    if start not in html_text or end not in html_text:
        return

    pattern = re.compile(f"{re.escape(start)}.*?{re.escape(end)}", re.DOTALL)
    updated = pattern.sub(render_home_latest(posts), html_text)
    INDEX_PATH.write_text(updated, encoding="utf-8")


def render_rss(posts: list[Post]) -> str:
    items = []
    for post in posts[:20]:
        pub_date = email.utils.format_datetime(dt.datetime.combine(post.date, dt.time(8, 0), dt.timezone.utc))
        items.append(
            f"""    <item>
      <title>{html.escape(post.title)}</title>
      <link>{post.absolute_url}</link>
      <guid>{post.absolute_url}</guid>
      <pubDate>{pub_date}</pubDate>
      <description>{html.escape(post.description)}</description>
    </item>"""
        )

    return f"""<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Budget Plan Blog</title>
    <link>{urljoin(SITE_URL, 'blog/')}</link>
    <description>Practical, privacy-first budgeting articles from Budget Plan.</description>
    <language>en</language>
{chr(10).join(items)}
  </channel>
</rss>
"""


def render_sitemap(posts: list[Post]) -> str:
    urls = [
        ("", "weekly"),
        ("blog/", "weekly"),
        ("rss.xml", "weekly"),
        *[(post.url_path, "monthly") for post in posts],
    ]
    entries = "\n".join(
        f"""  <url>
    <loc>{urljoin(SITE_URL, path)}</loc>
    <changefreq>{changefreq}</changefreq>
  </url>"""
        for path, changefreq in urls
    )
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{entries}
</urlset>
"""


def build() -> None:
    posts = load_posts()

    if BLOG_DIR.exists():
        shutil.rmtree(BLOG_DIR)
    BLOG_DIR.mkdir(parents=True)

    (BLOG_DIR / "index.html").write_text(render_blog_index(posts), encoding="utf-8")
    for post in posts:
        post_dir = BLOG_DIR / post.slug
        post_dir.mkdir(parents=True)
        (post_dir / "index.html").write_text(render_article(post), encoding="utf-8")

    RSS_PATH.write_text(render_rss(posts), encoding="utf-8")
    SITEMAP_PATH.write_text(render_sitemap(posts), encoding="utf-8")
    update_homepage(posts)

    print(f"Built {len(posts)} blog post(s).")


if __name__ == "__main__":
    build()
