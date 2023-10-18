/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import './main.css';

import React from 'react';
import ReactDOM from 'react-dom';
import URL from 'url-parse';
import 'whatwg-fetch';
import { version } from '../package.json';
import { App } from './js/components/app';
import { EMSClient } from '@elastic/ems-client/target/node';

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
  const emsClient = await getEmsClient(config, urlTokens.query.manifest, urlTokens.query.locale);

  if (!emsClient) {
    console.error(`Cannot load the required manifest for "${urlTokens.query.manifest}"`);
    return;
  } else {
    console.info(`EMS Client ${emsClient._emsVersion} loaded`);
  } 
  const emsLayers = {
    file: await emsClient.getFileLayers(),
    tms: await emsClient.getTMSServices(),
  };

  const serviceName = config.serviceName || 'Elastic Maps Service';

  ReactDOM.render(
    <App client={emsClient} serviceName={serviceName} layers={emsLayers} />,
    document.getElementById('wrapper')
  );
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

async function getEmsClient(config, deployment, locale) {
  const emsVersion = config.SUPPORTED_EMS.hasOwnProperty('emsVersion') ? config.SUPPORTED_EMS['emsVersion'] : null;
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
