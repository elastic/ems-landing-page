import React, { Component } from 'react';

import {
  EuiText,
  EuiTitle,
} from '@elastic/eui';

import MarkdownIt from 'markdown-it';

const markdownIt = new MarkdownIt({
  html: false,
  linkify: true,
});

export class LayerDetails extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.layerConfig) {
      return null;
    }

    const attributions = this.props.layerConfig.attribution.split('|');
    const htmlAttributions = attributions.map((attribution) => {
      attribution = attribution.trim();
      const html = markdownIt.render(attribution);
      return html.trim();
    });
    const attributionsHtmlString = htmlAttributions.join(', ');

    return (
      <div>
        <EuiTitle size="s">
          <h2>{this.props.layerConfig.name}</h2>
        </EuiTitle>
        <EuiText size="s">
          <span dangerouslySetInnerHTML={{ __html: attributionsHtmlString }} className="attribution"/>
        </EuiText>
      </div>
    );
  }
}

