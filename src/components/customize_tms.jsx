/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { TMSService } from '@elastic/ems-client/target/node';
import React, { PureComponent } from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiColorPicker,
  EuiComboBox,
  EuiPanel,
} from '@elastic/eui';

import { supportedLanguages, supportedLabelModes } from './app';

export class CustomizeTMS extends PureComponent {
  constructor(props) {
    super(props);

    this._onLanguageChange = (selectedOptions) => {
      const lang = selectedOptions[0];

      if (lang) {
        this.props.onLanguageChange(lang.key);
      }
    };

    this._onLabelChange = (selectedOptions) => {
      const mode = selectedOptions[0];

      if (mode) {
        this.props.onLabelModeChange(mode.key);
      }
    };
  }

  render() {
    const config = this.props?.layerConfig;

    if (!(config && config instanceof TMSService)) {
      return null;
    }

    const selectedLangOptions = supportedLanguages.filter(l => l.key === this.props.language);
    const selectedLabelOptions = supportedLabelModes.filter(l => l.key === this.props.labelMode);

    return (
      <EuiForm component="form">
        <EuiFlexGroup gutterSize={'s'}>
          <EuiFlexItem>
            <EuiPanel hasShadow={false} hasBorder paddingSize="m">
              <EuiFormRow label="Select language" helpText="Select the language for the basemap. Non-translated labels will fallback to defaults.">
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
          <EuiFlexItem>
            <EuiPanel hasShadow={false} hasBorder paddingSize="m">
              <EuiFormRow label="Label display" helpText="Show the basemap with labels, labels only, or the basemap without labels.">
                <EuiComboBox
                  compressed
                  isClearable={false}
                  singleSelection={{ asPlainText: true }}
                  options={supportedLabelModes}
                  selectedOptions={selectedLabelOptions}
                  onChange={this._onLabelChange}
                />
              </EuiFormRow>
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiPanel hasShadow={false} hasBorder paddingSize="m">
              <EuiFormRow label="Pick a color" helpText="Choose a color filter to apply to the basemap.">
                <EuiColorPicker
                  compressed
                  isClearable={true}
                  onChange={this.props.onColorChange}
                  color={this.props.color}
                  format="hex"
                  secondaryInputDisplay="top"
                  placeholder="No filter"
                />
              </EuiFormRow>
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiForm>
    );
  }
}
