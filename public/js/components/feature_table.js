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

    const tableData = [];
    for (let i = 0; i < 250; i++){
      tableData.push(  {
        id: '1',
        name: 'United States',
        iso2: 'US',
        iso3: 'USA',
      })
    }

    this.state = {
      isSideNavOpenOnMobile: false,
      selectedItemName: 'World countries',
      tableData: tableData
    };

  }

  render() {

    return (
    <EuiBasicTable
    items={this.state.tableData}
    columns={[
      {
        field: 'name',
        name: 'Country name (name)'
      },
      {
        field: 'iso2',
        name: '2 digit abbreviation (iso2)'
      },
      {
        field: 'iso3',
        name: '3 digit abbreviation (iso3)'
      },
    ]}
    />
    );
  }

}