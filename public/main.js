import './main.css';

import React from 'react';
import ReactDOM from 'react-dom';
import URL from 'url-parse';
import 'whatwg-fetch';
import CONFIG from './config.json';
import { App } from './js/components/app';
import { ManifestParserV2 } from './js/manifest_parser_v2';

start();

async function start() {
  const urlTokens = new URL(window.location, true);
  const manifestParser = getManifestParser(urlTokens.query.manifest);

  if (!manifestParser) {
    console.error(`Cannot load the required manifest for "${urlTokens.query.manifest}"`);
    return;
  }
  const emsLayers = await manifestParser.getAllEMSLayers();

  ReactDOM.render(<App layers={emsLayers}/>, document.getElementById('wrapper'));
}


function getManifestParser(deployment) {
  const url = CONFIG.SUPPORTED_EMS.manifest.hasOwnProperty(deployment)
    ? CONFIG.SUPPORTED_EMS.manifest[deployment]
    : CONFIG.SUPPORTED_EMS.manifest[CONFIG.default];
  const license = CONFIG.license || null;
  return (url) ? new ManifestParserV2(url, license) : null;
}

