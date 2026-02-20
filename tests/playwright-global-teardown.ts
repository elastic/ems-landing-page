/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 *
 * Runs after all tests and reporters have finished. Prints the browser console/error
 * log written by the spec so it appears last (after the final test line and "N passed").
 */
import * as fs from 'fs';
import * as path from 'path';

const BROWSER_LOGS_FILE = path.join(process.cwd(), 'test-results', 'playwright-browser-logs.json');

export default async function globalTeardown() {
  if (!fs.existsSync(BROWSER_LOGS_FILE)) return;
  try {
    const raw = fs.readFileSync(BROWSER_LOGS_FILE, 'utf8');
    const allBrowserLogs: { title: string; entries: string[] }[] = JSON.parse(raw);
    if (!allBrowserLogs.length) return;
    const border = '========================';
    process.stdout.write('\n' + border + ' \n  Tests browser output\n' + border + '\n');
    for (const { title, entries } of allBrowserLogs) {
      process.stdout.write('\n' + border + '\nTest: ' + title + '\n' + border + '\n');
      for (const line of entries) {
        process.stdout.write('  ' + line + '\n');
      }
    }
    process.stdout.write('\n' + border + '\n\n');
  } finally {
    try {
      fs.unlinkSync(BROWSER_LOGS_FILE);
    } catch {
      // ignore
    }
  }
}
