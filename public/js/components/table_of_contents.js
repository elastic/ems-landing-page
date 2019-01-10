import React, { Component } from 'react';

import {
  EuiPageSideBar,
  EuiIcon,
  EuiSideNav,
} from '@elastic/eui';


export class TableOfContents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItemId: null,
      selectedConfig: null,
      isSideNavOpenOnMobile: false,
    };

    this.toggleSideNavOpenOnMobile = this.toggleSideNavOpenOnMobile.bind(this);
  }

  render() {
    const sidebarItems = this._getSidebarItems();
    return (
      <EuiPageSideBar>
        <EuiSideNav
          items={sidebarItems}
          mobileTitle="Layers"
          toggleOpenOnMobile={this.toggleSideNavOpenOnMobile}
          isOpenOnMobile={this.state.isSideNavOpenOnMobile}
        />
      </EuiPageSideBar>
    );
  }

  toggleSideNavOpenOnMobile() {
    this.setState({
      isSideNavOpenOnMobile: !this.state.isSideNavOpenOnMobile,
    });
  }

  _createItem(id, name, config, onClickHandler, data = {}) {
    return Object.assign(data, {
      id,
      name,
      title: name,
      isSelected: this.state.selectedItemId === id,
      onClick: onClickHandler
    });
  }

  selectItem(id, config) {
    this.setState({
      selectedItemId: id,
      selectedConfig: config
    });

    if (id.startsWith('file')) {
      this.props.onFileLayerSelect(config);
    }
  }

  _getSidebarItems() {
    const fileItems = this.props.layers.file.manifest.layers.map((service) => {
      const id = `file/${service.name}`;
      const name = service.name;
      return this._createItem(
        id,
        name,
        service,
        () => this.selectItem(id, service));
    });
    const files = this._createItem('file', 'Vector Layers', this.props.layers.file.meta, null, {
      icon: <EuiIcon type="vector" />,
      items: fileItems,
    });

    return [files];
  }
}
