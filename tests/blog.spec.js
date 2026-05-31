const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function parseFrontMatter(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').trim();
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    throw new Error(`Missing front matter in ${filePath}`);
  }

  return Object.fromEntries(
    match[1]
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const index = line.indexOf(':');
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^"|"$/g, '')];
      })
  );
}

function readyPosts() {
  return fs
    .readdirSync(path.join(ROOT, 'posts'))
    .filter((name) => name.endsWith('.md'))
    .map((name) => parseFrontMatter(path.join(ROOT, 'posts', name)))
    .filter((post) => post.status === 'ready')
    .sort((a, b) => b.date.localeCompare(a.date));
}

const posts = readyPosts();

test.describe('Blog', () => {
  test('landing page exposes the blog in navigation and latest posts', async ({ page }) => {
    await page.goto('/index.html');

    await expect(page.locator('#nav-links').getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog/');
    await expect(page.locator('#blog')).toBeVisible();
    await expect(page.locator('#blog').getByRole('heading', { name: 'Blog' })).toBeVisible();

    for (const post of posts.slice(0, 3)) {
      await expect(page.locator('#blog').getByRole('link', { name: post.title })).toHaveAttribute('href', `blog/${post.slug}/`);
    }
  });

  test('blog index renders available posts', async ({ page }) => {
    await page.goto('/blog/');

    await expect(page).toHaveTitle(/Budget Plan Blog/);
    await expect(page.getByRole('heading', { name: 'Budgeting that respects your time and your privacy.' })).toBeVisible();
    for (const post of posts) {
      await expect(page.getByRole('link', { name: post.title })).toBeVisible();
    }
  });

  test('blog index navigation links to the landing page and blog listing', async ({ page }) => {
    await page.goto('/blog/');
    const nav = page.locator('nav.top .nav-links');

    await expect(page.locator('nav.top .brand')).toHaveAttribute('href', '../index.html');
    await expect(nav.getByRole('link', { name: 'Product' })).toHaveAttribute('href', '../index.html#product');
    await expect(nav.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '../index.html#privacy');
    await expect(nav.getByRole('link', { name: 'Method' })).toHaveAttribute('href', '../index.html#method');
    await expect(nav.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', 'index.html');
  });

  test('blog article navigation links back to landing anchors and blog listing', async ({ page }) => {
    await page.goto('/blog/zero-based-budgeting-without-spreadsheets/');
    const nav = page.locator('nav.top .nav-links');

    await expect(page.locator('nav.top .brand')).toHaveAttribute('href', '../../index.html');
    await expect(nav.getByRole('link', { name: 'Product' })).toHaveAttribute('href', '../../index.html#product');
    await expect(nav.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '../../index.html#privacy');
    await expect(nav.getByRole('link', { name: 'Method' })).toHaveAttribute('href', '../../index.html#method');
    await expect(nav.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '../index.html');

    await nav.getByRole('link', { name: 'Product' }).click();
    await expect(page).toHaveURL(/\/index\.html#product$/);
  });

  test('article page includes metadata and readable content', async ({ page }) => {
    await page.goto('/blog/zero-based-budgeting-without-spreadsheets/');

    await expect(page).toHaveTitle(/Zero-based budgeting without spreadsheets/);
    await expect(page.getByRole('heading', { level: 1, name: 'Zero-based budgeting without spreadsheets' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Start with the money you actually have' })).toBeVisible();

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute(
      'href',
      'https://alexandruv.github.io/budget_plan_www/blog/zero-based-budgeting-without-spreadsheets/'
    );
  });

  test('generated image-first post renders exactly one article image', async ({ page }) => {
    await page.goto('/blog/accurately-track-expenses-daily/');

    await expect(page).toHaveTitle(/Accurately Track Expenses Daily with Budget Plan/);
    await expect(page.getByRole('heading', { level: 1, name: 'Accurately Track Expenses Daily with Budget Plan' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Your Daily Spending Dashboard' })).toBeVisible();

    const articleImages = page.locator('figure.blog-image img');
    await expect(articleImages).toHaveCount(1);
    await expect(articleImages.first()).toHaveAttribute('src', '/blog/assets/accurately-track-expenses-daily.webp');
    await expect(articleImages.first()).toHaveAttribute('alt', /Log Spend/);
  });

  test('blog cards remain readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/blog/');

    const firstCard = page.getByRole('link', { name: posts[0].title });
    await expect(firstCard).toBeVisible();
    await expect(page.getByRole('link', { name: posts[1].title })).toBeVisible();

    const gridColumns = await page.locator('.post-grid').evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);
    expect(gridColumns.split(' ').filter(Boolean).length).toBe(1);
  });
});
