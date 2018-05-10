import React, { Component } from 'react';

import {
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
        currentFilter: query.text
      });
      this.props.onFilterChange(this.getFilteredFeatures(query.text));
    };
  }

  getFilteredFeatures(filter) {
    const filterNormalized = filter.toLowerCase();
    const passes = [];
    for (let i = 0; i < this.props.jsonFeatures.features.length; i++) {
      const feature = this.props.jsonFeatures.features[i];
      for (let j = 0; j < this.props.config.fields.length; j++) {
        const field = this.props.config.fields[j];
        const fieldValue = feature.properties[field.name];
        const fieldValueNormalized = JSON.stringify(fieldValue).toLowerCase();
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
    const actions = [{
      name: 'Show',
      description: 'show on layer',
      icon: 'bullseye',
      onClick: (c) => {
        const feature = this.props.jsonFeatures.features[c.__id__];
        this.props.onShow(feature);
      },
    }];

    cols.push({
      name: '',
      actions,
    });

    return cols;
  }

  render() {

    if (this.props.jsonFeatures === null) {
      return null;
    }

    const rows = this._getRows();
    const columns = this._getColumns();

    const search = {
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
        items={rows}
        columns={columns}
        search={search}
        pagination={pagination}
        sorting
        hasActions
      />
    );
  }
}
