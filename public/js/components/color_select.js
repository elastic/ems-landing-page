/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { PureComponent } from 'react';

import {
  EuiColorPicker,
  EuiFormRow,
} from '@elastic/eui';

export class ColorSelect extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.onColorChange) {
      return null;
    }

    const isDisabled = this.props?.layerConfig._config.id !== 'road_map_desaturated';

    return (
      <EuiFormRow
        isDisabled={isDisabled}
        className="colorPicker"
        label="Pick a color"
      >
        <EuiColorPicker
          compressed={true}
          onChange={this.props.onColorChange}
          color={this.props.color}
        />
      </EuiFormRow>
    );
  }
}