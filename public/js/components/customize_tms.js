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
  EuiComboBox,
  EuiPanel,
  EuiTitle
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

    const selectedOptions = supportedLanguages.filter(l => l.key === this.props.language);

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
                selectedOptions={selectedOptions}
                onChange={this._onLanguageChange}
              />
            </EuiFormRow>
          </EuiPanel>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
