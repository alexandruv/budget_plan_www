# Budget Plan website

Static marketing and blog site for Budget Plan, a simple privacy-first budgeting app. Every unit of income gets a job before the month starts.

## Product positioning

- **Zero-based budgeting** - Allocate income to categories before spending.
- **Daily tracking** - Log expenses against the current monthly plan.
- **Flexible adjustments** - Move money between categories when life happens.
- **Privacy-first** - Local-first positioning, no ads, no account requirement, no data selling.

Published site: https://alexandruv.github.io/budget_plan_www

## Local setup

```sh
npm ci
npm run install:browsers
```

The Playwright installer pins browser binaries under `.playwright-browsers/` so local and CI paths stay consistent.

## Local preview

The site is plain static HTML. Serve the repository root so `/blog/...` asset paths work the same way they do after publishing:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Useful URLs:

- Home: http://127.0.0.1:8000/
- Blog index: http://127.0.0.1:8000/blog/
- Latest generated article: check `posts/*.md` for the newest `slug`, then open `http://127.0.0.1:8000/blog/<slug>/`.

## Blog workflow

Markdown source lives in `posts/*.md`. Generated static output lives under `blog/`, with shared screenshots in `blog/assets/`.

After changing Markdown or the blog builder:

```sh
npm run build:blog
```

Image rules:

- Store screenshots as optimized `.webp` files in `blog/assets/`.
- Embed screenshots with site-root URLs only: `![Alt](/blog/assets/file-name.webp)`.
- Weekly AI drafts use exactly one screenshot. The generator picks the next unused asset, sends it to Gemini with vision, and requires the post to be about that screen.

Full editorial and automation rules: `CONTRIBUTING_BLOG.md` and `AGENTS.md`.

## Weekly AI draft automation

GitHub Actions workflow: `.github/workflows/generate-blog-post.yml`

- Scheduled every Monday at `07:00 UTC`.
- Can be run manually from GitHub Actions with **Generate blog post**.
- Requires the `GEMINI_API_KEY` repository secret.
- Opens a pull request from `ai/blog-post` to `main`.

Review checklist before merging a generated PR:

- The article contains exactly one screenshot and it matches the post topic.
- No fake statistics, unsupported product claims, or personal financial advice.
- The rendered article, blog index, and homepage blog cards look correct.
- `blog/assets/` is not deleted or modified unexpectedly.

## Tests

Fast blog automation checks:

```sh
npm run test:blog
```

Analytics snippet check:

```sh
npm run check:analytics
```

Full local suite:

```sh
npm test
```

`npm test` runs Google Analytics validation, offline Python blog tests, and Playwright browser tests.

## Troubleshooting

- **Playwright browser missing:** run `npm run install:browsers`.
- **Generated PR missing:** open the workflow logs and check the `pull-request-url` output. If needed, compare `main...ai/blog-post` manually.
- **Gemini failure:** confirm `GEMINI_API_KEY` exists in GitHub Actions secrets and check whether the selected `GEMINI_MODEL` has quota.
- **Blog assets disappear after build:** this should be caught by `npm run test:blog`; `scripts/build_blog.py` must preserve `blog/assets/`.