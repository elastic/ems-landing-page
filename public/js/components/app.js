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

    };
  }

  renderPage() {

    return (
    <EuiPage>
      <EuiPageBody>
        <TableOfContents layers={this.props.layers} onFileLayerSelect={this._selectFileLayer}></TableOfContents>
        <div>
          <EuiPanel paddingSize="none">
            Ma preview...
          </EuiPanel>
          <EuiSpacer size="xl" />
          <EuiPageContent>
            <EuiPageContentBody>
              <FeatureTable jsonFeatures={this.state.jsonFeatures} config={this.state.selectedFileLayer} />
            </EuiPageContentBody>
          </EuiPageContent>
        </div>
      </EuiPageBody>
    </EuiPage>
    );
  }

  render() {
    return (
    <div>
      {this.renderPage()}
    </div>
    );
  }
}