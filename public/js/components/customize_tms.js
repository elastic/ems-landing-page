/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { TMSService } from '@elastic/ems-client/target/node';
import React, { Fragment, PureComponent} from 'react';
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiForm,
  EuiFormRow,
  EuiDescribedFormGroup,
  EuiColorPicker,
  EuiComboBox,
  EuiPanel,
  EuiTabbedContent,
  EuiTitle,
} from '@elastic/eui';

import { supportedLanguages, supportedlabelModes } from './app';

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
    const selectedLabelOptions = supportedlabelModes.filter(l => l.key === this.props.labelMode);


    /* basemap labels tabs */

    const tabs = [
      {
        id: 'labels-language',
        name: 'Language',
        content: (
          <Fragment>
            <EuiDescribedFormGroup
              title={<h4>Language</h4>}
              description={
                <p>
                    Select the language for
                    the basemap. Non-translated
                    labels will fallback to defaults.
                </p>
              }
              style={{ marginTop: '1em' }}
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
          </Fragment>
        )
      },
      {
        id: 'labels-mode',
        name: 'Mode',
        content: (
          <Fragment>
            <EuiDescribedFormGroup
              title={<h4>Mode</h4>}
              description={
                <p>
                    Select if labels should show normally, only show labels, or hide them completely.
                </p>
              }
              style={{ marginTop: '1em' }}
            >
              <EuiFormRow label="Select mode">
                <EuiComboBox
                  compressed
                  isClearable={false}
                  singleSelection={{ asPlainText: true }}
                  options={supportedlabelModes}
                  selectedOptions={selectedLabelOptions}
                  onChange={this._onLabelChange}
                />
              </EuiFormRow>
            </EuiDescribedFormGroup>
          </Fragment>
        )
      },
    ];
    
    return (
      <EuiForm component="form">
        <EuiFlexGroup gutterSize={'s'}>
          <EuiFlexItem>
            <EuiPanel hasShadow={false} hasBorder paddingSize="m">
              <EuiTitle size="xs">
                <h3>Basemap labels</h3>
              </EuiTitle>
              <EuiTabbedContent
                tabs={tabs}
                initialSelectedTab={tabs[1]}
                autoFocus='selected'
                size='s'
              />
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



