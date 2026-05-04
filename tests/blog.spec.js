const { test, expect } = require('@playwright/test');

test.describe('Blog', () => {
  test('landing page exposes the blog in navigation and latest posts', async ({ page }) => {
    await page.goto('/index.html');

    await expect(page.locator('#nav-links').getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog/');
    await expect(page.locator('#blog')).toBeVisible();
    await expect(page.locator('#blog').getByRole('heading', { name: 'Blog' })).toBeVisible();
    await expect(page.locator('#blog').getByRole('link', { name: /Zero-based budgeting without spreadsheets/ })).toHaveAttribute(
      'href',
      'blog/zero-based-budgeting-without-spreadsheets/'
    );
  });

  test('blog index renders available posts', async ({ page }) => {
    await page.goto('/blog/');

    await expect(page).toHaveTitle(/Budget Plan Blog/);
    await expect(page.getByRole('heading', { name: 'Budgeting that respects your time and your privacy.' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Zero-based budgeting without spreadsheets/ })).toBeVisible();
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

  test('blog cards remain readable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/blog/');

    const firstCard = page.getByRole('link', { name: /Zero-based budgeting without spreadsheets/ });
    await expect(firstCard).toBeVisible();

    const gridColumns = await page.locator('.post-grid').evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);
    expect(gridColumns.split(' ').length).toBe(1);
  });
});
