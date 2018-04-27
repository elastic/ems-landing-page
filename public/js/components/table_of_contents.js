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
    return (
    <EuiPageSideBar>
      <EuiSideNav items={sidebarItems}>
      </EuiSideNav>
    </EuiPageSideBar>
    );
  }


  _createItem(id, name, config, data = {}) {
    return Object.assign(data, {
      id: id,
      name: name,
      isSelected: this.state.selectedItemName === name,
      onClick: () => this._selectItem(id, config)
    });
  }

  _selectItem(id, config) {




    this.setState({
      selectedItemId: id,
    });

    if (id.startsWith('file')) {
      this.props.onFileLayerSelect(config)
    }

  };

  _getSidebarItems() {
    const tmsItems = this.props.layers.tms.manifest.services.map((service) => {
      const id = "tms/" + service.id;
      const name = service.human_readable ? service.human_readable : service.id;
      return this._createItem(id, name, service);
    });
    const tiles = this._createItem("tms", "Tile Layers", this.props.layers.tms.meta, {
      icon: <EuiIcon type="logoElasticSearch"/>,
      items: tmsItems
    });

    const fileItems = this.props.layers.file.manifest.layers.map((service) => {
      const id = "file/" + service.id;
      const name = service.name;
      return this._createItem(id, name, service);
    });
    const files = this._createItem("file", "File Layers", this.props.layers.file.meta, {
      icon: <EuiIcon type="logoKibana"/>,
      items: fileItems
    });

    return [tiles, files];
  }
}