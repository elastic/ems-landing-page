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
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderLogo
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
      const response = await fetch(fileLayerConfig.url);
      const json = await response.json();


      let featureCollection;
      if (fileLayerConfig.format === 'topojson') {
        const features = json.objects[fileLayerConfig.meta.feature_collection_path];
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

    //find the road map layer
    this._baseLayer = this.props.layers.tms.manifest.services.find((service) => {
      return service.id === 'road_map';
    });

    this._map = null;
    this._toc = null;
    this._featuretable = null;
  }


  componentDidMount() {
    let vectorLayerSelection = this._readFileRoute();
    if (!vectorLayerSelection) {
      //fallback to the first layer from the manifest
      const firstLayer = this.props.layers.file.manifest.layers[0];
      if (!firstLayer) {
        window.location.hash = '';
        return;
      }
      vectorLayerSelection = {
        config: firstLayer,
        path: `file/${firstLayer.name}`
      };
    }
    this._selectFileLayer(vectorLayerSelection.config);
    this._toc.selectItem(vectorLayerSelection.path, vectorLayerSelection.config);
  }

  _readFileRoute() {
    const urlTokens = new URL(window.location, true);

    // uses layername as ID.
    // This is more human readable, and seems more transferable than the machine GCP cloud storage ids.
    const path = urlTokens.hash.substr(1);// cut off #
    const tokens = path.split('/');

    // this version only supports files for now
    if (tokens[0] !== 'file') {
      return;
    }

    const name = decodeURIComponent(tokens[1]);
    return {
      path: `file/${name}`,
      config: this.props.layers.file.manifest.layers.find(layer => layer.name === name)
    };
  }

  _setFileRoute(layerConfig) {
    window.location.hash = `file/${layerConfig.name}`;
  }

  render() {
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
          <EuiHeaderSection>
            <EuiHeaderSectionItem>
              <EuiHeaderLogo href="#" aria-label="Go to elastic.co" iconType="emsApp" >Elastic Maps Service</EuiHeaderLogo>
            </EuiHeaderSectionItem>
          </EuiHeaderSection>
          <EuiHeaderSection side="right">
            <EuiHeaderLinks>
              <EuiHeaderLink>elastic.co</EuiHeaderLink>
            </EuiHeaderLinks>
          </EuiHeaderSection>
        </EuiHeader>
        <EuiPage>
          <EuiPageBody>
            <TableOfContents layers={this.props.layers} onFileLayerSelect={this._selectFileLayer} ref={setToc}/>
            <div className="mainContent">
              <EuiPanel paddingSize="none">
                <Map ref={setMap}  baseLayer={this._baseLayer} />
              </EuiPanel>
              <EuiSpacer size="xl" />
              <EuiPageContent>
                <EuiPageContentBody>
                  <LayerDetails layerConfig={this.state.selectedFileLayer} />
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
