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
  EuiRange
} from '@elastic/eui';

export class CustomizeTMS extends PureComponent {
  constructor(props) {
    super(props);

    const supportedLanguages = Object.keys(TMSService.SupportedLanguages).map(key => {
      const lang = TMSService.SupportedLanguages[key];
      return {
        label: lang.label,
        key,
        code: lang.omtCode
      }
    })

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
      selectedLanguage: supportedLanguages.find(v => v.key === 'en'),
      selectedColor: this.props.color,
      selectedColorOp: { label: this.props.colorOp },
      selectedPercentage: this.props.percentage
    }


    this._onLanguageChange = (selectedOptions) => {
      const lang = selectedOptions[0];

      if (lang) {
        this.setState(() => {
          return {
            selectedLanguage: lang
          }
        }, () => {
          this.props.onLanguageChange(lang.key);
        })
      }
    }

    this._onColorChange = (color) => {
      console.log(color);
      this.setState(() => {
        return {
          selectedColor: color
        }
      }, () => {
        this.props.onColorChange(color);
      });
    } 

    this._onColorOpChange = (selectedOptions) => {
      const colorOp = selectedOptions[0];
      if (colorOp) {
        this.setState(() => {
          return {
            selectedColorOp: colorOp
          }
        }, () => {
          this.props.onColorOpChange(colorOp.label);
        });
      }
    }

    this._onPercentageChange = (e) => {
      console.log(e.target.value);
      this.setState(() => {
        return {
          selectedPercentage: e.target.value
        }
      }, () => {
        this.props.onPercentageChange(parseFloat(e.target.value));
      });
    }
  }

  render() {
    const config = this.props?.layerConfig;

    if (!(config && config instanceof TMSService)) {
      return null;
    }

    return (
      <EuiFlexGroup>
        <EuiFlexItem>
          <EuiFormRow label="Language" helpText="Select the language of the basemap labels">
            <EuiComboBox
              isClearable={false}
              singleSelection={{ asPlainText: true }}
              options={this.state.supportedLanguages}
              selectedOptions={[this.state.selectedLanguage]}
              onChange={this._onLanguageChange}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Pick a color" helpText="Choose a color to modify the basemap">
            <EuiColorPicker
              onChange={this._onColorChange}
              color={this.props.color}
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFormRow label="Pick a blend method" helpText="Select an operation to apply to the color">
            <EuiComboBox
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
          <EuiFormRow label="Select a mix percentage" helpText="Define how much of the color to mix">
            <EuiRange
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
    );
  }
}
