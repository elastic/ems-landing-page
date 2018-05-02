import React, {
Component, Fragment
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

export class LayerDetails extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.layerConfig){
      return null;
    }
    return (
    <div>
      <dl>
        <dt>Name</dt>
        <dd>{this.props.layerConfig.name}</dd>
        <dt>Attribution</dt>
        <dd>{this.props.layerConfig.attribution}</dd>
        <dt>Link</dt>
        <dd><a href={this.props.layerConfig.url}>geojson</a></dd>
      </dl>
    </div>
    );
  }

}