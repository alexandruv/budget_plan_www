#!/usr/bin/env python3
"""Generate one Budget Plan blog draft with Gemini and rebuild static output."""

from __future__ import annotations

import base64
import datetime as dt
import json
import os
import re
import subprocess
import sys
import textwrap
import time
import urllib.error
import urllib.request
from pathlib import Path

import build_blog

ROOT = Path(__file__).resolve().parents[1]
POSTS_DIR = ROOT / "posts"
BLOG_ASSETS_DIR = ROOT / "blog" / "assets"
STYLE_PATH = ROOT / "content" / "blog_style.md"
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-lite")
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
MAX_GEMINI_ATTEMPTS = 3

# MIME types for inline image parts (filename extension -> mime)
_EXT_MIME = {
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
}


def existing_metadata() -> list[dict[str, str]]:
    posts: list[dict[str, str]] = []
    for path in sorted(POSTS_DIR.glob("*.md")):
        metadata, _ = build_blog.parse_front_matter(path)
        posts.append(metadata)
    return posts


def list_blog_asset_paths() -> list[Path]:
    if not BLOG_ASSETS_DIR.is_dir():
        return []
    allowed = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    paths = [
        p
        for p in BLOG_ASSETS_DIR.iterdir()
        if p.is_file() and p.suffix.lower() in allowed
    ]
    return sorted(paths, key=lambda p: p.name.lower())


def used_blog_asset_urls_in_posts() -> set[str]:
    """URLs already referenced in any post body (automation will not reuse these)."""
    used: set[str] = set()
    for path in POSTS_DIR.glob("*.md"):
        _, body = build_blog.parse_front_matter(path)
        for _alt, raw_url in build_blog.IMG_MARKDOWN_RE.findall(body):
            u = raw_url.strip()
            if u.startswith("/blog/assets/"):
                used.add(u)
    return used


def select_next_asset(
    existing_slugs: set[str], used_urls: set[str]
) -> tuple[Path, str, str]:
    """Return (file path, slug, site-root image URL) for the next unused asset."""
    for path in list_blog_asset_paths():
        stem = path.stem
        url = f"/blog/assets/{path.name}"
        if not build_blog.SLUG_RE.match(stem):
            print(f"[generate_blog_post] Skip asset with non-slug name: {path.name}", file=sys.stderr)
            continue
        if url in used_urls:
            continue
        if stem in existing_slugs:
            continue
        return path, stem, url

    if not list_blog_asset_paths():
        raise RuntimeError("No image files found under blog/assets/. Add at least one .webp screenshot.")
    raise RuntimeError(
        "Every image in blog/assets/ is already used in some post (Markdown image line), or its "
        "slug clashes with an existing post filename. Add new files under blog/assets/, or remove "
        "duplicate posts."
    )


def build_prompt(
    *,
    slug: str,
    image_url: str,
    filename_stem: str,
    existing_posts: list[dict[str, str]],
    today: str,
) -> str:
    style = STYLE_PATH.read_text(encoding="utf-8")
    existing = "\n".join(f"- {post['title']} ({post['slug']})" for post in existing_posts) or "- None"
    phrase = filename_stem.replace("-", " ")
    return textwrap.dedent(
        f"""
        You are writing one production-ready Markdown article for the Budget Plan website.

        **This week we selected exactly one screenshot for you. The whole article must be about
        that screen — what the user is looking at, why it matters for monthly budgeting, and what
        to do next. Do not write about other screens or generic budgeting theory unless it directly
        supports reading this UI.**

        Selected screenshot (filename hint): `{filename_stem}` → treat as topic phrase: "{phrase}"
        The ONLY image URL you may embed in Markdown is this one (exactly once):
        `{image_url}`

        You are also given the image pixels in the next message part — inspect them like a product
        demo (tabs, numbers, labels) but do not invent UI text that is unreadable.

        Required slug: `{slug}` (must match front matter `slug:` exactly)
        Required publish date: {today}

        Existing posts to avoid duplicating:
        {existing}

        Style and policy:
        {style}

        Return only a complete Markdown file. Do not wrap it in code fences.
        The file must start with this front matter shape:
        ---
        title: ...
        description: ...
        date: {today}
        slug: {slug}
        tags: budgeting, privacy, habits
        status: ready
        ---

        Requirements:
        - **Exactly one** Markdown image in the entire file: `![short caption]({image_url})`
          Place it immediately after the H1 or the first paragraph.
        - Do **not** embed any other `/blog/assets/` image or second image of any kind.
        - About **400 to 600 words** (short and practical). Stay tight.
        - **Two to four** `##` sections (not more than four).
        - One H1 matching the title.
        - Concrete examples where helpful using monthly categories (rent, groceries, etc.).
        - No fake statistics, no citations, no investment advice, no debt advice, no tax advice.
        - No unsupported claims about Budget Plan features.
        - End with one practical action the reader can take today.
        """
    ).strip()


