#!/usr/bin/env node
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/**
 * Script to run Playwright tests against multiple remote URLs.
 *
 * Usage:
 *   node scripts/test-remote.mjs [options]
 *
 * Options:
 *   --base-url <url>      Base URL (required)
 *   --versions <list>     Comma-separated list of versions (default: v9.4,v9.3,v9.2)
 *   --stop-on-failure     Stop execution if any version fails
 *   --                    Pass remaining args to Playwright
 *
 * Examples:
 *   node scripts/test-remote.mjs --base-url https://maps.elastic.co
 *   node scripts/test-remote.mjs --base-url https://maps-staging.elastic.co --versions v9.4,v9.3
 *   node scripts/test-remote.mjs --base-url https://maps.elastic.co -- --grep "Page loads"
 */

import { execSync } from 'child_process';
import { parseArgs } from 'util';

const { values, positionals } = parseArgs({
  options: {
    'base-url': { type: 'string' },
    versions: { type: 'string', default: 'v9.4,v9.3,v8.19' },
    'stop-on-failure': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
  allowPositionals: true,
  strict: true,
});

if (values.help) {
  console.log(`
Usage: node scripts/test-remote.mjs [options] [-- playwright-args]

Options:
  --base-url <url>      Base URL (required)
  --versions <list>     Comma-separated list of versions (default: v9.4,v9.3,v9.2)
  --stop-on-failure     Stop execution if any version fails
  -h, --help            Show this help message

Examples:
  node scripts/test-remote.mjs --base-url https://maps.elastic.co
  node scripts/test-remote.mjs --base-url https://maps-staging.elastic.co --versions v9.4,v9.3
  node scripts/test-remote.mjs --base-url https://maps.elastic.co -- --grep "Page loads"
  `);
  process.exit(0);
}

if (!values['base-url']) {
  console.error('Error: --base-url is required');
  console.error('Run with --help for usage information');
  process.exit(1);
}

const baseUrl = values['base-url'];
const versions = values.versions.split(',').map((v) => v.trim());
const stopOnFailure = values['stop-on-failure'];
const playwrightArgs = positionals.join(' ');

console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║           EMS Landing Page Remote Tests                      ║');
console.log('╚══════════════════════════════════════════════════════════════╝');
console.log(`Base URL: ${baseUrl}`);
console.log(`Versions: ${versions.join(', ')}`);
console.log(`Stop on failure: ${stopOnFailure}`);
if (playwrightArgs) {
  console.log(`Playwright args: ${playwrightArgs}`);
}
console.log('');

const results = [];

for (const version of versions) {
  const testUrl = `${baseUrl}/${version}`;
  console.log('─'.repeat(64));
  console.log(`Testing: ${testUrl}`);
  console.log('─'.repeat(64));

  const startTime = Date.now();
  let success = false;

  try {
    execSync(`npx playwright test ${playwrightArgs}`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        PLAYWRIGHT_BASE_URL: testUrl,
        PLAYWRIGHT_SKIP_VISUAL_TESTS: 'true',
      },
    });
    success = true;
  } catch {
    success = false;
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  results.push({ version, testUrl, success, duration });

  if (success) {
    console.log(`\n✅ ${version}: PASSED (${duration}s)\n`);
  } else {
    console.log(`\n❌ ${version}: FAILED (${duration}s)\n`);
    if (stopOnFailure) {
      console.log('Stopping due to --stop-on-failure flag');
      break;
    }
  }
}

// Print summary
console.log('\n');
console.log('╔══════════════════════════════════════════════════════════════╗');
console.log('║                        Summary                               ║');
console.log('╚══════════════════════════════════════════════════════════════╝');

const passed = results.filter((r) => r.success).length;
const failed = results.filter((r) => !r.success).length;

for (const result of results) {
  const status = result.success ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${status}  ${result.version.padEnd(10)} (${result.duration}s)`);
}

console.log('─'.repeat(64));
console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
console.log('');

// Exit with error code if any tests failed
process.exit(failed > 0 ? 1 : 0);
