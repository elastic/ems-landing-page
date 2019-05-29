/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { ORIGIN } from './origin';
import url from 'url';

export class FileLayer {

  constructor(config, emsClient) {
    this._config = config;
    this._emsClient = emsClient;
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
      const html = url ? `<a href=${url}>${label}</a>` : label;
      return this._emsClient.sanitizeHtml(html);
    });
    return attributions.join(', ');
  }

  getFieldsInLanguage() {
    return this._config.fields.map(field => {
      return {
        type: field.type,
        name: field.id,
        description: this._emsClient.getValueInLanguage(field.label)
      };
    });
  }

  getDisplayName() {
    const layerName = this._emsClient.getValueInLanguage(this._config.layer_name);
    return (layerName)  ? layerName  : '';
  }

  getId() {
    return this._config.layer_id;
  }

  hasId(id) {
    const matchesLegacyId = this._config.legacy_ids.indexOf(id) >= 0;
    return this._config.layer_id === id || matchesLegacyId;
  }

  _getDefaultFormat() {
    const defaultFormat = this._config.formats.find(format => {
      return format.legacy_default;
    });
    if (defaultFormat) {
      return defaultFormat;
    }
    return this._config.formats[0];
  }

  getEMSHotLink() {
    const landingPageString = this._emsClient.getLandingPageUrl();
    const urlObject = url.parse(landingPageString);
    urlObject.hash = `file/${this.getId()}`;
    urlObject.query = {
      ...urlObject.query,
      locale: this._emsClient.getLocale()
    };
    return url.format(urlObject);
  }

  getDefaultFormatType() {
    const format = this._getDefaultFormat();
    return format.type;
  }

  getDefaultFormatMeta() {
    const format = this._getDefaultFormat();
    return format.meta;
  }

  getDefaultFormatUrl() {
    const format = this._getDefaultFormat();
    return this._emsClient.extendUrlWithParams(format.url);
  }

  getCreatedAt() {
    return this._config.created_at;
  }

  getOrigin() {
    return ORIGIN.EMS;
  }

}
