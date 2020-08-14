/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component } from 'react';
import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiToast,
} from '@elastic/eui';
import { coerce as semverCoerce, gte as semverGte } from 'semver';

import { EMSClient } from '@elastic/ems-client';

import { TableOfContents } from './table_of_contents';
import { FeatureTable } from './feature_table';
import { Map } from './map';
import { LayerDetails } from './layer_details';
import { version } from '../../../package.json';

import * as topojson from 'topojson-client';

const VECTOR_TILES_MIN_EMS = semverCoerce('7.6');

export class EMSVersion extends Component {
  constructor(props) {
    super(props);

    this.state = {
      emsVersion: null,
      emsClient: null,
      fileLayers: [],
      tmsLayers: [],
      selectedFileLayer: null,
      jsonFeatures: null,
      initialSelection: null,
    };

    this._getEmsClient = async (deployment, locale) => {
      let config;
      try {
        const response = await fetch('config.json');
        config = await response.json();
      } catch (e) {
        throw new Error(`Config file is missing or invalid`);
      }
      const emsVersion = this.props.match.params.version || config.SUPPORTED_EMS.emsVersion;
      const manifest = config.SUPPORTED_EMS.manifest.hasOwnProperty(deployment)
        ? config.SUPPORTED_EMS.manifest[deployment]
        : config.SUPPORTED_EMS.manifest[config.default];
      const fileApiUrl = manifest.hasOwnProperty('emsFileApiUrl')
        ? relativeToAbsolute(manifest.emsFileApiUrl)
        : null;
      const tileApiUrl = manifest.hasOwnProperty('emsTileApiUrl')
        ? relativeToAbsolute(manifest.emsTileApiUrl)
        : null;
      const language =
        locale && config.SUPPORTED_LOCALE.hasOwnProperty(locale.toLowerCase()) ? locale : null;

      const license = config.license;
      const emsClient = new EMSClient({
        appName: 'ems-landing-page',
        appVersion: version,
        fileApiUrl,
        tileApiUrl,
        emsVersion,
        language: language,
        fetchFunction,
      });
      if (license) {
        emsClient.addQueryParams({ license });
      }
      this.setState({
        emsVersion
      });
      return emsClient;
    };

    this._selectFileLayer = async (fileLayerConfig) => {
      this._featuretable.startLoading();
      const response = await fetch(fileLayerConfig.getDefaultFormatUrl());
      const json = await response.json();

      let featureCollection;
      if (fileLayerConfig.getDefaultFormatType() === 'topojson') {
        const features =
          json.objects[fileLayerConfig.getDefaultFormatMeta().feature_collection_path];
        featureCollection = topojson.feature(json, features); // conversion to geojson
      } else {
        featureCollection = json;
      }

      featureCollection.features.forEach((feature, index) => {
        feature.properties.__id__ = index;
      });

      this.setState({
        selectedFileLayer: fileLayerConfig,
        jsonFeatures: featureCollection,
      });

      this._setFileRoute(fileLayerConfig);
      this._map.setOverlayLayer(featureCollection);
      this._featuretable.stopLoading();
    };

    this._showFeature = (feature) => {
      this._map.highlightFeature(feature);
    };

    this._filterFeatures = (features) => {
      this._map.filterFeatures(features);
    };

    this._getTmsSource = async (cfg) => {
      if (semverGte(semverCoerce(this.state.emsVersion), VECTOR_TILES_MIN_EMS)) {
        return await cfg.getVectorStyleSheet();
      }
      const style = await cfg.getDefaultRasterStyle();
      return {
        version: 8,
        sources: {
          'raster-tiles': {
            ...style,
            type: 'raster',
            tileSize: 256,
          }
        },
        layers: [{
          id: 'baseLayer',
          type: 'raster',
          source: 'raster-tiles',
        }]
      };
    };

    this._selectTmsLayer = async (tmsLayerConfig) => {
      const source = await this._getTmsSource(tmsLayerConfig);
      this._map.setTmsLayer(source);
    };

    this._map = null;
    this._toc = null;
    this._featuretable = null;

    this._initializeMap = this._initializeMap.bind(this);
  }

  componentDidMount() {
    if (!Map.isSupported()) {
      return;
    }
  }

  async _initializeMap() {
    const queryParams = new URLSearchParams(this.props.location.search);
    const emsClient = await this._getEmsClient(queryParams.get('manifest'), queryParams.get('locale'));
    const fileLayers = await emsClient.getFileLayers();
    const tmsLayers = await emsClient.getTMSServices();

    let vectorLayerSelection = this._readFileRoute(fileLayers);
    if (!vectorLayerSelection) {
      //fallback to the first layer from the manifest
      const firstLayer = fileLayers[0];
      if (!firstLayer) {
        window.location.hash = '';
        return;
      }
      vectorLayerSelection = {
        config: firstLayer,
        path: `file/${firstLayer.getId()}`,
      };
    }

    const baseLayer = tmsLayers.find((service) => {
      return service.getId() === 'road_map';
    });

    this._toc.selectItem(vectorLayerSelection.path, vectorLayerSelection.config);
    this._toc.selectItem(`tms/${baseLayer.getId()}`, baseLayer);
    this.setState({
      fileLayers,
      tmsLayers
    });
  }

  _readFileRoute(fileLayers) {
    const hash = this.props.location.hash;

    // uses layer id as ID.
    // This is more human readable, and seems more transferable than the machine GCP cloud storage ids.
    const path = hash.substr(1); // cut off #
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
      config: fileLayers.find((layer) => layer.hasId(id)),
    };
  }

  _setFileRoute(layerConfig) {
    window.location.hash = `file/${layerConfig.getId()}`;
  }

  render() {
    if (!Map.isSupported()) {
      return (
        <EuiToast
          title="Your browser does not support WebGL. Please turn on WebGL in order to use this application."
          color="danger"
          iconType="alert"
        />
      );
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

    return (
      <div>
        <EuiPage>
          <TableOfContents
            tmsLayers={this.state.tmsLayers}
            fileLayers={this.state.fileLayers}
            onTmsLayerSelect={this._selectTmsLayer}
            onFileLayerSelect={this._selectFileLayer}
            ref={setToc}
          />
          <EuiPageBody>
            <div className="mainContent">
              <EuiPanel paddingSize="none">
                <Map
                  ref={setMap}
                  onMapReady={this._initializeMap}
                />
              </EuiPanel>
              <EuiSpacer size="xl" />
              <EuiPageContent>
                <EuiPageContentBody>
                  <LayerDetails layerConfig={this.state.selectedFileLayer} />
                  <EuiSpacer size="l" />
                  <FeatureTable
                    ref={setFeatureTable}
                    jsonFeatures={this.state.jsonFeatures}
                    config={this.state.selectedFileLayer}
                    onShow={this._showFeature}
                    onFilterChange={this._filterFeatures}
                  />
                </EuiPageContentBody>
              </EuiPageContent>
              <EuiSpacer />
              <EuiText size="xs" textAlign="center">
                <p>
                  Please submit any issues with this layer or suggestions for improving this layer
                  in the{' '}
                  <a href="https://github.com/elastic/kibana/issues/new" target="_blank">
                    Kibana repo
                  </a>
                  .
                </p>
              </EuiText>
            </div>
          </EuiPageBody>
        </EuiPage>
      </div>
    );
  }
}

function fetchFunction(...args) {
  return fetch(...args);
}

function relativeToAbsolute(url) {
  // convert all link urls to absolute urls
  const a = document.createElement('a');
  a.setAttribute('href', url);
  return a.href;
}
