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
    const cols = this.props.config.fields.map(field => ({
      field: field.name,
      name: `${field.description} (${field.name})`,
      sortable: true,
    }));

    cols.push({
      name: '',
      render: (properties) => {
        const showOnMap = () => {
          const feature = this.props.jsonFeatures.features[properties.__id__];
          this.props.onShow(feature);
        };
        return (<a onClick={showOnMap}>Show on map</a>);
      }
    });

    return cols;
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
    return (
      <EuiButton href={this.props.config.url} target="_">
        Download {this.props.config.format}
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
    console.table(rows);
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

    return (
      <EuiInMemoryTable
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
