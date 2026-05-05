#!/usr/bin/env python3
"""Offline regression checks for blog build and generation automation."""

from __future__ import annotations

import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import build_blog as bb
import generate_blog_post as gb


def _write_post(posts_dir: Path, slug: str, body: str) -> None:
    posts_dir.mkdir(parents=True, exist_ok=True)
    (posts_dir / f"{slug}.md").write_text(
        "\n".join(
            [
                "---",
                f"title: {slug.replace('-', ' ').title()}",
                "description: A practical post for regression testing.",
                "date: 2026-05-05",
                f"slug: {slug}",
                "tags: budgeting, privacy, habits",
                "status: ready",
                "---",
                "",
                f"# {slug.replace('-', ' ').title()}",
                "",
                body,
                "",
            ]
        ),
        encoding="utf-8",
    )


def test_asset_selection_skips_used_urls_and_slug_collisions() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        assets = root / "blog" / "assets"
        posts = root / "posts"
        assets.mkdir(parents=True)
        posts.mkdir()

        for name in ["alpha.webp", "beta.webp", "gamma.webp"]:
            (assets / name).write_bytes(b"not-a-real-webp")

        _write_post(posts, "existing-post", "![Used](/blog/assets/alpha.webp)")

        old_assets, old_posts = gb.BLOG_ASSETS_DIR, gb.POSTS_DIR
        try:
            gb.BLOG_ASSETS_DIR = assets
            gb.POSTS_DIR = posts
            selected_path, slug, url = gb.select_next_asset(
                existing_slugs={"beta"}, used_urls=gb.used_blog_asset_urls_in_posts()
            )
        finally:
            gb.BLOG_ASSETS_DIR = old_assets
            gb.POSTS_DIR = old_posts

    assert selected_path.name == "gamma.webp"
    assert slug == "gamma"
    assert url == "/blog/assets/gamma.webp"


def test_generated_post_requires_exactly_one_selected_image() -> None:
    good = """---
title: Expense Planning
description: A short practical description.
date: 2026-05-05
slug: expense-planning
tags: budgeting, privacy, habits
status: ready
---

# Expense Planning

Intro copy about the selected screen.

![Budget Plan screen showing expense planning](/blog/assets/expense-planning.webp)

## First section

""" + " ".join(["A practical sentence about budget planning."] * 70) + """

## One action today

Open the app and review the category shown in the screenshot.
"""

    metadata = gb.validate_generated_post(
        good,
        expected_slug="expense-planning",
        required_image_url="/blog/assets/expense-planning.webp",
        existing_slugs=set(),
        today="2026-05-05",
    )
    assert metadata["slug"] == "expense-planning"

    two_images = good + "\n![Extra](/blog/assets/extra.webp)\n"
    try:
        gb.validate_generated_post(
            two_images,
            expected_slug="expense-planning",
            required_image_url="/blog/assets/expense-planning.webp",
            existing_slugs=set(),
            today="2026-05-05",
        )
    except RuntimeError as exc:
        assert "exactly one" in str(exc)
    else:
        raise AssertionError("Expected multiple image validation failure")

    wrong_image = good.replace("/blog/assets/expense-planning.webp", "/blog/assets/other.webp")
    try:
        gb.validate_generated_post(
            wrong_image,
            expected_slug="expense-planning",
            required_image_url="/blog/assets/expense-planning.webp",
            existing_slugs=set(),
            today="2026-05-05",
        )
    except RuntimeError as exc:
        assert "selected asset" in str(exc)
    else:
        raise AssertionError("Expected wrong image validation failure")


def test_build_preserves_blog_assets() -> None:
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        posts = root / "posts"
        blog = root / "blog"
        assets = blog / "assets"
        assets.mkdir(parents=True)
        (assets / "kept.webp").write_bytes(b"asset-bytes")
        (blog / "old-post").mkdir()
        (blog / "old-post" / "index.html").write_text("old", encoding="utf-8")
        _write_post(posts, "sample-post", "Sample body for build regression.")

        old_posts = bb.POSTS_DIR
        old_blog = bb.BLOG_DIR
        old_index = bb.INDEX_PATH
        old_rss = bb.RSS_PATH
        old_sitemap = bb.SITEMAP_PATH
        try:
            bb.POSTS_DIR = posts
            bb.BLOG_DIR = blog
            bb.INDEX_PATH = root / "index.html"
            bb.RSS_PATH = root / "rss.xml"
            bb.SITEMAP_PATH = root / "sitemap.xml"
            bb.INDEX_PATH.write_text(
                "<!-- BLOG_LATEST_START --><!-- BLOG_LATEST_END -->", encoding="utf-8"
            )
            bb.build()
        finally:
            bb.POSTS_DIR = old_posts
            bb.BLOG_DIR = old_blog
            bb.INDEX_PATH = old_index
            bb.RSS_PATH = old_rss
            bb.SITEMAP_PATH = old_sitemap

        assert (assets / "kept.webp").read_bytes() == b"asset-bytes"
        assert not (blog / "old-post").exists()
        assert (blog / "sample-post" / "index.html").exists()


def main() -> None:
    test_asset_selection_skips_used_urls_and_slug_collisions()
    test_generated_post_requires_exactly_one_selected_image()
    test_build_preserves_blog_assets()
    print("blog automation checks ok")


if __name__ == "__main__":
    main()
