import React from 'react';
import ReactDOM from 'react-dom';
import URL from 'url-parse';
import CONFIG from './config.json';
import {App} from './components/app';
import {ManifestParserV2} from './manifest_parser_v2';


start();

async function start() {

  const urlTokens = URL(window.location, true);
  const manifestParser = getManifestParser(urlTokens.query.manifest);

  if (!manifestParser) {
    return;
  }

  const emsLayers = await manifestParser.getAllEMSLayers();

  const emsLanding = ReactDOM.render(<App layers={emsLayers}/>, document.getElementById('wrapper'));


}


function getManifestParser(url) {

  let manifestConfig;

  if (url) {
    manifestConfig = CONFIG.SUPPORTED_EMS.find((manifestConfig) => {
      return manifestConfig.manifests.indexOf(url) !== -1;
    });
  } else {
    //just get first one to test
    manifestConfig = CONFIG.SUPPORTED_EMS.find(manifestConfig => {
      return manifestConfig.version === 'v2';
    });
    url = manifestConfig.manifests[0];
  }


  if (manifestConfig && manifestConfig.version === "v2") {
    return new ManifestParserV2(url);
  }
}


