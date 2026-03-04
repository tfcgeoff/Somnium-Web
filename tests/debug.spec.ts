import { test, expect } from '@playwright/test';

test('debug console errors', async ({ page }) => {
  // Collect all console messages
  const consoleLogs: string[] = [];
  const consoleErrors: string[] = [];

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });

  // Also catch page errors
  page.on('pageerror', error => {
    consoleErrors.push(error.toString());
  });

  // Navigate to the page
  await page.goto('http://localhost:5173');

  // Wait a bit for any async errors
  await page.waitForTimeout(3000);

  // Check the page title
  const title = await page.title();
  console.log('Page title:', title);

  // Check if root element exists
  const root = await page.locator('#root').count();
  console.log('Root element count:', root);

  // Check the body content
  const bodyText = await page.locator('body').textContent();
  console.log('Body text (first 200 chars):', bodyText?.substring(0, 200));

  // Print all console logs
  console.log('=== All Console Logs ===');
  consoleLogs.forEach(log => console.log(log));

  // Print all errors
  console.log('=== Console Errors ===');
  consoleErrors.forEach(err => console.log(err));

  // Assertions
  expect(consoleErrors.length).toBe(0);
  expect(title).toBeTruthy();
});
