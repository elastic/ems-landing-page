import React, {
Component,
} from 'react';

import {
EuiPage,
EuiPageBody,
EuiPageContent,
EuiPageContentBody,
EuiPanel,
EuiPageSideBar,
EuiSpacer,
EuiIcon,
EuiSideNav,
EuiImage,
EuiBasicTable,
EuiText
} from '@elastic/eui';

import {TableOfContents} from './table_of_contents';
import {FeatureTable} from './feature_table';
import {Map} from './map';
import {LayerDetails} from './layer_details';
import URL from 'url-parse';

import * as topojson from 'topojson-client';

export class App extends Component {

  constructor(props) {

    super(props);

    this.state = {
      selectedFileLayer: null,
      jsonFeatures: null
    };

    this._selectFileLayer = async(fileLayerConfig) => {

      const response = await fetch(fileLayerConfig.url);
      const json = await response.json();

      let featureCollection;
      if (fileLayerConfig.format === 'topojson') {
        const features = json['objects'][fileLayerConfig.meta.feature_collection_path];
        featureCollection = topojson.feature(json, features);//conversion to geojson
      } else {
        featureCollection = json;
      }

      featureCollection.features.forEach((feature, index) => {
        feature.properties.__id__ = index;
      });

      this.setState({
        selectedFileLayer: fileLayerConfig,
        jsonFeatures: featureCollection
      });

      this._setFileRoute(fileLayerConfig);
      this._map.setOverlayLayer(featureCollection);
    };

    this._showFeature = (feature) => {
      this._map.highlightFeature(feature);
    };

    this._map = null;
  }


  componentDidMount(){
    const fileLayerConfig = this._readFileRoute();
    if (!fileLayerConfig){
      window.location.hash = "";
      return;
    }
    this._selectFileLayer(fileLayerConfig);
  }

  _readFileRoute() {

    const urlTokens = URL(window.location, true);

    //uses hash as ID. This is more human readable, and seems more transferable than the machine GCP cloud storage ids.
    const path = urlTokens.hash.substr(1);//cut off #
    const tokens = path.split('/');

    //this version only supports files for now
    if (tokens[0] !== 'file') {
      return;
    }

    const name = decodeURIComponent(tokens[1]);
    return this.props.layers.file.manifest.layers.find((layer) => layer.name === name);
  }

  _setFileRoute(layerConfig) {
    window.location.hash = "file/" + layerConfig.name;
  }

  render() {

    const setMap = (map) => {
      if (this._map === null) {
        this._map = map
      }
    };

    return (
    <div>
      <EuiPage>
        <div className="banner">
          <EuiText>
            <h2>TO DO BANNER</h2>
          </EuiText>
        </div>
        <EuiPageBody>
          <TableOfContents layers={this.props.layers} onFileLayerSelect={this._selectFileLayer}></TableOfContents>
          <div className="mainContent">
            <EuiPanel paddingSize="none">
              <Map ref={setMap}></Map>
            </EuiPanel>
            <EuiSpacer size="xl"/>
            <EuiPageContent>
              <EuiPageContentBody>
                <LayerDetails layerConfig={this.state.selectedFileLayer}/>
                <FeatureTable jsonFeatures={this.state.jsonFeatures} config={this.state.selectedFileLayer}
                              onShow={this._showFeature}/>
              </EuiPageContentBody>
            </EuiPageContent>
          </div>
        </EuiPageBody>
      </EuiPage>
    </div>
    );
  }
}