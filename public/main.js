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
import CONFIG from './config.json';
import { App } from './js/components/app';
import { EMSClient } from '@elastic/ems-client';

start();

async function start() {
  const urlTokens = new URL(window.location, true);
  const emsClient = getEmsClient(urlTokens.query.manifest, urlTokens.query.locale);

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

function getEmsClient(deployment, locale) {
  const url = CONFIG.SUPPORTED_EMS.manifest.hasOwnProperty(deployment)
    ? CONFIG.SUPPORTED_EMS.manifest[deployment]
    : CONFIG.SUPPORTED_EMS.manifest[CONFIG.default];
  const language = locale && CONFIG.SUPPORTED_LOCALE.hasOwnProperty(locale.toLowerCase())
    ? locale : null;

  const license = CONFIG.license;
  const emsClient = new EMSClient({ kbnVersion: '7.4.0', manifestServiceUrl: url, language: language, fetchFunction });
  if (license) {
    emsClient.addQueryParams({ license });
  }
  return emsClient;
}

