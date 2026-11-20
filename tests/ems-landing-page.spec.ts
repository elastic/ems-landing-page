/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import * as fs from 'fs';
import * as path from 'path';
import { test, expect } from '@playwright/test';

const BROWSER_LOGS_FILE = path.join(process.cwd(), 'test-results', 'playwright-browser-logs.json');

// Skip visual tests when testing against remote/staging URLs
const skipVisualTests = !!process.env.PLAYWRIGHT_SKIP_VISUAL_TESTS;

// Log browser console/errors only in CI or when PLAYWRIGHT_VERBOSE=1 (reduces verbosity by default)
const logBrowserConsole = !!process.env.CI || process.env.PLAYWRIGHT_VERBOSE === '1';

// Collected browser log for the current test (accumulated until afterAll)
let currentTestBrowserLog: { title: string; entries: string[] } | null = null;
// All test logs, printed in one go in afterAll
const allBrowserLogs: { title: string; entries: string[] }[] = [];
// Cleanup for the current test's page listeners (so late events don't leak into the next test)
let removeBrowserLogListeners: (() => void) | null = null;

/**
 * Attach listeners to collect browser console/errors for the current test.
 * Entries are printed in afterAll in one block (after all tests finish).
 * Returns a cleanup function so we can remove listeners in afterEach and avoid async leakage.
 */
function attachBrowserErrorLogging(page: import('@playwright/test').Page, testTitle: string): () => void {
  if (!logBrowserConsole) return () => {};
  currentTestBrowserLog = { title: testTitle, entries: [] };
  const lines = currentTestBrowserLog.entries;

  const onPageError = (err: Error) => {
    lines.push('[browser pageerror] ' + err.message);
    if (err.stack) lines.push(err.stack);
  };
  const onConsole = (msg: import('@playwright/test').ConsoleMessage) => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      lines.push('🛑 ' + text);
    } else if (type === 'warning') {
      lines.push('⚠️ ' + text);
    }
  };

  page.on('pageerror', onPageError);
  page.on('console', onConsole);

  return () => {
    page.off('pageerror', onPageError);
    page.off('console', onConsole);
  };
}

function saveBrowserLogForTest() {
  if (!logBrowserConsole || !currentTestBrowserLog?.entries.length) {
    currentTestBrowserLog = null;
    return;
  }
  allBrowserLogs.push(currentTestBrowserLog);
  currentTestBrowserLog = null;
}

function flushAllBrowserLogs() {
  if (!logBrowserConsole || !allBrowserLogs.length) return;
  try {
    const dir = path.dirname(BROWSER_LOGS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BROWSER_LOGS_FILE, JSON.stringify(allBrowserLogs), 'utf8');
  } finally {
    allBrowserLogs.length = 0;
  }
}

// Helper to wait for map idle with timeout fallback for older versions.
// Checks the data-map-idle attribute first so we don't miss events that
// already fired before the listener was attached.
async function waitForMapIdle(page: import('@playwright/test').Page, timeoutInMs: number = 5000) {
  await page.evaluate((timeoutMs) => {
    return new Promise<void>((resolve, reject) => {
      const mapContainer = document.querySelector('.mapContainer');
      if (!mapContainer) {
        reject(new Error('Map container element not found'));
        return;
      }

      if (mapContainer.hasAttribute('data-map-idle')) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        console.warn('map:idle event not received within timeout');
        resolve();
      }, timeoutMs);

      mapContainer.addEventListener('map:idle', () => {
        clearTimeout(timeout);
        resolve();
      }, { once: true });
    });
  }, timeoutInMs);
}