def call_gemini_with_image(prompt: str, image_path: Path) -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is required.")

    mime = _EXT_MIME.get(image_path.suffix.lower())
    if not mime:
        raise RuntimeError(f"Unsupported image type for Gemini inline upload: {image_path.suffix}")

    raw_bytes = image_path.read_bytes()
    b64 = base64.standard_b64encode(raw_bytes).decode("ascii")

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": prompt},
                    {
                        "inlineData": {
                            "mimeType": mime,
                            "data": b64,
                        }
                    },
                ],
            }
        ],
        "generationConfig": {
            "temperature": 0.65,
            "topP": 0.9,
            "maxOutputTokens": 4096,
        },
    }
    data = json.dumps(payload).encode("utf-8")
    request_obj = urllib.request.Request(
        f"{GEMINI_ENDPOINT}?key={api_key}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    for attempt in range(1, MAX_GEMINI_ATTEMPTS + 1):
        try:
            with urllib.request.urlopen(request_obj, timeout=120) as response:
                result = json.loads(response.read().decode("utf-8"))
            break
        except urllib.error.HTTPError as exc:
            details = exc.read().decode("utf-8", errors="replace")
            if exc.code == 429 and attempt < MAX_GEMINI_ATTEMPTS:
                time.sleep(30 * attempt)
                continue
            if exc.code == 429:
                raise RuntimeError(
                    "Gemini quota is exhausted or the selected model has no free-tier allowance. "
                    f"Current GEMINI_MODEL={GEMINI_MODEL}. Check https://ai.dev/rate-limit or change "
                    "GEMINI_MODEL in the workflow to a model with available quota. "
                    f"Raw response: {details}"
                ) from exc
            raise RuntimeError(f"Gemini request failed: HTTP {exc.code}: {details}") from exc

    try:
        return result["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError) as exc:
        raise RuntimeError(f"Gemini response did not include article text: {result}") from exc


def clean_markdown(markdown: str) -> str:
    text = markdown.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:markdown)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    return text.strip() + "\n"


def _count_words(body: str) -> int:
    text = body
    text = re.sub(build_blog.IMG_MARKDOWN_RE, " ", text)
    text = re.sub(r"[#*`_[\]()]+", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return len(text.split()) if text else 0


def validate_generated_post(
    markdown: str,
    *,
    expected_slug: str,
    required_image_url: str,
    existing_slugs: set[str],
    today: str,
) -> dict[str, str]:
    temp_path = ROOT / ".generated-blog-post.tmp.md"
    temp_path.write_text(markdown, encoding="utf-8")
    try:
        metadata, body = build_blog.parse_front_matter(temp_path)
    finally:
        temp_path.unlink(missing_ok=True)

    missing = build_blog.REQUIRED_FIELDS - set(metadata)
    if missing:
        raise RuntimeError(f"Generated post is missing metadata: {', '.join(sorted(missing))}")

    if metadata["slug"] != expected_slug:
        raise RuntimeError(f"Generated slug must be {expected_slug}, got {metadata['slug']}")
    if metadata["slug"] in existing_slugs:
        raise RuntimeError(f"Generated slug already exists: {metadata['slug']}")
    if metadata["date"] != today:
        raise RuntimeError(f"Generated date must be {today}, got {metadata['date']}")
    if metadata["status"].lower() != "ready":
        raise RuntimeError("Generated status must be ready so the PR preview includes rendered output.")
    if build_blog.PLACEHOLDER_RE.search(markdown):
        raise RuntimeError("Generated post contains placeholder text.")
    try:
        build_blog.validate_markdown_images(body)
    except ValueError as exc:
        raise RuntimeError(f"Generated post has invalid image URLs: {exc}") from exc

    asset_matches = [
        raw_url.strip()
        for _a, raw_url in build_blog.IMG_MARKDOWN_RE.findall(body)
        if raw_url.strip().startswith("/blog/assets/")
    ]
    if len(asset_matches) != 1:
        raise RuntimeError(
            f"The post must embed exactly one /blog/assets/ image; found {len(asset_matches)}."
        )
    if asset_matches[0] != required_image_url:
        raise RuntimeError(
            f"The embedded image must be the selected asset {required_image_url}, got {asset_matches[0]}."
        )

    if f"# {metadata['title']}" not in body:
        raise RuntimeError("Generated post must include one H1 matching the title.")
    h2_count = len(re.findall(r"^## ", body, flags=re.MULTILINE))
    if h2_count < 2 or h2_count > 4:
        raise RuntimeError(f"Generated post must have 2 to 4 H2 sections; found {h2_count}.")

    wc = _count_words(body)
    if wc < 350 or wc > 700:
        raise RuntimeError(f"Target length about 400–600 words (allow 350–700); got ~{wc} words.")

    return metadata


def write_post(markdown: str, slug: str) -> Path:
    path = POSTS_DIR / f"{slug}.md"
    if path.exists():
        raise RuntimeError(f"Refusing to overwrite existing post: {path}")
    path.write_text(markdown, encoding="utf-8")
    return path


def main() -> None:
    existing_posts = existing_metadata()
    existing_slugs = {post["slug"] for post in existing_posts}
    used_urls = used_blog_asset_urls_in_posts()

    asset_path, slug, image_url = select_next_asset(existing_slugs, used_urls)
    today = dt.date.today().isoformat()

    print(
        f"Selected image: {asset_path.name} -> slug `{slug}` (unused in posts; multimodal prompt)",
        file=sys.stderr,
    )

    prompt = build_prompt(
        slug=slug,
        image_url=image_url,
        filename_stem=asset_path.stem,
        existing_posts=existing_posts,
        today=today,
    )
    markdown = clean_markdown(call_gemini_with_image(prompt, asset_path))
    metadata = validate_generated_post(
        markdown,
        expected_slug=slug,
        required_image_url=image_url,
        existing_slugs=existing_slugs,
        today=today,
    )
    post_path = write_post(markdown, metadata["slug"])

    subprocess.run([sys.executable, str(ROOT / "scripts" / "build_blog.py")], cwd=ROOT, check=True)
    print(f"Generated {post_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
