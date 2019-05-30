/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import _ from 'lodash';
import { ORIGIN } from './origin';

export class TMSService {
  _getTileJson = _.once(
    async url => this._emsClient.getManifest(this._emsClient.extendUrlWithParams(url)));

  constructor(config,  emsClient) {
    this._config = config;
    this._emsClient = emsClient;
  }

  _getFormatsOfType(type) {
    const formats = this._config.formats.filter(format => {
      const language = this._emsClient.getLocale();
      return format.locale === language && format.format === type;
    });
    return formats;
  }

  _getDefaultStyleUrl() {
    const defaultStyle = this._getFormatsOfType('raster')[0];
    if (defaultStyle && defaultStyle.hasOwnProperty('url')) {
      return defaultStyle.url;
    }
  }

  async getUrlTemplate() {
    const tileJson = await this._getTileJson(this._getDefaultStyleUrl());
    return this._emsClient.extendUrlWithParams(tileJson.tiles[0]);
  }

  getDisplayName() {
    const serviceName = this._emsClient.getValueInLanguage(this._config.name);
    return serviceName;
  }

  getAttributions() {
    const attributions = this._config.attribution.map(attribution => {
      const url = this._emsClient.getValueInLanguage(attribution.url);
      const label = this._emsClient.getValueInLanguage(attribution.label);
      return {
        url: url,
        label: label
      };
    });
    return attributions;
  }

  getHTMLAttribution() {
    const attributions = this._config.attribution.map(attribution => {
      const url = this._emsClient.getValueInLanguage(attribution.url);
      const label = this._emsClient.getValueInLanguage(attribution.label);
      const html = url ? `<a rel="noreferrer noopener" href="${url}">${label}</a>` : label;
      return this._emsClient.sanitizeHtml(`${html}`);
    });
    return `<p>${attributions.join(', ')}</p>`;
  }

  getMarkdownAttribution() {
    const attributions = this._config.attribution.map(attribution => {
      const url = this._emsClient.getValueInLanguage(attribution.url);
      const label = this._emsClient.getValueInLanguage(attribution.label);
      const markdown = `[${label}](${url})`;
      return markdown;
    });
    return attributions.join('|');
  }

  async getMinZoom() {
    const tileJson = await this._getTileJson(this._getDefaultStyleUrl());
    return tileJson.minzoom;
  }

  async getMaxZoom() {
    const tileJson = await this._getTileJson(this._getDefaultStyleUrl());
    return tileJson.maxzoom;
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
