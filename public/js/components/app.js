/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import React from 'react';

import {
  EuiHeader,
  EuiHeaderLink,
  EuiHeaderLinks,
  EuiHeaderSection,
  EuiHeaderSectionItem,
  EuiHeaderLogo,
} from '@elastic/eui';

import { EMSVersion } from './ems_version';

import { Route, Switch } from 'react-router-dom';

export default function App() {
  return (
    <div>
      <EuiHeader>
        <EuiHeaderSection>
          <EuiHeaderSectionItem border="none">
            <EuiHeaderLogo href="#" aria-label="Go to elastic.co" iconType="emsApp">
              Elastic Maps Service
            </EuiHeaderLogo>
          </EuiHeaderSectionItem>
        </EuiHeaderSection>
        <EuiHeaderSection side="right">
          <EuiHeaderLinks>
            <EuiHeaderLink href="https://elastic.co">elastic.co</EuiHeaderLink>
          </EuiHeaderLinks>
        </EuiHeaderSection>
      </EuiHeader>
      <Switch>
        <Route path={['/:version', '/']} component={EMSVersion}/>
      </Switch>
    </div>
  );
}
