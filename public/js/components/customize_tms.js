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

const supportedLanguages = [
  { key: 'default', label: 'Default' },
  { key: 'ar', label: 'العربية' },
  { key: 'de', label: 'Deutsch' },
  { key: 'en', label: 'English' },
  { key: 'es', label: 'Español' },
  { key: 'fr-fr', label: 'Français' },
  { key: 'hi-in', label: 'हिन्दी' },
  { key: 'it', label: 'Italiano' },
  { key: 'ja-jp', label: '日本語' },
  { key: 'ko', label: '한국어' },
  { key: 'pt-pt', label: 'Português' },
  { key: 'ru-ru', label: 'русский' },
  { key: 'zh-cn', label: '简体中文' },
];

export class CustomizeTMS extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      supportedLanguages,
      supportedOperations: [
        { label: 'screen' },
        { label: 'overlay' },
        { label: 'multiply' },
        { label: 'darken' },
        { label: 'lighten' },
        { label: 'burn' },
        { label: 'dodge' },
        { label: 'mix' }
      ],
      selectedLanguage: supportedLanguages.find(l => l.key === this.props.language),
      selectedColor: this.props.color,
      selectedColorOp: { label: this.props.colorOp },
      selectedPercentage: this.props.percentage
    };

    this._onLanguageChange = (selectedOptions) => {
      const lang = selectedOptions[0];

      if (lang) {
        this.setState(() => {
          return {
            selectedLanguage: lang
          };
        }, () => {
          this.props.onLanguageChange(lang.key);
        });
      }
    };

    this._onColorChange = (color) => {
      this.setState(() => {
        return {
          selectedColor: color
        };
      }, () => {
        this.props.onColorChange(color);
      });
    };

    this._onColorOpChange = (selectedOptions) => {
      const colorOp = selectedOptions[0];
      if (colorOp) {
        this.setState(() => {
          return {
            selectedColorOp: colorOp
          };
        }, () => {
          this.props.onColorOpChange(colorOp.label);
        });
      }
    };

    this._onPercentageChange = (e) => {
      this.setState(() => {
        return {
          selectedPercentage: e.target.value
        };
      }, () => {
        this.props.onPercentageChange(parseFloat(e.target.value));
      });
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.colorOp !== this.props.colorOp || prevProps.percentage !== this.props.percentage)
    /*
      rule can be disabled because the state is
      conditionally updated depending on the new props values
      */

    /* eslint-disable react/no-did-update-set-state */ {
      this.setState(() => {
        return {
          selectedColorOp: { label: this.props.colorOp },
          selectedPercentage: parseFloat(this.props.percentage)
        };
      });
    }
    /* eslint-enable react/no-did-update-set-state */
  }

  render() {
    const config = this.props?.layerConfig;

    if (!(config && config instanceof TMSService)) {
      return null;
    }

    return (
      <EuiFlexGroup gutterSize={'s'}>
        <EuiFlexItem grow={false}>
          <EuiPanel hasShadow={false} hasBorder paddingSize="m">
            <EuiTitle size="xs" className="formTitle"><h3>Labels</h3></EuiTitle>
            <EuiFormRow label="Language" helpText="Select the language of the basemap labels" grow={false} display="rowCompressed">
              <EuiComboBox
                compressed
                isClearable={false}
                singleSelection={{ asPlainText: true }}
                options={this.state.supportedLanguages}
                selectedOptions={[this.state.selectedLanguage]}
                onChange={this._onLanguageChange}
              />
            </EuiFormRow>
          </EuiPanel>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiPanel hasShadow={false} hasBorder paddingSize="m">
            <EuiTitle size="xs" className="formTitle"><h3>Color blending</h3></EuiTitle>
            <EuiFlexGroup>
              <EuiFlexItem>
                <EuiFormRow label="Color" helpText="Choose a color to modify the basemap" display="rowCompressed">
                  <EuiColorPicker
                    compressed
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
                    options={this.state.supportedOperations}
                    selectedOptions={[this.state.selectedColorOp]}
                    onChange={this._onColorOpChange}
                    isDisabled={!this.state?.selectedColor}
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
                    value={this.state.selectedPercentage}
                    onChange={this._onPercentageChange}
                    disabled={this.state?.selectedColorOp?.label !== 'mix'}
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