test.describe('EMS Landing Page', () => {

  test.beforeEach(async ({ page }, testInfo) => {
    removeBrowserLogListeners = attachBrowserErrorLogging(page, testInfo.title);
  });

  test.afterEach(() => {
    removeBrowserLogListeners?.();
    removeBrowserLogListeners = null;
    saveBrowserLogForTest();
  });

  test.afterAll(() => {
    flushAllBrowserLogs();
  });

  test('Page loads successfully', async ({ page }) => {
    const response = await page.goto('./');

    expect(response?.status()).toBe(200);
  });

  test('Has title', async ({ page }) => {
    await page.goto('./');
    await expect(page).toHaveTitle(/Elastic Maps Service/i);
  });

  test('Has header logo with service name', async ({ page }) => {
    await page.goto('./');
    const header = page.locator('.euiHeaderLogo__text');
    await expect(header).toBeVisible();
    await expect(header).toHaveText('Elastic Maps Service');
  });

  test('Visual comparison of the initial full page', async ({ page }) => {
    test.skip(skipVisualTests, 'Visual tests skipped for remote/staging URLs');

    await page.goto('./');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Full page screenshot comparison
    await expect(page).toHaveScreenshot('ems-landing-page-base.png', {
      fullPage: true,
    });
  });
  
  test('Switch between basemaps', async ({ page }) => {
    await page.goto('./');
    await expect(page.getByLabel('Map', { exact: true })).toBeVisible();

    const classicMap = 'Classic';
    const darkMap = /^Dark( Blue)?$/;
    await page.getByRole('button', { name: classicMap, exact: true }).click();
    await page.getByRole('button', { name: darkMap }).click();

    if (!skipVisualTests) {
      await expect(page).toHaveScreenshot('ems-landing-page-dark-blue.png');
    }
  });

  test('Load a dataset', async ({ page }) => {
    await page.goto('./');
    await page.getByRole('button', { name: 'Brazil States' }).click();

    await page.getByText('BR-AM').click();
    await expect(page.locator('.maplibregl-popup-content')).toBeVisible();
    await expect(page.locator('dl')).toContainText('BR-AM');

    // Wait for the map to finish animating to the feature location
    await waitForMapIdle(page);

    if (!skipVisualTests) {
      await expect(page).toHaveScreenshot('ems-landing-page-load-data.png');
    }
  });

  test('Change basemap language', async ({ page }) => {
    await page.goto('./');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // First, load the China Provinces dataset for a more distinctive visual
    await page.getByRole('button', { name: 'China Provinces' }).click();

    // Wait for the map to finish animating to the China location
    await waitForMapIdle(page);

    // Find the language selector combobox
    const languageCombobox = page.getByRole('combobox', { name: 'Select language' });
    await expect(languageCombobox).toBeVisible();

    // Click on the combobox input to focus it and open the dropdown
    await languageCombobox.click();

    // Wait for the listbox to appear
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    
    // Type to filter to Chinese - this will narrow the options
    await languageCombobox.fill('简体');
    
    // Wait for the filtered option to appear and press Enter to select it
    await expect(listbox.getByRole('option')).toHaveCount(1);
    await languageCombobox.press('Enter');

    // Verify the selection changed
    await expect(languageCombobox).toHaveValue('简体中文');

    // Wait for the map to update with the new language
    await waitForMapIdle(page);

    // Take a full page screenshot for visual comparison
    if (!skipVisualTests) {
      await expect(page).toHaveScreenshot('ems-landing-page-chinese-language.png', {
        fullPage: true,
      });
    }
  });

  test('Apply color filter to basemap', async ({ page }) => {
    await page.goto('./');
    await page.waitForLoadState('networkidle');

    // Find and click the color picker input to open the popover
    const colorPickerInput = page.getByRole('textbox', { name: /pick a color|color options/i });
    await expect(colorPickerInput).toBeVisible();
    await colorPickerInput.click();

    // Wait for the color picker popover to appear and select a color swatch
    // The swatches are buttons with names like "Select #16C5C0 as the color"
    const colorSwatch = page.getByRole('button', { name: /Select #.+ as the color/ }).first();
    await expect(colorSwatch).toBeVisible();

    // Click on the color swatch to apply a color filter
    await colorSwatch.click();

    // Close the popover by pressing Escape
    await page.keyboard.press('Escape');

    // Wait for the map to update with the color filter
    await waitForMapIdle(page, 10000);

    // Take a screenshot to verify the color filter is applied
    if (!skipVisualTests) {
      await expect(page).toHaveScreenshot('ems-landing-page-color-filter.png');
    }
  });

  test.describe('Manifest version URL parameter', () => {
    /** Collects the version path segment of every file manifest request. */
    function trackManifestVersions(page: import('@playwright/test').Page) {
      const versions: string[] = [];
      page.on('request', (request) => {
        const match = new URL(request.url()).pathname.match(/\/([^/]+)\/manifest$/);
        if (match && request.url().includes('vector')) versions.push(match[1]);
      });
      return versions;
    }

    test('Valid semver version requests the matching minor manifest', async ({ page }) => {
      const versions = trackManifestVersions(page);
      await page.goto('./?my_app_version=9.5.0');
      await expect(page.getByRole('button', { name: 'Brazil States' })).toBeVisible();
      expect(versions).toContain('v9.5');
    });

    test('Date version requests the manifest for that date', async ({ page }) => {
      const versions = trackManifestVersions(page);
      await page.goto('./?my_app_version=2024-01-01');
      await expect(page.getByRole('button', { name: 'Brazil States' })).toBeVisible();
      // Date versions resolve to the latest manifest
      expect(versions).toContain('latest');
    });

    // Basemap names and datasets differ between manifests:
    // - the pre-9.0 basemaps were renamed in 8.0 and the "blue" ones were added in 9.0
    // - "Spain Autonomous Communities" was added to the file manifest in 8.0
    const renderedVersions = [
      {
        version: '7.17.0',
        manifest: 'v7.17',
        basemaps: ['Road map', 'Road map - desaturated', 'Road map - dark'],
        hasSpainAutonomousCommunities: false,
      },
      {
        version: '8.19.4',
        manifest: 'v8.19',
        basemaps: ['Classic', 'Light', 'Dark'],
        hasSpainAutonomousCommunities: true,
      },
      {
        version: '9.6.0',
        manifest: 'v9.6',
        basemaps: ['Classic', 'Light', 'Dark', 'Light blue', 'Dark blue'],
        hasSpainAutonomousCommunities: true,
      },
    ];

    for (const { version, manifest, basemaps, hasSpainAutonomousCommunities } of renderedVersions) {
      test(`Renders the basemaps and datasets of ${version}`, async ({ page }) => {
        const versions = trackManifestVersions(page);
        await page.goto(`./?my_app_version=${version}`);
        await expect(page.getByRole('button', { name: 'Brazil States' })).toBeVisible();

        const allBasemaps = new Set(renderedVersions.flatMap((v) => v.basemaps));
        for (const name of allBasemaps) {
          await expect(page.getByRole('button', { name, exact: true })).toHaveCount(
            basemaps.includes(name) ? 1 : 0,
          );
        }
        await expect(
          page.getByRole('button', { name: 'Spain Autonomous Communities' }),
        ).toHaveCount(hasSpainAutonomousCommunities ? 1 : 0);
        // No fallback to the default version
        expect(versions).toEqual([manifest]);
      });
    }

    test('Invalid value is ignored', async ({ page }) => {
      const versions = trackManifestVersions(page);
      await page.goto('./?my_app_version=not-a-version');
      await expect(page.getByRole('button', { name: 'Brazil States' })).toBeVisible();
      expect(versions).toEqual(['latest']);
    });

    test('Version without a manifest falls back to the default version', async ({ page }) => {
      const versions = trackManifestVersions(page);
      await page.route('**/v99.9/manifest*', (route) => route.fulfill({ status: 404 }));
      await page.goto('./?my_app_version=99.9.0');
      await expect(page.getByRole('button', { name: 'Brazil States' })).toBeVisible();
      expect(versions).toEqual(['v99.9', 'latest']);
    });
  });
});
