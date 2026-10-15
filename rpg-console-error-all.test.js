const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8765';

// Errors that are expected in test environment (no API keys, CORS, etc.)
const EXPECTED_ERRORS = [
  /CORS policy/,
  /Access-Control-Allow-Origin/,
  /ERR_FAILED/,
  /Failed to load resource/,
  /fetch.*failed/i,
  /network.*error/i,
];

function isExpectedError(error) {
  return EXPECTED_ERRORS.some(pattern => pattern.test(error));
}

const VIEWPORTS = [
  { name: 'mobile-360-ltr', width: 360, height: 640, locale: 'en-US', rtl: false },
  { name: 'mobile-390-ltr', width: 390, height: 844, locale: 'en-US', rtl: false },
  { name: 'mobile-360-rtl', width: 360, height: 640, locale: 'ar-SA', rtl: true },
  { name: 'mobile-390-rtl', width: 390, height: 844, locale: 'ar-SA', rtl: true },
];

for (const viewport of VIEWPORTS) {
  test.describe(`Console Error Check - ${viewport.name}`, () => {
    test.use({ 
      viewport: { width: viewport.width, height: viewport.height },
      locale: viewport.locale,
      colorScheme: 'dark'
    });

    test('should have no unexpected JavaScript errors', async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (!isExpectedError(text)) {
            errors.push(text);
          }
        }
      });
      page.on('pageerror', error => {
        const text = error.message;
        if (!isExpectedError(text)) {
          errors.push(text);
        }
      });
      
      await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
      
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneReady === '1';
      }, { timeout: 30000 });
      
      // Create world and interact
      await page.fill('#seven-rpg-world-name', 'Test');
      await page.click('#seven-rpg-create-world');
      await page.waitForFunction(() => {
        return document.documentElement.dataset.sevenStandaloneWorldCreated === '1';
      }, { timeout: 10000 });
      
      await page.click('#seven-rpg-world-button');
      await page.click('#seven-rpg-model-control');
      await page.keyboard.press('Escape');
      
      // Report all errors
      if (errors.length > 0) {
        console.log(`\n=== UNEXPECTED JAVASCRIPT ERRORS (${viewport.name}) ===`);
        for (const err of errors) {
          console.log(err);
        }
      } else {
        console.log(`\n=== NO UNEXPECTED JAVASCRIPT ERRORS (${viewport.name}) ===`);
      }
      
      // Fail if there are unexpected errors
      expect(errors.length).toBe(0);
    });
  });
}