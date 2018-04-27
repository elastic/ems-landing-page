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
      selectedFileLayer: null
    };

    this._selectFileLayer = (fileLayerConfig) => {
      this.state.selectedFileLayer = fileLayerConfig;
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
              <FeatureTable/>
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