/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ORIGIN } from './origin';

export class TMSService {

  constructor(config,  emsClient) {
    this._config = config;
    this._emsClient = emsClient;
  }

  getUrlTemplate() {
    return this._emsClient.extendUrlWithParams(this._config.url);
  }

  getHTMLAttribution() {
    return this._emsClient.sanitizeMarkdown(this._config.attribution);
  }

  getMinZoom() {
    return this._config.minZoom;
  }

  getMaxZoom() {
    return this._config.maxZoom;
  }

  getId() {
    return this._config.id;
  }

  hasId(id) {
    return this._config.id === id;
  }

  getOrigin() {
    return ORIGIN.EMS;
  }

}
