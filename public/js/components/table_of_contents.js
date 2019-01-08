/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

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

  _createItem(id, name, onClickHandler, data = {}) {
    return Object.assign(data, {
      id,
      name,
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
    const fileItems = this.props.layers.file.map((service) => {
      const id = `file/${service.getId()}`;
      const name = service.getDisplayName();
      return this._createItem(
        id,
        name,
        () => this.selectItem(id, service));
    });
    const files = this._createItem('file', 'Vector Layers', null, {
      icon: <EuiIcon type="vector" />,
      items: fileItems,
    });

    return [files];
  }
}
