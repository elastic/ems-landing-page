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


  _createItem(id, name, data = {}) {
    return Object.assign(data, {
      id: id,
      name: name,
      isSelected: this.state.selectedItemName === name,
      onClick: () => this._selectItem(id)
    });
  }

  _getSelectedLayerById(id) {
    //todo
    return id;
  }

  _selectItem(id) {
    this.setState({
      selectedItemId: id,
    });

    const layer = this._getSelectedLayerById(id);
    this.props.onLayerSelect(layer)
  };

  _getSidebarItems() {
    const tmsItems = this.props.layers.tms.manifest.services.map((service) => {
      const id = "tms/" + service.id;
      const name = service.human_readable ? service.human_readable : service.id;
      return this._createItem(id, name);
    });
    const tiles = this._createItem("tms", "Tile Layers", {
      icon: <EuiIcon type="logoElasticSearch"/>,
      items: tmsItems
    });

    const fileItems = this.props.layers.file.manifest.layers.map((service) => {
      const id = "file/" + service.id;
      const name = service.name;
      return this._createItem(id, name);
    });
    const files = this._createItem("file", "File Layers", {
      icon: <EuiIcon type="logoKibana"/>,
      items: fileItems
    });

    return [tiles, files];
  }
}