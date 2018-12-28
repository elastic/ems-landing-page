import './main.css';

import React from 'react';
import ReactDOM from 'react-dom';
import URL from 'url-parse';
import 'whatwg-fetch';
import CONFIG from './config.json';
import { App } from './js/components/app';
import { EMSClientV66 } from './js/ems_client';

start();

async function start() {
  const urlTokens = new URL(window.location, true);
  const emsClient = getEmsClient(urlTokens.query.manifest);

  if (!emsClient) {
    console.error(`Cannot load the required manifest for "${urlTokens.query.manifest}"`);
    return;
  }
  const emsLayers = {
    file: await emsClient.getFileLayers(),
    tms: await emsClient.getTMSServices()
  };

  ReactDOM.render(<App layers={emsLayers}/>, document.getElementById('wrapper'));
}


function getEmsClient(deployment) {
  if (!deployment) {
    deployment = CONFIG.default;
  }
  const url = CONFIG.SUPPORTED_EMS.manifest[deployment];
  return (url) ? new EMSClientV66({ manifestServiceUrl: url }) : null;
}

