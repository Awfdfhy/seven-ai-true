const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'http://localhost:8765';
const SCREENSHOT_DIR = path.join(__dirname, 'playwright-screenshots');

// Ensure screenshot directory exists
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Viewport configurations
const VIEWPORTS = [
  { name: 'mobile-360-ltr', width: 360, height: 640, locale: 'en-US', rtl: false },
  { name: 'mobile-390-ltr', width: 390, height: 844, locale: 'en-US', rtl: false },
  { name: 'mobile-360-rtl', width: 360, height: 640, locale: 'ar-SA', rtl: true },
  { name: 'mobile-390-rtl', width: 390, height: 844, locale: 'ar-SA', rtl: true },
];

// Helper to capture console errors
function captureConsoleErrors(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  return errors;
}

// Helper to check for horizontal overflow
async function checkHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth > doc.clientWidth;
  });
  return overflow;
}

// Helper to take screenshot with timestamp
async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${name}-${timestamp}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`Screenshot saved: ${filepath}`);
  return filepath;
}

for (const viewport of VIEWPORTS) {
  test.describe(`Seven RPG UI - ${viewport.name}`, () => {
    test.use({ 
      viewport: { width: viewport.width, height: viewport.height },
      locale: viewport.locale,
      colorScheme: 'dark'
    });

    let consoleErrors = [];

    test.beforeEach(async ({ page }) => {
      consoleErrors = captureConsoleErrors(page);
      
      // Set RTL if needed
      if (viewport.rtl) {
        await page.addInitScript(() => {
          document.documentElement.dir = 'rtl';
          document.documentElement.lang = 'ar-SA';
          document.body.dir = 'rtl';
        });
      }
    });

    test.afterEach(async ({ page }, testInfo) => {
      // Take screenshot on failure
      if (testInfo.status !== testInfo.expectedStatus) {
        await takeScreenshot(page, `FAIL-${viewport.name}-${testInfo.title}`);
      }
    });

    test('should load RPG interface and show RPG title', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      
      // Wait for RPG workspace to be ready
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneProfile === 'rpg' &&
               document.documentElement.dataset.sevenStandaloneReady === '1' &&
               window.SevenWorkspaces &&
               SevenWorkspaces.active() === 'rpg';
      }, { timeout: 30000 });
      
      // Check title
      await expect(page).toHaveTitle('Seven RPG');
      
      // Check chat bar exists
      const chatBar = page.locator('.seven-rpg-chatbar');
      await expect(chatBar).toBeVisible();
      
      // Take baseline screenshot
      await takeScreenshot(page, `baseline-${viewport.name}`);
    });

    test('should not have horizontal overflow', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneReady === '1';
      }, { timeout: 30000 });
      
      const overflow = await checkHorizontalOverflow(page);
      expect(overflow).toBeFalsy();
    });

    test('should show first-run world creation panel', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneReady === '1';
      }, { timeout: 30000 });
      
      // First-run panel should be visible
      const firstRun = page.locator('#seven-rpg-first-run');
      await expect(firstRun).toBeVisible();
      
      // Check for world name input
      const worldNameInput = page.locator('#seven-rpg-world-name');
      await expect(worldNameInput).toBeVisible();
      
      // Check for create world button
      const createButton = page.locator('#seven-rpg-create-world');
      await expect(createButton).toBeVisible();
      
      await takeScreenshot(page, `first-run-${viewport.name}`);
    });

    test('should create world and populate input', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneReady === '1';
      }, { timeout: 30000 });
      
      // Fill world name
      await page.fill('#seven-rpg-world-name', 'Test World');
      
      // Click create world
      await page.click('#seven-rpg-create-world');
      
      // Wait for world creation to complete
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneWorldCreated === '1';
      }, { timeout: 10000 });
      
      // Check that user input is populated with the starter prompt
      const userInput = page.locator('#userInput');
      await expect(userInput).toBeVisible();
      
      const inputValue = await userInput.inputValue();
      expect(inputValue).toContain('Test World');
      expect(inputValue).toContain('Never invent dialogue');
      
      await takeScreenshot(page, `world-created-${viewport.name}`);
    });

    test('should open World Panel and show export/import', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneReady === '1';
      }, { timeout: 30000 });
      
      // Create a world first
      await page.fill('#seven-rpg-world-name', 'Test World');
      await page.click('#seven-rpg-create-world');
      
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneWorldCreated === '1';
      }, { timeout: 10000 });
      
      // Click World button
      const worldButton = page.locator('#seven-rpg-world-button');
      await expect(worldButton).toBeVisible();
      await worldButton.click();
      
      // Check panel is visible
      const worldPanel = page.locator('#seven-rpg-world-panel');
      await expect(worldPanel).not.toBeHidden();
      
      // Check export button
      const exportButton = page.locator('#seven-rpg-export-world');
      await expect(exportButton).toBeVisible();
      await expect(exportButton).toBeEnabled();
      
      // Check import input
      const importInput = page.locator('#seven-rpg-import-world');
      await expect(importInput).toBeVisible();
      
      await takeScreenshot(page, `world-panel-${viewport.name}`);
    });

    test('should open Model Picker', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneReady === '1';
      }, { timeout: 30000 });
      
      // Create a world first
      await page.fill('#seven-rpg-world-name', 'Test World');
      await page.click('#seven-rpg-create-world');
      
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneWorldCreated === '1';
      }, { timeout: 10000 });
      
      // Click Model button
      const modelButton = page.locator('#seven-rpg-model-control');
      await expect(modelButton).toBeVisible();
      await modelButton.click();
      
      // Check settings modal opens
      const settingsModal = page.locator('#settingsModal');
      await expect(settingsModal).toBeVisible();
      
      // Check model select is enabled
      const modelSelect = page.locator('#modelSelect');
      await expect(modelSelect).not.toBeDisabled();
      
      await takeScreenshot(page, `model-picker-${viewport.name}`);
      
      // Close modal
      await page.keyboard.press('Escape');
    });

    test('should export world backup', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneReady === '1';
      }, { timeout: 30000 });
      
      // Create a world first
      await page.fill('#seven-rpg-world-name', 'Test World');
      await page.click('#seven-rpg-create-world');
      
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneWorldCreated === '1';
      }, { timeout: 10000 });
      
      // Open World Panel
      await page.click('#seven-rpg-world-button');
      
      // Click export
      const exportButton = page.locator('#seven-rpg-export-world');
      await exportButton.click();
      
      // Check status message
      const status = page.locator('#seven-rpg-world-backup-status');
      await expect(status).toContainText('Backup exported');
      
      await takeScreenshot(page, `export-${viewport.name}`);
    });

    test('should reject invalid backup import', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneReady === '1';
      }, { timeout: 30000 });
      
      // Create a world first
      await page.fill('#seven-rpg-world-name', 'Test World');
      await page.click('#seven-rpg-create-world');
      
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneWorldCreated === '1';
      }, { timeout: 10000 });
      
      // Open World Panel
      await page.click('#seven-rpg-world-button');
      
      // Try to import invalid JSON
      await page.evaluate(() => {
        const picker = document.querySelector('#seven-rpg-import-world');
        const file = new File(['{invalid-json'],'broken.json',{type:'application/json'});
        const dt = new DataTransfer();
        dt.items.add(file);
        Object.defineProperty(picker, 'files', {configurable:true, value:dt.files});
        picker.dispatchEvent(new Event('change', {bubbles:true}));
      });
      
      // Check error message
      const status = page.locator('#seven-rpg-world-backup-status');
      await expect(status).toContainText('Import failed');
      
      await takeScreenshot(page, `invalid-import-${viewport.name}`);
    });

    test('should persist world after reload', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneReady === '1';
      }, { timeout: 30000 });
      
      // Create a world
      await page.fill('#seven-rpg-world-name', 'Persistent World');
      await page.click('#seven-rpg-create-world');
      
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneWorldCreated === '1';
      }, { timeout: 10000 });
      
      // Reload page
      await page.reload({ waitUntil: 'networkidle' });
      
      // Wait for RPG to be ready again
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneReady === '1';
      }, { timeout: 30000 });
      
      // Check first-run panel is NOT shown (world persisted)
      const firstRun = page.locator('#seven-rpg-first-run');
      await expect(firstRun).not.toBeVisible();
      
      // Check world panel shows the world
      await page.click('#seven-rpg-world-button');
      const heading = page.locator('#seven-rpg-world-heading');
      await expect(heading).toContainText('Persistent World');
      
      await takeScreenshot(page, `persist-${viewport.name}`);
    });
  });
}

// Console errors are tested separately in rpg-console-error-all.test.js
// This avoids issues with testing multiple viewports in a single test context