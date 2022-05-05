/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { PureComponent } from 'react';

import {
  EuiText,
  EuiTitle,
  EuiBadge,
  EuiSpacer
} from '@elastic/eui';
import { FileLayer } from '@elastic/ems-client';
import { CustomizeTMS } from './customize_tms';

export class LayerDetails extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    const config = this.props.layerConfig;

    if (config === null) {
      return null;
    }
    const attributionsHtmlString = 'Attribution: ' + getAttributionString(config);
    const defaultVectorFormat = config instanceof FileLayer ? config.getDefaultFormatType() : null;
    return (
      <div>
        <EuiTitle size="s" className="layerTitle">
          <h2>Selected {this.props.title}: {this.props.layerConfig.getDisplayName()}</h2>
        </EuiTitle>
        <EuiText size="s">
          <EuiBadge>Layer Id: <strong>{this.props.layerConfig.getId()}</strong></EuiBadge>
          {
            defaultVectorFormat ?
              <EuiBadge>
                Default format: <strong>{defaultVectorFormat}</strong>
              </EuiBadge>
              :
              <></>
          }
          <span dangerouslySetInnerHTML={{ __html: attributionsHtmlString }} className="attribution eui-alignMiddle" />
        </EuiText>
        <EuiSpacer />
        <CustomizeTMS
          layerConfig={this.props.layerConfig}
          onLanguageChange={this.props.onLanguageChange}
          onColorChange={this.props.onColorChange}
          onColorOpChange={this.props.onColorOpChange}
          onPercentageChange={this.props.onPercentageChange}
          language={this.props.language}
          color={this.props.color}
          colorOp={this.props.colorOp}
          percentage={this.props.percentage}
        />
      </div>
    );
  }
}

function getAttributionString(emsService) {
  const attributions = emsService.getAttributions();
  const attributionSnippets = attributions.map((attribution) => {
    const anchorTag = document.createElement('a');
    anchorTag.setAttribute('rel', 'noreferrer noopener');
    if (attribution.url.startsWith('http://') || attribution.url.startsWith('https://')) {
      anchorTag.setAttribute('href', attribution.url);
    }
    anchorTag.textContent = attribution.label;
    return anchorTag.outerHTML;
  });
  return attributionSnippets.join(' | '); //!!!this is the current convention used in Kibana
}
