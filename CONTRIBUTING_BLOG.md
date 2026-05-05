# BudgetPlan blog — contributor guidelines

How drafts are written, where files live, and what ships to readers.

## Repository and published URLs

- **Markdown sources:** `posts/*.md` (YAML front matter + body). After edits, run `npm run build:blog` so HTML, RSS, and related outputs stay in sync.
- **Screenshots:** `blog/assets/`. Store them as **optimized WebP** (`.webp`). Embed images only with **site-root absolute URLs** (required by the builder), e.g. `![Caption](/blog/assets/expense-categories.webp)`. Relative paths such as `../assets/...` will fail validation.
- **Live site:** Posts are reachable at [https://budgetplan.pomeloapps.com/blog/](https://budgetplan.pomeloapps.com/blog/) once deployed.

## Cadence: one AI-assisted draft per week

Automation opens **one** pull request per week with a fresh Gemini draft **when at least one image under `blog/assets/` is not yet used in any `posts/*.md` file** (first unused by sorted filename). Schedule: **Mondays at 07:00 UTC**, via [`.github/workflows/generate-blog-post.yml`](.github/workflows/generate-blog-post.yml). You can also trigger the same workflow manually (**Actions → Generate blog post → Run workflow**). Merge after your usual editorial review.

**How the generator picks content:** It chooses the next **unused** screenshot, sends the **image pixels** to the model (vision), derives the post **slug** from the filename stem (e.g. `expense-planning.webp` → slug `expense-planning`), and requires **exactly one** Markdown embed for that URL. The file [`content/blog_topics.json`](content/blog_topics.json) is an optional human backlog only; the bot does **not** select topics from it.

### Images: weekly generator, local agents, and humans

The same rules apply to **GitHub Actions (Gemini)**, **IDE agents**, and **manual editing**:

1. **Location and format:** Screenshots live under `blog/assets/` as **`.webp`** files (optimized for the web). Do not embed URLs to files that are not committed there.
2. **Markdown syntax:** Use exactly `![meaningful alt text](/blog/assets/<filename>.webp)`. Only **site-root** paths starting with `/blog/assets/` are valid; [`scripts/build_blog.py`](scripts/build_blog.py) rejects anything else.
3. **Allowed URLs at generation time:** the script selects **one** unused `/blog/assets/...` file per run, injects that URL (and image vision) into Gemini, and validates a **single** embed for that URL only.
4. **Topic alignment:** see §1 — filenames (without extension) guide emphasis; **automation drafts** must be **about that one screen** only.

For a one-line reminder also loaded into the model prompt, see [`content/blog_style.md`](content/blog_style.md) (**Screenshots**). Project-wide agent context lives in [`AGENTS.md`](AGENTS.md).

## 1. Core workflow: image-to-topic logic

Treat each filename in `blog/assets/` as the source of truth for what to emphasize.

- **Parsing:** Take the filename (e.g., `expense-categories.webp`), drop the extension, replace hyphens with spaces → primary keyword phrase.
- **Constraint:** If the image is `overbudget.webp`, the post must focus on the psychology and mechanics of handling overspending inside BudgetPlan.
- **Embed:** Exactly **one** screenshot per article for automation drafts. Place it immediately after the H1 or the first paragraph. Example: `![Short caption](/blog/assets/overbudget.webp)`.

## 2. Persona: “The pragmatic developer”

Write as **Alex**, a software architect born in 1981.

- **Voice:** Helpful, peer-to-peer, zero fluff.
- **Philosophy:** You value the “utility web”—tools that solve problems quickly and stay out of the way.
- **1981 lens:** Prefer stability, privacy, and speed over flashy trends.
- **Banned phrases:** “In today’s fast-paced world,” “revolutionize your life,” “unlock your potential,” “let’s dive in.”

## 3. SEO technical must-haves

- **`<title>` (from front matter `title` + generator):** About 50–60 characters. Structure: **[Primary keyword]: [benefit/hook] | BudgetPlan**
- **Meta description (`description` in front matter):** About 140–155 characters. End with a **download CTA** aligned with the homepage `#download` section, for example: **Download Budget Plan on iOS or Android.** (Adjust wording slightly if needed for length; keep the same intent: send readers to install the app.)
- **Headings:** One `#` H1 only (must match `title`). `##` for main sections. `###` for sub-points.
- **Images:** Every `<img>` needs a meaningful `alt`. Preferred pattern: **`Budget Plan screen showing [what the reader should notice]`**. Use a shorter variant only when necessary for accessibility length, without inventing UI that is not in the shot.

## 4. Linking strategy

- **Internal (download):** Link to **`https://budgetplan.pomeloapps.com/#download`** using anchor text **`Download now`** (same intent as the homepage hero button leading to store links).
- **Internal (blog):** Link to at least one other post under `/blog/` with descriptive anchor text.
- **External (authority):** One reputable, non-competitive background link. **EU-conscious sourcing:** Prefer neutral, credible references (for example EU institution consumer pages, independent nonprofits, or international educational material). Avoid sensational finance blogs, affiliate-heavy pages, or anything that reads like personalised investment, tax, or legal advice. Stay consistent with BudgetPlan’s privacy-first, educational positioning.

## 5. Length and structure

- **Length (manual long-form):** Aim for roughly **650–850 words**, treating **±50 words** as acceptable slack around the upper bound.
- **Length (weekly AI drafts):** About **400–600 words** — short, one screenshot, 2–4 sections (see `scripts/generate_blog_post.py`).
- **Introduction:** Short—problem and direction in a tight opening (two or three sentences is enough).
- **Screenshot:** When using `blog/assets`, place it right after the H1 or first paragraph (**one** image for automation-generated drafts).
- **Body:** Practical utility; realistic monthly categories and behaviour beat abstract advice.
- **Close:** Finish with something like **“One thing to try today”—**a single concrete action, not a hypey sales push.

Machine-generated drafts also follow `content/blog_style.md` and the requirements in `scripts/generate_blog_post.py`; this document is the reference for **BudgetPlan** naming, **absolute** asset URLs, linking, SEO shape, and EU-safe external citations.
