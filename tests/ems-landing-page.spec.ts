/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { test, expect } from '@playwright/test';

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
    const darkMap = 'Dark';
    await page.getByRole('button', { name: classicMap, exact: true }).click();
    await page.getByRole('button', { name: darkMap }).click();

    await expect(page).toHaveScreenshot('ems-landing-page-dark.png');
  });

  test('Load a dataset', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Brazil States' }).click();

    await page.getByText('BR-AM').click();
    await expect(page.locator('.maplibregl-popup-content')).toBeVisible();
    await expect(page.locator('dl')).toContainText('BR-AM');

    // Wait for the map to finish animating to the feature location
    await page.evaluate(() => {
      return new Promise<void>((resolve) => {
        document.querySelector('.mapContainer')
          ?.addEventListener('map:idle', () => resolve(), { once: true });
      });
    });

    await expect(page).toHaveScreenshot('ems-landing-page-load-data.png');
  });
});
