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
EuiIcon,
EuiSideNav,
EuiImage,
EuiBasicTable,
EuiInMemoryTable
} from '@elastic/eui';


export class FeatureTable extends Component {

  constructor(props) {
    super(props);
  }

  _getRows() {
    return this.props.jsonFeatures.features.map((feature, index) => {
      return Object.assign({
        __id__: index
      }, feature.properties);
    });
  }

  _getColumns() {
    const cols =  this.props.config.fields.map(field => {
      return {
        field: field.name,
        name: field.description + " (" + field.name + ")",
        sortable: true
      }
    });


    const actions = [{
      name: 'Show',
      description: 'show on layer',
      icon: 'bullseye',
      onClick: (c) => {
        console.log('click', c);
        const feature = this.props.jsonFeatures.features[c.__id__];
        this.props.onShow(feature);
      }
    }];

    cols.push({
      name: '',
      actions
    });

    return cols;
  }

  render() {

    if (this.props.jsonFeatures === null) {
      return null;
    }

    const rows = this._getRows();
    const columns = this._getColumns();

    const search = {};

    const pagination = {
      initialPageSize: 50,
      pageSizeOptions: [50]
    };


    // const selection = {
    //   itemId: '__id__',
    //   onSelectionChange: (e) => {
    //     console.log('sel change', e);
    //   },
    //   // selectable: (e) => {
    //   //   console.log('sel?', e);
    //   //   return true;
    //   // }
    // };

    return (
    <EuiInMemoryTable
    items={rows}
    columns={columns}
    search={search}
    pagination={pagination}
    sorting={true}
    hasActions={true}
    />
    );
  }

}