import React, {
Component, Fragment
} from 'react';

import {
EuiPage,
EuiPageBody,
EuiPageContent,
EuiPageContentBody,
EuiPanel,
EuiPageSideBar,
EuiSpacer,
EuiIcon,
EuiSideNav,
EuiImage,
EuiText,
EuiBasicTable
} from '@elastic/eui';

import MarkdownIt from 'markdown-it';
const markdownIt = new MarkdownIt({
  html: false,
  linkify: true
});

export class LayerDetails extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.layerConfig){
      return null;
    }

    const attributions = this.props.layerConfig.attribution.split('|');
    const htmlAttributions = attributions.map((attribution) => {
      attribution = attribution.trim();
      return markdownIt.render(attribution);
    });
    const attributionsHtmlString = htmlAttributions.join();

    return (

    <div>
      <EuiText>
      <dl>
        <dt>Name</dt>
        <dd>{this.props.layerConfig.name}</dd>
        <dt>Attribution</dt>
        <dd dangerouslySetInnerHTML={{__html: attributionsHtmlString}} className="attribution"></dd>
        <dt>Download</dt>
        <dd><a href={this.props.layerConfig.url}>geojson</a></dd>
      </dl>
      </EuiText>
    </div>
    );
  }

}

