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

import _ from 'lodash';
import {TableOfContents} from './table_of_contents';

export class App extends Component {

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

    this._selectLayer = (layer) => {
      //todo
    };



  }

  renderPage() {


    return (
    <EuiPage>
      <EuiPageBody>

        <TableOfContents layers={this.props.layers} onLayerSelect={this._selectLayer}></TableOfContents>

        <div>
          <EuiPanel paddingSize="none">
            Ma preview...
          </EuiPanel>

          <EuiSpacer size="xl" />

          <EuiPageContent>
            <EuiPageContentBody>
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