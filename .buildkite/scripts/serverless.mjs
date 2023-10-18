/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import * as url from "url";
import fs from "fs";
import path from "node:path";
import fetch from "node-fetch";

const MANIFEST_URL =
  process.env.EMS_MANIFEST_URL ||
  "https://tiles.maps.elastic.co/latest/manifest";

const RELEASE_DIR = "../../build/release";

async function main() {
  // Get the latest manifest version
  const response = await fetch(MANIFEST_URL);
  const manifest = await response.json();
  const emsVersion = manifest.version;

  if (emsVersion == undefined) {
    throw new Exception("Version not found in manifest");
  }

  // Patch the released config.json with the serverless version
  const pasePath = url.fileURLToPath(new URL(".", import.meta.url));
  const configFile = path.join(pasePath, RELEASE_DIR, "config.json");
  if (fs.existsSync(configFile) == false) {
    throw new Exception(`Config file not found at ${configFile})}`);
  }
  const config = JSON.parse(fs.readFileSync(configFile));

  const newConfig = {
    ...config,
    SUPPORTED_EMS: {
      ...config.SUPPORTED_EMS,
      emsVersion,
    },
  };
  console.log("Writing a patched config.json file");
  const json = JSON.stringify(newConfig, null, 2);
  fs.writeFileSync(configFile, json);
}

// Async call
(async () => {
  try {
    await main();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
