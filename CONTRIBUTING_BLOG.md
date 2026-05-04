# BudgetPlan blog — contributor guidelines

How drafts are written, where files live, and what ships to readers.

## Repository and published URLs

- **Markdown sources:** `posts/*.md` (YAML front matter + body). After edits, run `npm run build:blog` so HTML, RSS, and related outputs stay in sync.
- **Screenshots:** `blog/assets/`. Embed images only with **site-root absolute URLs** (required by the builder), e.g. `![Caption](/blog/assets/expense-categories.jpg)`. Relative paths such as `../assets/...` will fail validation.
- **Live site:** Posts are reachable at [https://budgetplan.pomeloapps.com/blog/](https://budgetplan.pomeloapps.com/blog/) once deployed.

## Cadence: one AI-assisted draft per week

Automation opens **one** pull request per week with a fresh Gemini draft (when unused topics remain in `content/blog_topics.json`). Schedule: **Mondays at 07:00 UTC**, via [`.github/workflows/generate-blog-post.yml`](.github/workflows/generate-blog-post.yml). You can also trigger the same workflow manually (**Actions → Generate blog post → Run workflow**). Merge after your usual editorial review.

## 1. Core workflow: image-to-topic logic

Treat each filename in `blog/assets/` as the source of truth for what to emphasize.

- **Parsing:** Take the filename (e.g., `expense-categories.jpg`), drop the extension, replace hyphens with spaces → primary keyword phrase.
- **Constraint:** If the image is `overbudget.jpg`, the post must focus on the psychology and mechanics of handling overspending inside BudgetPlan.
- **Embed:** Place the screenshot immediately after the H1 or the first paragraph. Example: `![Short caption](/blog/assets/overbudget.jpg)`.

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

- **Length:** Aim for roughly **650–850 words**, treating **±50 words** as acceptable slack around the upper bound.
- **Introduction:** Short—problem and direction in a tight opening (two or three sentences is enough).
- **Screenshot:** When using `blog/assets`, place it right after the H1 or first paragraph.
- **Body:** Practical utility; realistic monthly categories and behaviour beat abstract advice.
- **Close:** Finish with something like **“One thing to try today”—**a single concrete action, not a hypey sales push.

Machine-generated drafts also follow `content/blog_style.md` and the requirements in `scripts/generate_blog_post.py`; this document is the reference for **BudgetPlan** naming, **absolute** asset URLs, linking, SEO shape, and EU-safe external citations.
