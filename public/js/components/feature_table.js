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


export class FeatureTable extends Component {


  constructor(props) {
    super(props);
  }
  
  _getRows() {
    return this.props.jsonFeatures.features.map((feature) => feature.properties);
  }

  _getColumns() {
    return this.props.config.fields.map(field => {
      return {
        field: field.name,
        name: field.description + " (" + field.name + ")"
      }
    });
  }


  render() {

    if (this.props.jsonFeatures === null) {
      return null;
    }

    const rows = this._getRows();
    const columns = this._getColumns();

    return (
    <EuiBasicTable
    items={rows}
    columns={columns}
    />
    );
  }

}