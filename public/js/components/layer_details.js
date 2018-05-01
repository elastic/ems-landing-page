import React, {
Component,
} from 'react';

import {
EuiPageSideBar,
EuiIcon,
EuiSideNav,
} from '@elastic/eui';


export class TableOfContents extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedItemId: null
    };
  }

  render() {
    const sidebarItems = this._getSidebarItems();

    const lists = [];


    return (
    <EuiPageSideBar>
      <EuiSideNav items={sidebarItems}>
      </EuiSideNav>

      <dl>

      </dl>
    </EuiPageSideBar>
    );
  }

}