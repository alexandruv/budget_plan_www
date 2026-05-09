const { test, expect } = require('@playwright/test');

test.describe('Landing page mobile layout', () => {
  test('mobile nav is collapsed by default and toggles open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html');

    const links = page.locator('#nav-links');
    const toggle = page.locator('#nav-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const closed = await links.evaluate((el) => window.getComputedStyle(el).display);
    expect(closed).toBe('none');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const opened = await links.evaluate((el) => window.getComputedStyle(el).display);
    expect(opened).toBe('flex');
  });

  test('hero phone stack remains visible and bounded on narrow phones', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html');

    const stack = page.getByTestId('phone-stack');
    const box = await stack.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThan(300);
    expect(box.width).toBeLessThanOrEqual(340);
    expect(box.height).toBeGreaterThan(200);
    expect(box.height).toBeLessThanOrEqual(260);
  });

  test('hero phone stack stays bounded on small-tablet width', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1080 });
    await page.goto('/index.html');

    const stack = page.getByTestId('phone-stack');
    await stack.scrollIntoViewIfNeeded();

    const height = await stack.evaluate((el) => el.offsetHeight);
    expect(height).toBeGreaterThan(100);
    expect(height).toBeLessThanOrEqual(320);
  });
});
