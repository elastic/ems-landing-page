/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { Component } from 'react';

import {
  EuiPageSideBar,
  EuiIcon,
  EuiSideNav,
} from '@elastic/eui';

import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon';

import { icon as EuiIconGrid } from '@elastic/eui/lib/components/icon/assets/grid';
import { icon as EuiIconVector } from '@elastic/eui/lib/components/icon/assets/vector';
import { icon as EuiIconSearch } from '@elastic/eui/es/components/icon/assets/search';
import { icon as EuiIconArrowDown } from '@elastic/eui/es/components/icon/assets/arrow_down';
import { icon as EuiIconArrowLeft } from '@elastic/eui/es/components/icon/assets/arrow_left';
import { icon as EuiIconArrowRight } from '@elastic/eui/es/components/icon/assets/arrow_right';

// One or more icons are passed in as an object of iconKey (string): IconComponent
appendIconComponentCache({
  grid: EuiIconGrid,
  vector: EuiIconVector,
  search: EuiIconSearch,
  arrowDown: EuiIconArrowDown,
  arrowLeft: EuiIconArrowLeft,
  arrowRight: EuiIconArrowRight,
});

export class TableOfContents extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTmsId: null,
      selectedLangId: props.selectedLang,
      selectedTmsConfig: null,
      selectedFileId: null,
      selectedFileConfig: null,
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

  selectItem(id, config) {
    if (id.startsWith('file')) {
      this.setState(() => {
        return {
          selectedFileId: id,
          selectedFileConfig: config
        };
      });
      this.props.onFileLayerSelect(config);
    }

    if (id.startsWith('tms')) {
      this.setState(() => {
        return {
          selectedTmsId: id,
          selectedTmsConfig: config
        };
      });
      this.props.onTmsLayerSelect(config);
    }
  }

  _getSidebarItems() {
    const tmsItems = this.props.layers.tms.map((service) => {
      const id = `tms/${service.getId()}`;
      const name = service.getDisplayName();
      return {
        id,
        name,
        title: name,
        isSelected: this.state.selectedTmsId === id,
        onClick: () => this.selectItem(id, service)
      };
    });

    const fileItems = this.props.layers.file.map((service) => {
      const id = `file/${service.getId()}`;
      const name = service.getDisplayName();
      return {
        id,
        name,
        title: name,
        isSelected: this.state.selectedFileId === id,
        onClick: () => this.selectItem(id, service)
      };
    });

    const tiles = {
      id: 'tms',
      name: 'Tile Layers',
      title: 'Tile Layers',
      icon: <EuiIcon type="grid" />,
      items: tmsItems
    };

    const files = {
      id: 'file',
      name: 'Vector Layers',
      title: 'Vector Layers',
      icon: <EuiIcon type="vector" />,
      items: fileItems,
    };

    return [tiles, files];
  }
}
