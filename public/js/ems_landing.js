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


export class EMSLanding extends Component {
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


    this.toggleOpenOnMobile = () => {
      this.setState({
        isSideNavOpenOnMobile: !this.state.isSideNavOpenOnMobile,
      });
    };

    this.selectItem = name => {
      this.setState({
        selectedItemName: name,
      });
    };

    this.createItem = (name, data = {}) => {
      return _.assign({},data,{
        id: name,
        name,
        isSelected: this.state.selectedItemName === name,
        onClick: () => this.selectItem(name),
      });
    };

  }

  renderPage() {
    const sideNav = [
      this.createItem('Elastic Map Service', {
        icon: <EuiIcon type="logoElastic" />,
        items: [
          this.createItem('Vector layers', {
            items: [
              this.createItem('U.S. cities'),
              this.createItem('U.S. states'),
              this.createItem('World countries'),
            ]
          }),
        ],
      })
    ];

    return (
    <EuiPage>
      <EuiPageBody>
        <EuiPageSideBar>
          <EuiSideNav
          mobileTitle="Navigate within $APP_NAME"
          toggleOpenOnMobile={this.toggleOpenOnMobile}
          isOpenOnMobile={this.state.isSideNavOpenOnMobile}
          items={sideNav}
          />
        </EuiPageSideBar>

        <div>
          <EuiPanel paddingSize="none">
            <EuiImage url="https://source.unsplash.com/1600x900/?map" alt={this.state.selectedItemName} style={{ width: '100%' }} />
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