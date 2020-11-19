/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

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
    const fields = this.props.config.getFieldsInLanguage();
    for (let i = 0; i < this.props.jsonFeatures.features.length; i++) {
      const feature = this.props.jsonFeatures.features[i];
      for (let j = 0; j < fields.length; j++) {
        const field = fields[j];
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
    return this.props.config.getFieldsInLanguage().map(field => ({
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
    const format = this.props.config.getFormatOfType('geojson');
    if (format === 'geojson') {
      humanReadableFormat = 'GeoJSON';
    } else if (format === 'topojson') {
      humanReadableFormat = 'TopoJSON';
    } else {
      humanReadableFormat = format;
    }
    return (
      <EuiButton href={this.props.config.getFormatOfTypeUrl('geojson')} target="_">
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
