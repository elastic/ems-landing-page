import React from 'react';
import ReactDOM from 'react-dom';
import URL from 'url-parse';

import CONFIG from './config.json';
import {EMSLanding} from './ems_landing';
import {ManifestParserV2} from './manifest_parser_v2';

console.log(CONFIG);


async function start() {

  const urlTokens = URL(window.location, true);

  console.log(urlTokens);

  const manifestParser = getManifestParser(urlTokens.query.manifest);

  if (!manifestParser) {
    return;
  }


  const catalogue = await manifestParser.getCatalogue();
  console.log(catalogue);


  const emsLanding = ReactDOM.render(<EMSLanding/>, document.getElementById('wrapper'));


}
start();


function getManifestParser(url) {
  const manifestConfig = CONFIG.SUPPORTED_EMS.find((manifestConfig) => {
    return manifestConfig.manifests.indexOf(url) !== -1;
  });
  if (manifestConfig && manifestConfig.version === "v2") {
    return new ManifestParserV2(url);
  }
}


