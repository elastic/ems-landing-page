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
  EuiHeader,
  EuiHeaderLink,
  EuiHeaderLinks,
  EuiHeaderSectionItem,
  EuiHeaderLogo,
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

    this._getTmsSource = (cfg) => cfg.getVectorStyleSheet();

    this._selectTmsLayer = async (tmsLayerConfig) => {
      const source = await this._getTmsSource(tmsLayerConfig);

      this._map.setTmsLayer(source);
    };

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

    const baseLayer = this.props.layers.tms.find((service) => {
      return service.getId() === 'road_map';
    });

    this._toc.selectItem(vectorLayerSelection.path, vectorLayerSelection.config);
    this._toc.selectItem(`tms/${baseLayer.getId()}`, baseLayer);
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
      <div>
        <EuiHeader>
          <EuiHeaderSectionItem border="right">
            <EuiHeaderLogo href="#" aria-label="Go to elastic.co" iconType="emsApp" >Elastic Maps Service</EuiHeaderLogo>
          </EuiHeaderSectionItem>
          <EuiHeaderSectionItem border="none">
            <EuiHeaderLinks gutterSize="xs">
              <EuiHeaderLink iconType="logoElastic" href="https://elastic.co"> elastic.co </EuiHeaderLink>
              <EuiHeaderLink iconType="logoGithub" href="https://www.github.com/elastic/ems-landing-page"> GitHub </EuiHeaderLink>
              <EuiHeaderLink iconType="bug" href="https://www.github.com/elastic/ems-file-service/issues/new"> Report data issues </EuiHeaderLink>
              <EuiHeaderLink iconType="documents" href="https://www.elastic.co/elastic-maps-service-terms"> Terms of Service </EuiHeaderLink>
            </EuiHeaderLinks>
          </EuiHeaderSectionItem>
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
            </div>
          </EuiPageBody>
        </EuiPage>
      </div>
    );
  }
}
