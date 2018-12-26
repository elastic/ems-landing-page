import React, { PureComponent } from 'react';

import {
  EuiText,
  EuiTitle,
} from '@elastic/eui';

export class LayerDetails extends PureComponent {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.layerConfig) {
      return null;
    }
    const attributionsHtmlString = this.props.layerConfig.getHTMLAttribution();
    return (
      <div>
        <EuiTitle size="s">
          <h2>{this.props.layerConfig.getDisplayName()}</h2>
        </EuiTitle>
        <EuiText size="s">
          <span dangerouslySetInnerHTML={{ __html: attributionsHtmlString }} className="attribution"/>
        </EuiText>
      </div>
    );
  }
}

