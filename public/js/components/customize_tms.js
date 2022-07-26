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
  EuiForm,
  EuiFormRow,
  EuiDescribedFormGroup,
  EuiColorPicker,
  EuiComboBox,
  EuiPanel,
} from '@elastic/eui';

import { supportedLanguages } from './app';

export class CustomizeTMS extends PureComponent {
  constructor(props) {
    super(props);

    this._onLanguageChange = (selectedOptions) => {
      const lang = selectedOptions[0];

      if (lang) {
        this.props.onLanguageChange(lang.key);
      }
    };

  }


  render() {
    const config = this.props?.layerConfig;

    if (!(config && config instanceof TMSService)) {
      return null;
    }

    const selectedLangOptions = supportedLanguages.filter(l => l.key === this.props.language);

    return (
      <EuiForm component="form">
        <EuiFlexGroup gutterSize={'s'}>
          <EuiFlexItem>
            <EuiPanel hasShadow={false} hasBorder paddingSize="m">
              <EuiDescribedFormGroup
                title={<h3>Basemap labels</h3>}
                description={
                  <p>
                    Select the language for
                    the basemap. Non-translated
                    labels will fallback to defaults.
                  </p>
                }
              >
                <EuiFormRow label="Select language">
                  <EuiComboBox
                    compressed
                    isClearable={false}
                    singleSelection={{ asPlainText: true }}
                    options={supportedLanguages}
                    selectedOptions={selectedLangOptions}
                    onChange={this._onLanguageChange}
                  />
                </EuiFormRow>
              </EuiDescribedFormGroup>
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiPanel hasShadow={false} hasBorder paddingSize="m">
              <EuiDescribedFormGroup
                title={<h3>Color filter</h3>}
                description={
                  <p>
                    Choose a color filter to apply
                    to the basemap.
                  </p>
                }
              >
                <EuiFormRow label="Pick a color">
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
              </EuiDescribedFormGroup>
            </EuiPanel>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiForm>
    );
  }
}



