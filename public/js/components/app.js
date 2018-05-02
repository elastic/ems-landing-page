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
EuiBasicTable
} from '@elastic/eui';

import {TableOfContents} from './table_of_contents';
import {FeatureTable} from './feature_table';
import {Map} from './map';
import {LayerDetails} from './layer_details';

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

      this.setState({
        selectedFileLayer: fileLayerConfig,
        jsonFeatures: featureCollection
      });

      this._map.setOverlayLayer(featureCollection);
    };


    this._map = null;
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
          Elastic Maps Service header? links to disclaimer, reporting button, ...
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
                <FeatureTable jsonFeatures={this.state.jsonFeatures} config={this.state.selectedFileLayer}/>
              </EuiPageContentBody>
            </EuiPageContent>
          </div>
        </EuiPageBody>
      </EuiPage>
    </div>
    );
  }
}