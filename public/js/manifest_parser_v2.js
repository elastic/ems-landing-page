/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

export class ManifestParserV2 {
  constructor(url) {
    this._url = url;
  }

  async getCatalogue() {
    let response;
    try {
      response = await fetch(this._url);
      return response.json();
    } catch (e) {
      throw e;
    }
  }

  async getAllEMSLayers() {
    const catalogue = await this.getCatalogue();

    const tilesMeta = catalogue.services.find(service => service.type === 'tms');
    const tilesResponse = await fetch(tilesMeta.manifest);
    const tilesManifest = await tilesResponse.json();

    const filesMeta = catalogue.services.find(service => service.type === 'file');
    const filesResponse = await fetch(filesMeta.manifest);
    const filesManifest = await filesResponse.json();

    return {
      tms: {
        meta: tilesMeta,
        manifest: tilesManifest,
      },
      file: {
        meta: filesMeta,
        manifest: filesManifest,
      },
    };
  }
}
