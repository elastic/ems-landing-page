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
      selectedConfig: null
    };
  }

  render() {
    const sidebarItems = this._getSidebarItems();
    return (
      <EuiPageSideBar>
        <EuiSideNav items={sidebarItems} />
      </EuiPageSideBar>
    );
  }

  _createItem(id, name, config, data = {}) {
    return Object.assign(data, {
      id,
      name,
      isSelected: this.state.selectedItemId === id,
      onClick: () => this.selectItem(id, config),
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
      return this._createItem(id, name, service);
    });
    const files = this._createItem('file', 'Vector Layers', this.props.layers.file.meta, {
      icon: <EuiIcon type="vector" />,
      items: fileItems,
    });

    return [files];
  }
}
