/** @jsxImportSource @emotion/react */
/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiIcon, EuiTextColor, EuiToolTip, useEuiTheme } from '@elastic/eui';
import { css } from '@emotion/react';
import React from 'react';

export function EmsHeaderLogo({ href, serviceName, emsVersion }) {
  const { euiTheme } = useEuiTheme();
  return (
    <EuiToolTip delay="long" content={`EMS version: ${emsVersion}`}>
      <a
        href={href}
        className="euiHeaderLogo"
        aria-label={`${serviceName} home`}
        css={css`
          &:hover { background-color: ${euiTheme.components.buttons.backgroundEmptyTextHover}; }
          &:active { background-color: ${euiTheme.components.buttons.backgroundEmptyTextActive}; }
        `}
      >
        <EuiIcon type="emsApp" size="l" className="euiHeaderLogo__icon" />
        <EuiTextColor color="default" className="euiHeaderLogo__text">
          {serviceName}
        </EuiTextColor>
      </a>
    </EuiToolTip>
  );
}
