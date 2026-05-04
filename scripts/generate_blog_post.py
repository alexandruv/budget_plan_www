#!/usr/bin/env python3
"""Generate one Budget Plan blog draft with Gemini and rebuild static output."""

from __future__ import annotations

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
TOPICS_PATH = ROOT / "content" / "blog_topics.json"
STYLE_PATH = ROOT / "content" / "blog_style.md"
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash-lite")
GEMINI_ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
MAX_GEMINI_ATTEMPTS = 3


def existing_metadata() -> list[dict[str, str]]:
    posts: list[dict[str, str]] = []
    for path in sorted(POSTS_DIR.glob("*.md")):
        metadata, _ = build_blog.parse_front_matter(path)
        posts.append(metadata)
    return posts


def select_topic(existing_slugs: set[str]) -> dict[str, str]:
    topics = json.loads(TOPICS_PATH.read_text(encoding="utf-8"))["topics"]
    for topic in topics:
        if topic["slug_hint"] not in existing_slugs:
            return topic
    raise RuntimeError("All configured blog topics already exist. Add more entries to content/blog_topics.json.")


def build_prompt(topic: dict[str, str], existing_posts: list[dict[str, str]], today: str) -> str:
    style = STYLE_PATH.read_text(encoding="utf-8")
    existing = "\n".join(f"- {post['title']} ({post['slug']})" for post in existing_posts) or "- None"
    return textwrap.dedent(
        f"""
        You are writing one production-ready Markdown article for the Budget Plan website.

        Topic title: {topic["title"]}
        Topic angle: {topic["angle"]}
        Required slug: {topic["slug_hint"]}
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
        slug: {topic["slug_hint"]}
        tags: budgeting, privacy, habits
        status: ready
        ---

        Requirements:
        - 850 to 1200 words.
        - One H1 matching the title.
        - 4 to 6 H2 sections.
        - Concrete examples using monthly spending categories.
        - No fake statistics, no citations, no investment advice, no debt advice, no tax advice.
        - No unsupported claims about Budget Plan features.
        - End with one practical action the reader can take today.
        """
    ).strip()


def call_gemini(prompt: str) -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is required.")

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.9,
            "maxOutputTokens": 4096,
        },
    }
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        f"{GEMINI_ENDPOINT}?key={api_key}",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    for attempt in range(1, MAX_GEMINI_ATTEMPTS + 1):
        try:
            with urllib.request.urlopen(request, timeout=90) as response:
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


def validate_generated_post(markdown: str, topic: dict[str, str], existing_slugs: set[str], today: str) -> dict[str, str]:
    temp_path = ROOT / ".generated-blog-post.tmp.md"
    temp_path.write_text(markdown, encoding="utf-8")
    try:
        metadata, body = build_blog.parse_front_matter(temp_path)
    finally:
        temp_path.unlink(missing_ok=True)

    missing = build_blog.REQUIRED_FIELDS - set(metadata)
    if missing:
        raise RuntimeError(f"Generated post is missing metadata: {', '.join(sorted(missing))}")

    if metadata["slug"] != topic["slug_hint"]:
        raise RuntimeError(f"Generated slug must be {topic['slug_hint']}, got {metadata['slug']}")
    if metadata["slug"] in existing_slugs:
        raise RuntimeError(f"Generated slug already exists: {metadata['slug']}")
    if metadata["date"] != today:
        raise RuntimeError(f"Generated date must be {today}, got {metadata['date']}")
    if metadata["status"].lower() != "ready":
        raise RuntimeError("Generated status must be ready so the PR preview includes rendered output.")
    if build_blog.PLACEHOLDER_RE.search(markdown):
        raise RuntimeError("Generated post contains placeholder text.")
    if f"# {metadata['title']}" not in body:
        raise RuntimeError("Generated post must include one H1 matching the title.")
    if len(re.findall(r"^## ", body, flags=re.MULTILINE)) < 4:
        raise RuntimeError("Generated post must include at least four H2 sections.")

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
    topic = select_topic(existing_slugs)
    today = dt.date.today().isoformat()

    prompt = build_prompt(topic, existing_posts, today)
    markdown = clean_markdown(call_gemini(prompt))
    metadata = validate_generated_post(markdown, topic, existing_slugs, today)
    post_path = write_post(markdown, metadata["slug"])

    subprocess.run([sys.executable, str(ROOT / "scripts" / "build_blog.py")], cwd=ROOT, check=True)
    print(f"Generated {post_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
