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

export class App extends Component {

  constructor(props) {

    super(props);

    this.state = {
      selectedFileLayer: null,
      jsonFeatures: null
    };
    this._selectFileLayer = async(fileLayerConfig) => {

      const response = await fetch(fileLayerConfig.url);
      const jsonFeatures = await response.json();

      if (fileLayerConfig.format === 'topojson') {
        this.setState({
          selectedFileLayer: null,
          jsonFeatures: null
        });
        return;
      }

      this.setState({
        selectedFileLayer: fileLayerConfig,
        jsonFeatures: jsonFeatures
      });

      this._map.setOverlayLayer(jsonFeatures);
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