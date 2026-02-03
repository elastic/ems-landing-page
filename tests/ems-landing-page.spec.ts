/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { test, expect } from '@playwright/test';

// Skip visual tests when testing against remote/staging URLs
const skipVisualTests = !!process.env.PLAYWRIGHT_SKIP_VISUAL_TESTS;

test.describe('EMS Landing Page', () => {

  test('Page loads successfully', async ({ page }) => {
    const response = await page.goto('/');

    expect(response?.status()).toBe(200);
  });

  test('Has title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Elastic Maps Service/i);
  });

  test('Visual comparison of the initial full page', async ({ page }) => {
    test.skip(skipVisualTests, 'Visual tests skipped for remote/staging URLs');

    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');

    // Full page screenshot comparison
    await expect(page).toHaveScreenshot('ems-landing-page-base.png', {
      fullPage: true,
    });
  });
  
  test('Switch between basemaps', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByLabel('Map', { exact: true })).toBeVisible();

    const classicMap = 'Classic';
    const darkMap = 'Dark Blue';
    await page.getByRole('button', { name: classicMap, exact: true }).click();
    await page.getByRole('button', { name: darkMap }).click();

    if (!skipVisualTests) {
      await expect(page).toHaveScreenshot('ems-landing-page-dark-blue.png');
    }
  });

  test('Load a dataset', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Brazil States' }).click();

    await page.getByText('BR-AM').click();
    await expect(page.locator('.maplibregl-popup-content')).toBeVisible();
    await expect(page.locator('dl')).toContainText('BR-AM');

    // Wait for the map to finish animating to the feature location
    await page.evaluate(() => {
      return new Promise<void>((resolve, reject) => {
        const mapContainer = document.querySelector('.mapContainer');
        if (!mapContainer) {
          reject(new Error('Map container element not found'));
          return;
        }

        const timeout = setTimeout(() => {
          console.warn('map:idle event not received - this version may not support it');
          resolve();
        }, 5000);

        mapContainer.addEventListener('map:idle', () => {
          clearTimeout(timeout);
          resolve();
        }, { once: true });
      });
    });

    if (!skipVisualTests) {
      await expect(page).toHaveScreenshot('ems-landing-page-load-data.png');
    }
  });
});
