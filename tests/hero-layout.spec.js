const { test, expect } = require('@playwright/test');

test.describe('Landing page mobile layout', () => {
  test('hero phone stack does not reserve a tall empty strip on a typical phone width', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/index.html');

    const stack = page.getByTestId('phone-stack');
    await stack.scrollIntoViewIfNeeded();

    const height = await stack.evaluate((el) => el.offsetHeight);
    expect(height).toBeGreaterThan(80);
    // Fixed-height absolute mockups must stay compact; large values read as a “black gap” above the next section.
    expect(height).toBeLessThanOrEqual(260);
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
