import React, { Component } from 'react';

import {
  EuiText
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
        <EuiText>
          <dl>
            <dt>Name</dt>
            <dd>{this.props.layerConfig.name}</dd>
            <dt>Attribution</dt>
            <dd dangerouslySetInnerHTML={{ __html: attributionsHtmlString }} className="attribution" />
            <dt>Report</dt>
            <dd>placeholder for some blurb and link to repo with source data and instructions to report issues.</dd>
          </dl>
        </EuiText>
      </div>
    );
  }
}

