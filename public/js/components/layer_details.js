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

export class LayerDetails extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.layerConfig) {
      return null;
    }
    const attributionsHtmlString = getAttributionString(this.props.layerConfig);
    return (
      <div>
        <EuiTitle size="s">
          <h2>Selected {this.props.title}: {this.props.layerConfig.getDisplayName()}</h2>
        </EuiTitle>
        <EuiText size="s">
          <EuiBadge>Layer Id: {this.props.layerConfig.getId()}</EuiBadge>
          <EuiSpacer size="xs" />
          <span dangerouslySetInnerHTML={{ __html: attributionsHtmlString }} className="attribution"/>
        </EuiText>
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
