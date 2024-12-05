/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { TMSService } from '@elastic/ems-client/target/node';

import {
  EuiCode,
  EuiGlobalToastList,
  EuiHeader,
  EuiHeaderLink,
  EuiHeaderLinks,
  EuiHeaderLogo,
  EuiHeaderSectionItem,
  EuiPage,
  EuiPageBody,
  EuiPageSection,
  EuiPanel,
  EuiProvider,
  EuiSpacer,
  EuiToast,
  EuiToolTip,
} from '@elastic/eui';

import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon';
import { icon as EuiIconAlert } from '@elastic/eui/lib/components/icon/assets/alert';
import { icon as EuiIconEmsApp } from '@elastic/eui/lib/components/icon/assets/app_ems';
import { icon as EuiIconBug } from '@elastic/eui/lib/components/icon/assets/bug';
import { icon as EuiIconDocuments } from '@elastic/eui/lib/components/icon/assets/documents';
import { icon as EuiIconElastic } from '@elastic/eui/lib/components/icon/assets/logo_elastic';
import { icon as EuiIconGithub } from '@elastic/eui/lib/components/icon/assets/logo_github';
import { icon as EuiIconStop } from '@elastic/eui/lib/components/icon/assets/stop';

import React, { Component } from 'react';
import URL from 'url-parse';
import chroma from 'chroma-js';

import { FeatureTable } from './feature_table';
import { LayerDetails } from './layer_details';
import { Map } from './map';
import { TableOfContents } from './table_of_contents';

import { eui } from './theme';

const colorMode = window?.matchMedia?.('(prefers-color-scheme:dark)')?.matches ? 'dark' :  'light';

document.body.setAttribute('data-eui-theme', eui.name);
document.body.setAttribute('data-eui-mode', colorMode);

// One or more icons are passed in as an object of iconKey (string): IconComponent
appendIconComponentCache({
  emsApp: EuiIconEmsApp,
  alert: EuiIconAlert,
  logoGithub: EuiIconGithub,
  logoElastic: EuiIconElastic,
  bug: EuiIconBug,
  documents: EuiIconDocuments,
  stop: EuiIconStop
});

