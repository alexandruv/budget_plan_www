#!/usr/bin/env python3
"""Quick checks for Markdown → HTML blog rendering (run via npm test)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import build_blog as bb


def test_inline_image() -> None:
    html_out = bb.markdown_to_html("Hello ![Alt](/blog/assets/x.jpg) world.", "T")
    assert "/blog/assets/x.jpg" in html_out
    assert "<img" in html_out


def test_block_image() -> None:
    html_out = bb.markdown_to_html("Intro\n\n![Cap](/blog/assets/y.png)\n\nNext", "T")
    assert "figure" in html_out
    assert "/blog/assets/y.png" in html_out


def test_invalid_url_raises() -> None:
    try:
        bb.markdown_to_html("![](/evil.jpg)", "T")
    except ValueError:
        return
    raise AssertionError("expected ValueError for invalid image URL")


def main() -> None:
    test_inline_image()
    test_block_image()
    test_invalid_url_raises()
    print("blog markdown snippets ok")


if __name__ == "__main__":
    main()
