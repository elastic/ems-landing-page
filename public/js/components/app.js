/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React, { Component } from 'react';
import HttpsRedirect from 'react-https-redirect';

import {
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPanel,
  EuiSpacer,
  EuiHeader,
  EuiHeaderLink,
  EuiHeaderLinks,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderLogo,
  EuiText,
  EuiToast
} from '@elastic/eui';

import { TableOfContents } from './table_of_contents';
import { FeatureTable } from './feature_table';
import { Map } from './map';
import { LayerDetails } from './layer_details';
import URL from 'url-parse';

import * as topojson from 'topojson-client';

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedFileLayer: null,
      jsonFeatures: null,
      selectedTmsLayer: null,
      initialSelection: null
    };

    this._selectFileLayer = async (fileLayerConfig) => {

      this._featuretable.startLoading();
      const response = await fetch(fileLayerConfig.getDefaultFormatUrl());
      const json = await response.json();


      let featureCollection;
      if (fileLayerConfig.getDefaultFormatType() === 'topojson') {
        const features = json.objects[fileLayerConfig.getDefaultFormatMeta().feature_collection_path];
        featureCollection = topojson.feature(json, features);// conversion to geojson
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

    this._getTmsSource = async (tmsLayerConfig) => {
      return {
        type: 'raster',
        tiles: [ await tmsLayerConfig.getUrlTemplate() ],
        minzoom: await tmsLayerConfig.getMinZoom(),
        maxzoom: await tmsLayerConfig.getMaxZoom(),
        tileSize: 256,
        attribution: tmsLayerConfig.getHTMLAttribution()
      };
    };

    this._selectTmsLayer = async (tmsLayerConfig) => {
      const source = await this._getTmsSource(tmsLayerConfig);

      this.setState({
        selectedTmsLayer: tmsLayerConfig
      });

      this._map.setTmsLayer(source);
    };

    //find the road map layer
    this._baseLayer = this.props.layers.tms.find((service) => {
      return service.getId() === 'road_map';
    });

    this._map = null;
    this._toc = null;
    this._featuretable = null;
  }


  componentDidMount() {

    if (!Map.isSupported()) {
      return;
    }

    let vectorLayerSelection = this._readFileRoute();
    if (!vectorLayerSelection) {
      //fallback to the first layer from the manifest
      const firstLayer = this.props.layers.file[0];
      if (!firstLayer) {
        window.location.hash = '';
        return;
      }
      vectorLayerSelection = {
        config: firstLayer,
        path: `file/${firstLayer.getId()}`
      };
    }
    this._selectFileLayer(vectorLayerSelection.config);
    this._selectTmsLayer(this._baseLayer);
    this._toc.selectItem(vectorLayerSelection.path, vectorLayerSelection.config);
    this._toc.selectItem(`tms/${this._baseLayer.getId()}`, this._baseLayer);
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
    return {
      path: `file/${id}`,
      config: this.props.layers.file.find(layer => layer.hasId(id))
    };
  }

  _setFileRoute(layerConfig) {
    window.location.hash = `file/${layerConfig.getId()}`;
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

    return (
      <HttpsRedirect>
        <div>
          <EuiHeader>
            <EuiHeaderSection>
              <EuiHeaderSectionItem border="none">
                <EuiHeaderLogo href="#" aria-label="Go to elastic.co" iconType="emsApp" >Elastic Maps Service</EuiHeaderLogo>
              </EuiHeaderSectionItem>
            </EuiHeaderSection>
            <EuiHeaderSection side="right">
              <EuiHeaderLinks>
                <EuiHeaderLink href="//elastic.co">elastic.co</EuiHeaderLink>
              </EuiHeaderLinks>
            </EuiHeaderSection>
          </EuiHeader>
          <EuiPage>
            <TableOfContents
              layers={this.props.layers}
              onTmsLayerSelect={this._selectTmsLayer}
              onFileLayerSelect={this._selectFileLayer}
              ref={setToc}
            />
            <EuiPageBody>
              <div className="mainContent">
                <EuiPanel paddingSize="none">
                  <Map ref={setMap} />
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
                  <p>Please submit any issues with this layer or suggestions for improving this layer in the <a href="https://github.com/elastic/kibana/issues/new" target="_blank">Kibana repo</a>.</p>
                </EuiText>
              </div>
            </EuiPageBody>
          </EuiPage>
        </div>
      </HttpsRedirect>
    );
  }
}
