import { parse } from 'url';
import { stringify } from 'querystring';

export class ManifestParserV2 {
  constructor(url, license) {
    this._license = license;
    this._url = this._extendUrlWithLicense(url);
  }

  _extendUrlWithLicense(url) {
    if (!this._license) return url;
    const urlObject = parse(url, true);
    const queryParams = Object.assign(
      urlObject.query,
      { license: this._license }
    );
    // We can't use url.format() here because it escapes the template characters (e.g. <x>)
    return urlObject.search
      ? url.replace(urlObject.search, `?${stringify(queryParams)}`)
      : url;
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
    const tilesResponse = await fetch(this._extendUrlWithLicense(tilesMeta.manifest));
    const tilesManifest = await tilesResponse.json();
    // Mutate the service url to include license parameter if available
    for (const service of tilesManifest.services) {
      service.url = this._extendUrlWithLicense(service.url);
    }
    const filesMeta = catalogue.services.find(service => service.type === 'file');
    const filesResponse = await fetch(this._extendUrlWithLicense(filesMeta.manifest));
    const filesManifest = await filesResponse.json();
    // Mutate the vector url to include license parameter if available
    for (const layer of filesManifest.layers) {
      layer.url = this._extendUrlWithLicense(layer.url);
    }

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
