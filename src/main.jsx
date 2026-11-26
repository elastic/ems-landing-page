/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

// Must run first so process/Buffer exist before @elastic/ems-client (and lru-cache, pseudomap) load
import './polyfills.js';

// Pre-register EUI icons before any components load
import './icon-cache.js';

import './main.css';

import React from 'react';
import { createRoot } from 'react-dom/client';

import URL from 'url-parse';
import 'whatwg-fetch';

import { EMSClient } from '@elastic/ems-client/target/node';

import { App } from './components/app';
import { findBaseStyle } from './components/theme';

const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/;
const DATE_VERSION_REGEX = /^\d{4}-\d{2}-\d{2}$/;

start();

async function start() {
  let config;
  try {
    const response = await fetch('config.json');
    config = await response.json();
  } catch (e) {
    console.error(`Config file is missing or invalid`);
    return;
  }
  const urlTokens = new URL(window.location, true);
  const { manifest, locale, my_app_version: requestedVersion } = urlTokens.query;
  const configVersion = config.SUPPORTED_EMS.emsVersion ?? null;
  const urlVersion = parseEmsVersion(requestedVersion);

  let emsClient;
  let emsLayers;
  if (urlVersion && urlVersion !== configVersion) {
    try {
      emsClient = getEmsClient(config, manifest, locale, urlVersion);
      emsLayers = await loadLayers(emsClient);
    } catch (e) {
      console.warn(
        `Cannot load the manifest for version "${urlVersion}", using "${configVersion}" instead`,
        e,
      );
      emsClient = undefined;
    }
  }
  if (!emsClient) {
    try {
      emsClient = getEmsClient(config, manifest, locale, configVersion);
      emsLayers = await loadLayers(emsClient);
    } catch (e) {
      console.error(`Cannot load the required manifest for "${manifest}"`, e);
      return;
    }
  }
  console.info(`EMS Client ${emsClient._emsVersion} loaded`);

  const serviceName = config.serviceName || 'Elastic Maps Service';
  const container = document.getElementById('wrapper');
  const root = createRoot(container);

  root.render(
    <App client={emsClient} serviceName={serviceName} layers={emsLayers} />,
  );
}

// Returns the value if it is a semver (`9.6.0`) or a date version (`YYYY-MM-DD`), otherwise null
function parseEmsVersion(value) {
  if (typeof value !== 'string') {
    return null;
  }
  const version = value.trim();
  return SEMVER_REGEX.test(version) || DATE_VERSION_REGEX.test(version) ? version : null;
}

async function loadLayers(emsClient) {
  const layers = {
    file: await emsClient.getFileLayers(),
    tms: await emsClient.getTMSServices(),
  };
  // The app cannot render without a basemap for each color mode
  for (const colorMode of ['light', 'dark']) {
    if (!findBaseStyle(layers.tms, colorMode)) {
      throw new Error(`No ${colorMode} basemap found in the ${emsClient._emsVersion} manifest`);
    }
  }
  return layers;
}

function fetchFunction(...args) {
  return fetch(...args);
}

function relativeToAbsolute(url) {
  // convert all link urls to absolute urls
  const a = document.createElement('a');
  a.setAttribute('href', url);
  return a.href;
}

function getEmsClient(config, deployment, locale, emsVersion) {
  const manifest = config.SUPPORTED_EMS.manifest.hasOwnProperty(deployment)
    ? config.SUPPORTED_EMS.manifest[deployment]
    : config.SUPPORTED_EMS.manifest[config.default];
  const fileApiUrl = manifest.hasOwnProperty('emsFileApiUrl')
    ? relativeToAbsolute(manifest['emsFileApiUrl'])
    : null;
  const tileApiUrl = manifest.hasOwnProperty('emsTileApiUrl')
    ? relativeToAbsolute(manifest['emsTileApiUrl'])
    : null;
  const language =
    locale && config.SUPPORTED_LOCALE.hasOwnProperty(locale.toLowerCase()) ? locale : null;

  const license = config.license;
  const emsClient = new EMSClient({
    appName: 'ems-landing-page',
    appVersion: emsVersion,
    fileApiUrl,
    tileApiUrl,
    emsVersion,
    language: language,
    fetchFunction,
  });
  if (license) {
    emsClient.addQueryParams({ license });
  }
  return emsClient;
}
