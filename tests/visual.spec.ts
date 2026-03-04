import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Console log file path
const consoleLogFile = path.join(process.cwd(), 'console-logs.txt');

// Helper to log console messages to both console and file
function logConsoleMessage(type: string, text: string, location?: any) {
  const timestamp = new Date().toISOString();
  const loc = location ? ` (${location.url}:${location.lineNumber}:${location.columnNumber})` : '';
  const logMessage = `[${timestamp}] [${type}]${loc} ${text}\n`;

  // Log to terminal
  console.log(`[${type}] ${text}`);

  // Append to file
  fs.appendFileSync(consoleLogFile, logMessage);
}

test.beforeAll(() => {
  // Clear console log file at start of test run
  if (fs.existsSync(consoleLogFile)) {
    fs.unlinkSync(consoleLogFile);
  }
});

test('check intro screen centering', async ({ page }) => {
  // Set up console logging
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    logConsoleMessage(type, text, msg.location());
  });

  // Set up error logging
  page.on('pageerror', (error) => {
    logConsoleMessage('ERROR', error.message);
  });

  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);

  // Take screenshot of intro screen
  await page.screenshot({ path: 'intro-screen.png', fullPage: true });

  // Get page dimensions
  const viewportSize = page.viewportSize();
  console.log('Page size:', viewportSize);

  // Get the title element
  const titleElement = page.locator('text=Somnium').first();
  const titleBox = await titleElement.boundingBox();
  console.log('Title bounding box:', titleBox);

  // Check if title is centered horizontally relative to the page
  if (viewportSize && titleBox) {
    const pageCenterX = viewportSize.width / 2;
    const titleCenterX = titleBox.x + titleBox.width / 2;
    const offsetFromCenter = Math.abs(pageCenterX - titleCenterX);
    const maxOffset = viewportSize.width * 0.05; // 5% tolerance

    expect(offsetFromCenter).toBeLessThan(maxOffset);
    console.log('Title is centered! Page center:', pageCenterX, 'Title center:', titleCenterX, 'Offset:', offsetFromCenter);
  }
});

test.afterAll(() => {
  console.log(`\n=== Console logs saved to: ${consoleLogFile} ===`);
});

test('check setup wizard layout', async ({ page }) => {
  // Set up console logging
  page.on('console', (msg) => {
    logConsoleMessage(msg.type(), msg.text(), msg.location());
  });
  page.on('pageerror', (error) => {
    logConsoleMessage('ERROR', error.message);
  });

  await page.goto('http://localhost:5173');

  // Click the Begin button to go to Setup Wizard
  await page.click('[data-testid="intro-begin-button"]');
  await page.waitForTimeout(1000);

  // Take screenshot of setup wizard
  await page.screenshot({ path: 'setup-wizard.png', fullPage: true });

  // Check that game mode section is visible
  const gameModeText = page.locator('text=Game Mode');
  await expect(gameModeText).toBeVisible();

  console.log('Setup wizard loaded successfully');
});

test('check narrative UI after starting game', async ({ page }) => {
  // Set up console logging
  page.on('console', (msg) => {
    logConsoleMessage(msg.type(), msg.text(), msg.location());
  });
  page.on('pageerror', (error) => {
    logConsoleMessage('ERROR', error.message);
  });

  await page.goto('http://localhost:5173');

  // Click the Begin button to go to Setup Wizard
  await page.click('[data-testid="intro-begin-button"]');
  await page.waitForTimeout(500);

  // Fill in basic game info
  const adventureNameInput = page.locator('input').first();
  await adventureNameInput.fill('Test Adventure');

  // Use keyboard to navigate and fill character name
  await page.keyboard.press('Tab');
  const characterNameInput = page.locator('textarea').first();
  await characterNameInput.fill('A brave hero');

  // Click the Begin button to start the game
  const beginButton = page.locator('button:has-text("Begin")').first();
  await beginButton.click();
  await page.waitForTimeout(5000);

  // Take screenshot of narrative UI
  await page.screenshot({ path: 'narrative-ui.png', fullPage: true });

  // Check if header is visible
  const headerTitle = page.locator('text=Test Adventure');
  const isVisible = await headerTitle.isVisible();
  console.log('Header title visible:', isVisible);

  expect(isVisible).toBe(true);
});
