const { test, expect } = require('@playwright/test');

test.describe('Landing page mobile layout', () => {
  test('hero phone stack is removed on narrow phones to avoid dead vertical space', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html');

    const stack = page.getByTestId('phone-stack');
    const isHidden = await stack.evaluate((el) => window.getComputedStyle(el).display === 'none');
    const height = await stack.evaluate((el) => el.offsetHeight);
    expect(isHidden).toBe(true);
    expect(height).toBe(0);
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
