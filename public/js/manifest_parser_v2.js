export class ManifestParserV2 {

  constructor(url) {
    this._url = url;
  }

  async getCatalogue() {

    let response;
    try {
      response = await fetch(this._url);
    } catch (e) {
      throw e;
    }

    return response;

  }

}

