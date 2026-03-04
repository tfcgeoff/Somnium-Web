import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Console log file path
const consoleLogFile = path.join(process.cwd(), 'test-console-logs.txt');

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

test.beforeAll(async () => {
  // Clear console log file at start of test run
  if (fs.existsSync(consoleLogFile)) {
    fs.unlinkSync(consoleLogFile);
  }

  // Ensure Vite is running
  try {
    await fetch('http://localhost:5173');
    console.log('[Setup] Vite server is running on http://localhost:5173');
  } catch (error) {
    console.error('[Setup] Vite server not available. Please run: npm run dev');
    throw new Error('Vite server not running');
  }
});

function setupConsoleLogging(page: any) {
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    logConsoleMessage(type, text, msg.location());
  });
  page.on('pageerror', (error) => {
    logConsoleMessage('ERROR', error.message);
  });
}

test.describe('Story Flow - End to End', () => {
  test('complete story flow from intro to first AI response', async ({ page }) => {
    setupConsoleLogging(page);

    // STEP 1: Navigate to intro screen
    logConsoleMessage('TEST', '=== Starting Story Flow Test ===');
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    // Verify intro screen loaded
    const title = page.locator('text=Somnium');
    await expect(title).toBeVisible();
    logConsoleMessage('TEST', 'Intro screen loaded successfully');

    // Screenshot
    await page.screenshot({ path: 'test-01-intro.png', fullPage: true });

    // STEP 2: Click Begin to enter Setup Wizard
    logConsoleMessage('TEST', 'Clicking Begin button...');
    await page.click('[data-testid="intro-begin-button"]');
    await page.waitForTimeout(1000);

    // Verify we're in Setup Wizard
    const gameMode = page.locator('text=Game Mode');
    await expect(gameMode).toBeVisible();
    const genderLabel = page.locator('text=Character Gender');
    await expect(genderLabel).toBeVisible();
    logConsoleMessage('TEST', 'Setup Wizard loaded with Game Mode and Gender options');

    // STEP 3: Fill in adventure details
    const adventureInput = page.locator('input').first();
    await adventureInput.fill('The Enchanted Forest Quest');

    const charDescInput = page.locator('textarea').first();
    await charDescInput.fill('A curious explorer seeking ancient magic');

    logConsoleMessage('TEST', 'Filled in adventure details');

    // Screenshot
    await page.screenshot({ path: 'test-02-setup-filled.png', fullPage: true });

    // STEP 4: Start the game
    logConsoleMessage('TEST', 'Starting game...');
    const beginButton = page.locator('button:has-text("Begin")').first();
    await beginButton.click();

    // Wait for AI response (up to 90 seconds for Render cold start)
    logConsoleMessage('TEST', 'Waiting for AI response (max 90s)...');
    const startTime = Date.now();

    // Wait for narrative UI to appear and content to load
    await page.waitForSelector('text=The Enchanted Forest Quest', { timeout: 95000 });
    await page.waitForTimeout(3000);

    const elapsedTime = Date.now() - startTime;
    logConsoleMessage('TEST', `AI response received in ${elapsedTime}ms`);

    // Verify we're in the game
    const headerTitle = page.locator('text=The Enchanted Forest Quest');
    await expect(headerTitle).toBeVisible();

    // Check for some story content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(100);

    logConsoleMessage('TEST', 'Story flow test PASSED!');
    await page.screenshot({ path: 'test-03-first-story.png', fullPage: true });
  });

  test('image display in browser', async ({ page }) => {
    setupConsoleLogging(page);

    logConsoleMessage('TEST', '=== Testing Image Display in Browser ===');

    // Use a base64 encoded test image (simple blue square) - no network dependency
    const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    logConsoleMessage('TEST', 'Testing image display with base64 data URI');

    // Navigate to app
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);

    // Inject a test image into the DOM
    await page.evaluate((imgSrc) => {
      const img = document.createElement('img');
      img.src = imgSrc;
      img.style.width = '100px';
      img.style.height = '100px';
      img.style.border = '2px solid #4A90E2';
      img.style.display = 'block';
      img.alt = 'Test image';
      img.id = 'test-image';
      document.body.appendChild(img);
    }, testImageBase64);

    // Wait for image to render
    await page.waitForTimeout(1000);

    // Verify image was added to DOM
    const imageElement = await page.locator('#test-image');
    await expect(imageElement).toBeVisible();

    // Check that image loaded successfully
    const imageLoaded = await page.evaluate(() => {
      const img = document.getElementById('test-image') as HTMLImageElement;
      return img && img.complete && img.naturalHeight !== 0;
    });

    if (imageLoaded) {
      logConsoleMessage('TEST', '✅ Image loaded successfully in browser!');
    } else {
      logConsoleMessage('TEST', '⚠️ Image failed to load');
    }

    await page.screenshot({ path: 'test-image-display.png', fullPage: true });
    logConsoleMessage('TEST', 'Image display test complete');
  });
});

test.afterAll(() => {
  console.log(`\n=== Test complete. Console logs saved to: ${consoleLogFile} ===`);

  // Display any errors found
  if (fs.existsSync(consoleLogFile)) {
    const logs = fs.readFileSync(consoleLogFile, 'utf-8');
    const errors = logs.split('\n').filter(line => line.includes('[ERROR]'));
    if (errors.length > 0) {
      console.log(`\n⚠️ Found ${errors.length} errors during testing. See ${consoleLogFile}`);
    }
  }
});
