/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { TMSService } from '@elastic/ems-client';
import React, { PureComponent } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiColorPicker,
  EuiComboBox,
  EuiRange,
  EuiPanel,
  EuiTitle
} from '@elastic/eui';

import { supportedLanguages } from './app';

const blendOperations = ['screen', 'overlay', 'multiply', 'darken', 'lighten', 'burn', 'dodge', 'mix'].map((label) =>{
  return { label };
});

export class CustomizeTMS extends PureComponent {
  constructor(props) {
    super(props);

    this._onLanguageChange = (selectedOptions) => {
      const lang = selectedOptions[0];

      if (lang) {
        this.props.onLanguageChange(lang.key);
      }
    };

    this._onColorChange = (color) => {
      this.props.onColorChange(color);
    };

    this._onColorOpChange = (selectedOptions) => {
      const colorOp = selectedOptions[0];
      if (colorOp) {
        this.props.onColorOpChange(colorOp.label);
      }
    };

    this._onPercentageChange = (e) => {
      this.props.onPercentageChange(parseFloat(e.target.value));
    };
  }


  render() {
    const config = this.props?.layerConfig;

    if (!(config && config instanceof TMSService)) {
      return null;
    }

    const selectedLangOptions = supportedLanguages.filter(l => l.key === this.props.language);
    const selectedBlendOptions = blendOperations.filter(l => l.label === this.props.colorOp);
    const shouldPercentageBeEnabled = this.props.color != null &&  this.props.colorOp === 'mix';

    return (
      <EuiFlexGroup gutterSize={'s'}>
        <EuiFlexItem grow={false}>
          <EuiPanel hasShadow={false} hasBorder paddingSize="m">
            <EuiTitle size="xs" className="formTitle"><h3>Labels</h3></EuiTitle>
            <EuiFormRow label="Language" helpText="Select the language of the basemap labels" display="rowCompressed">
              <EuiComboBox
                compressed
                isClearable={false}
                singleSelection={{ asPlainText: true }}
                options={supportedLanguages}
                selectedOptions={selectedLangOptions}
                onChange={this._onLanguageChange}
              />
            </EuiFormRow>
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiPanel hasShadow={false} hasBorder paddingSize="m">
            <EuiTitle size="xs" className="formTitle"><h3>Color blending</h3></EuiTitle>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiFormRow label="Color" helpText="Choose a color to modify the basemap" display="rowCompressed">
                  <EuiColorPicker
                    compressed
                    isClearable={true}
                    onChange={this._onColorChange}
                    color={this.props.color}
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow label="Blend method" helpText="Select an operation to apply to the color" display="rowCompressed">
                  <EuiComboBox
                    compressed
                    isClearable={false}
                    singleSelection={{ asPlainText: true }}
                    options={blendOperations}
                    selectedOptions={selectedBlendOptions}
                    onChange={this._onColorOpChange}
                    isDisabled={!this.props.color}
                  />
                </EuiFormRow>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiFormRow label="Mix percentage" helpText="Define how much of the color to mix" display="rowCompressed" >
                  <EuiRange
                    compressed
                    id="percentageRange"
                    showLabels
                    showValue
                    min={0}
                    max={1}
                    step={0.05}
                    value={this.props.percentage}
                    onChange={this._onPercentageChange}
                    disabled={!shouldPercentageBeEnabled}
                  />
                </EuiFormRow>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}



