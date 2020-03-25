/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import './main.css';

import React from 'react';
import ReactDOM from 'react-dom';
import URL from 'url-parse';
import 'whatwg-fetch';
import { version } from '../package.json';
import { App } from './js/components/app';
import { EMSClient } from '@elastic/ems-client';

start();

async function start() {
  const urlTokens = new URL(window.location, true);
  const emsClient = await getEmsClient(urlTokens.query.manifest, urlTokens.query.locale);

  if (!emsClient) {
    console.error(`Cannot load the required manifest for "${urlTokens.query.manifest}"`);
    return;
  }
  const emsLayers = {
    file: await emsClient.getFileLayers(),
    tms: await emsClient.getTMSServices()
  };

  ReactDOM.render(<App client={emsClient} layers={emsLayers} />, document.getElementById('wrapper'));
}

function fetchFunction (...args) {
  return fetch(...args);
}

async function getEmsClient(deployment, locale) {
  let config;
  try {
    const response = await fetch('config.json');
    config = await response.json();
  } catch (e) {
    throw new Error(`Config file is missing or invalid`);
  }
  const manifest = config.SUPPORTED_EMS.manifest.hasOwnProperty(deployment)
    ? config.SUPPORTED_EMS.manifest[deployment]
    : config.SUPPORTED_EMS.manifest[config.default];
  const emsVersion = manifest.hasOwnProperty('emsVersion') ? manifest['emsVersion'] : null;
  const fileApiUrl = manifest.hasOwnProperty('emsFileApiUrl') ? manifest['emsFileApiUrl'] : null;
  const tileApiUrl = manifest.hasOwnProperty('emsTileApiUrl') ? manifest['emsTileApiUrl'] : null;
  const language = locale && config.SUPPORTED_LOCALE.hasOwnProperty(locale.toLowerCase())
    ? locale : null;

  const license = config.license;
  const emsClient = new EMSClient({
    appName: 'ems-landing-page',
    appVersion: version,
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