export const supportedLanguages = [
  { key: 'default', label: 'Default' },
  { key: 'ar', label: 'العربية' },
  { key: 'de', label: 'Deutsch' },
  { key: 'en', label: 'English' },
  { key: 'es', label: 'Español' },
  { key: 'fr-fr', label: 'Français' },
  { key: 'hi-in', label: 'हिन्दी' },
  { key: 'it', label: 'Italiano' },
  { key: 'ja-jp', label: '日本語' },
  { key: 'ko', label: '한국어' },
  { key: 'pt-pt', label: 'Português' },
  { key: 'ru-ru', label: 'русский' },
  { key: 'zh-cn', label: '简体中文' },
];

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedTileLayer: null,
      selectedFileLayer: null,
      selectedLanguage: 'default',
      selectedColor: null,
      selectedColorOp: null,
      selectedPercentage: null,
      jsonFeatures: null,
      initialSelection: null,
      toasts: []
    };

    this._selectFileLayer = async (fileLayerConfig, skipZoom) => {

      try {
        this._featuretable?.startLoading();
        const featureCollection = await fileLayerConfig.getGeoJson();

        featureCollection.features.forEach((feature, index) => {
          feature.properties.__id__ = index;
        });

        this.setState({
          selectedFileLayer: fileLayerConfig,
          jsonFeatures: featureCollection,
        });

        this._setFileRoute(fileLayerConfig);
        this._map.setOverlayLayer(featureCollection, skipZoom, this.state.selectedColor);
        this._featuretable?.stopLoading();
      } catch (error) {
        this._addToast(
          'There was an error',
          <p><EuiCode>{error.message}</EuiCode></p>
        );
      }
    };

    this._showFeature = (feature) => {
      this._map.highlightFeature(feature);
    };

    this._filterFeatures = (features) => {
      this._map.filterFeatures(features);
    };

    this._getTmsSource = (cfg) => cfg.getVectorStyleSheet();

    this._selectLanguage = (lang) => {
      this.setState({ selectedLanguage: lang }, () => {
        this._updateMap();
      });
    };

    this._selectTmsLayer = async (config) => {
      const source = await this._getTmsSource(config);
      const { operation, percentage } = TMSService.colorOperationDefaults.find(c => c.style === config.getId());
      this.setState({
        selectedTileLayer: config,
        selectedColorOp: operation,
        selectedPercentage: percentage
      }, () => {
        this._map.setTmsLayer(source, () => {
          this._updateMap();
        });
      });
    };

    this._changeColor = async (color) => {
      this.setState({ selectedColor: color }, async () => {
        await this._updateMap();
        if (this.state.selectedFileLayer) {
          this._selectFileLayer(this.state.selectedFileLayer, true);
        }
      });
    };

    this._addToast = (title, text) => {
      this.setState({
        toasts: [{
          id: 'error',
          color: 'danger',
          title,
          text
        }]
      });
    };

    this._removeToast = () => {
      this.setState({
        toasts: []
      });
    };

    this._map = null;
    this._toc = null;
    this._featuretable = null;
  }


  componentDidMount() {

    document.title = this.props.serviceName;

    if (!Map.isSupported()) {
      return;
    }

    const baseLayerStyle = colorMode === 'light' ? 'road_map_desaturated' : 'dark_map';
    const baseLayer = this.props.layers.tms.find((service) => {
      return service.getId() === baseLayerStyle;
    });
    this._toc.selectItem(`tms/${baseLayer.getId()}`, baseLayer);

    const vectorLayerSelection = this._readFileRoute();
    if (vectorLayerSelection) {

      this._map.waitForStyleLoaded(() => {
        this._selectFileLayer(vectorLayerSelection.config);
        this._toc.selectItem(vectorLayerSelection.path, vectorLayerSelection.config);
      });
    }
  }

  _readFileRoute() {
    const urlTokens = new URL(window.location, true);

    // uses layer id as ID.
    // This is more human readable, and seems more transferable than the machine GCP cloud storage ids.
    const path = urlTokens.hash.substr(1);// cut off #
    const tokens = path.split('/');

    // this version only supports files for now
    if (tokens[0] !== 'file') {
      return;
    }

    const id = decodeURIComponent(tokens[1]);
    if (!id || id === 'undefined') {
      return;
    }

    return {
      path: `file/${id}`,
      config: this.props.layers.file.find(layer => layer.hasId(id))
    };
  }

  _setFileRoute(layerConfig) {
    window.location.hash = `file/${layerConfig.getId()}`;
  }

  async _updateMap() {
    if (!this?.state) {
      return;
    }

    // Getting the necessary data to update the map
    const { selectedTileLayer, selectedLanguage } = this.state;
    const source = await (selectedTileLayer.getVectorStyleSheet());
    const mlMap = this._map._maplibreMap;

    if (!selectedTileLayer || !source || !mlMap) {
      return;
    }

    // Iterate over map layers to change the layout[text-field] property
    if (selectedLanguage) {
      const langKey = selectedLanguage;
      const lang = supportedLanguages.find(l => l.key === langKey);

      try {
        this._map.waitForStyleLoaded(async () => {
          if (langKey === 'default') {
            const defaultStyle = await this.state.selectedTileLayer.getVectorStyleSheet();
            source.layers.forEach(layer => {
              const textField = defaultStyle?.layers.find(l => l.id === layer.id)?.layout?.['text-field'];
              if (textField) {
                mlMap.setLayoutProperty(layer.id, 'text-field', textField);
              }
            });
          } else {
            source.layers.forEach(layer => {
              const textField = TMSService.transformLanguageProperty(layer, langKey);
              if (textField) {
                mlMap.setLayoutProperty(layer.id, 'text-field', textField);
              }
            });
          }
        });
      } catch (error) {
        this._addToast(
          `Error switching to ${lang.label}`,
          <p><EuiCode>{error.message}</EuiCode></p>
        );
      }
    }


    const { selectedColor, selectedColorOp, selectedPercentage } = this.state;
    try {
      if (selectedColor && !chroma.valid(selectedColor)) {
        throw new Error(`${selectedColor} is not a valid color representation`);
      }

      source?.layers.forEach(layer => {
        TMSService
          .transformColorProperties(layer, selectedColor, selectedColorOp, selectedPercentage)
          .forEach(({ color, property }) => {
            mlMap.setPaintProperty(layer.id, property, color);
          });
      });

      if (mlMap && mlMap?.redraw === 'function') {
        mlMap.redraw();
      }
    } catch (error) {
      this._addToast(
        `Error blending basemap with ${selectedColor}`,
        <p><EuiCode>{error.message}</EuiCode></p>
      );
    }
  }

  render() {

    if (!Map.isSupported()) {
      return (<EuiToast
        title="Your browser does not support WebGL. Please turn on WebGL in order to use this application."
        color="danger"
        iconType="alert"
      />);
    }

    const setMap = (map) => {
      if (this._map === null) {
        this._map = map;
      }
    };

    const setToc = (toc) => {
      if (this._toc === null) {
        this._toc = toc;
      }
    };

    const setFeatureTable = (featuretable) => {
      if (this._featuretable === null) {
        this._featuretable = featuretable;
      }
    };

    // Set up the link on the logo to go to the root or up if relative
    const fileApUrl = this.props.client.getFileApiUrl();
    const logoLink =
      new URL(fileApUrl).hostname == window.location.hostname ? '../' : '/';

      
    return (
      <EuiProvider theme={eui.theme} colorMode={colorMode}>
        <EuiHeader>
          <EuiHeaderSectionItem border="right">
            <EuiToolTip delay="long" 
              content={`EMS version: ${this.props.client._emsVersion}`}>
              <EuiHeaderLogo href={logoLink} aria-label={`${this.props.serviceName} home`} iconType="emsApp" >
                {this.props.serviceName}
              </EuiHeaderLogo>
            </EuiToolTip>
          </EuiHeaderSectionItem>
          <EuiHeaderSectionItem border="none">
            <EuiHeaderLinks gutterSize="xs">
              <EuiHeaderLink target="_blank" iconType="logoElastic" href="https://elastic.co"> elastic.co </EuiHeaderLink>
              <EuiHeaderLink target="_blank" iconType="logoGithub" href="https://www.github.com/elastic/ems-landing-page"> GitHub </EuiHeaderLink>
              <EuiHeaderLink target="_blank" iconType="bug" href="https://www.github.com/elastic/ems-file-service/issues/new"> Report data issues </EuiHeaderLink>
              <EuiHeaderLink target="_blank" iconType="documents" href="https://www.elastic.co/elastic-maps-service-terms"> Terms of Service </EuiHeaderLink>
            </EuiHeaderLinks>
          </EuiHeaderSectionItem>
        </EuiHeader>
        <EuiPage>
          <TableOfContents
            layers={this.props.layers}
            selectedLang={this.state.selectedLanguage}
            onLanguageSelect={this._selectLanguage}
            onTmsLayerSelect={this._selectTmsLayer}
            onFileLayerSelect={this._selectFileLayer}
            ref={setToc}
          />
          <EuiPageBody>
            <EuiPageSection className="mainContent">
              <EuiPanel paddingSize="none">
                <Map ref={setMap} />
              </EuiPanel>
              <EuiSpacer size="l" />
              <EuiPanel>
                <LayerDetails
                  title="Tile Layer"
                  layerConfig={this.state.selectedTileLayer}
                  onLanguageChange={this._selectLanguage}
                  onColorChange={this._changeColor}
                  language={this.state.selectedLanguage}
                  color={this.state.selectedColor}
                />
              </EuiPanel>
              <EuiSpacer />
              {
                (this.state.selectedFileLayer) &&
                <EuiPanel>
                  <LayerDetails
                    title="Vector Layer"
                    layerConfig={this.state.selectedFileLayer}
                  />
                  <EuiSpacer size="l" />
                  <FeatureTable
                    ref={setFeatureTable}
                    jsonFeatures={this.state.jsonFeatures}
                    config={this.state.selectedFileLayer}
                    onShow={this._showFeature}
                    onFilterChange={this._filterFeatures}
                  />
                </EuiPanel>
              }
              <EuiGlobalToastList
                toasts={this.state.toasts}
                dismissToast={this._removeToast}
                toastLifeTimeMs={3000}
              />
            </EuiPageSection>
          </EuiPageBody>
        </EuiPage>
      </EuiProvider>
    );
  }
}
