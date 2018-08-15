import React, { Component } from 'react';

import {
  EuiButton,
  EuiInMemoryTable,
} from '@elastic/eui';


export class FeatureTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentFilter: ''
    };

    this._changeFilter = (query) => {
      this.setState({
        currentFilter: query.queryText
      });
      this.props.onFilterChange(this.getFilteredFeatures(query.queryText));
    };
  }

  getFilteredFeatures(filter) {

    if (!this.props.jsonFeatures) {
      return [];
    }

    filter = filter ? filter : '';
    const filterNormalized = filter.toLowerCase();
    const passes = [];
    for (let i = 0; i < this.props.jsonFeatures.features.length; i++) {
      const feature = this.props.jsonFeatures.features[i];
      for (let j = 0; j < this.props.config.fields.length; j++) {
        const field = this.props.config.fields[j];
        const fieldValue = feature.properties[field.name];
        const stringifiedFieldValue = JSON.stringify(fieldValue);
        if (!stringifiedFieldValue) {
          continue;
        }
        const fieldValueNormalized = stringifiedFieldValue.toLowerCase();
        if (fieldValueNormalized.indexOf(filterNormalized) > -1) {
          passes.push(feature);
          break;
        }
      }
    }
    return passes;
  }

  _getRows() {
    const passes = this.getFilteredFeatures(this.state.currentFilter);
    return passes.map((feature) => feature.properties);
  }

  _getColumns() {
    return this.props.config.fields.map(field => ({
      field: field.name,
      name: `${field.description} (${field.name})`,
      sortable: true,
    }));
  }

  startLoading() {
    this.setState({
      loading: true
    });
  }

  stopLoading() {
    this.setState({
      loading: false
    });
  }

  _renderToolsRight() {
    let humanReadableFormat;
    if (this.props.config.format === 'geojson') {
      humanReadableFormat = 'GeoJSON';
    } else if (this.props.config.format === 'topojson') {
      humanReadableFormat = 'TopoJSON';
    } else {
      humanReadableFormat = this.props.config.format;
    }
    return (
      <EuiButton href={this.props.config.url} target="_">
        Download {humanReadableFormat}
      </EuiButton>
    );
  }

  render() {

    if (!this.props.jsonFeatures) {
      return (<EuiInMemoryTable
        loading={this.state.loading}
        items={[]}
        columns={[]}
        pagination={{}}
        hasActions
      />);
    }

    const rows = this._getRows();
    const columns = this._getColumns();

    const search = {
      toolsRight: this._renderToolsRight(),
      box: {
        incremental: true
      },
      onChange: this._changeFilter
    };

    const pagination = {
      initialPageSize: 50,
      pageSizeOptions: [50],
    };

    const rowProps = (row) => {
      return {
        onClick: () => {
          const feature = this.props.jsonFeatures.features[row.__id__];
          this.props.onShow(feature);
        }
      };
    };
    return (
      <EuiInMemoryTable
        rowProps={rowProps}
        loading={this.state.loading}
        items={rows}
        columns={columns}
        search={search}
        pagination={pagination}
        sorting
      />
    );
  }
}
