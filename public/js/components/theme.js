/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiThemeAmsterdam } from '@elastic/eui';
import { EuiThemeBorealis } from '@elastic/eui-theme-borealis';

const DEFAULT_EUI_THEME = EuiThemeAmsterdam;

const themes = {
  amsterdam: EuiThemeAmsterdam,
  borealis: EuiThemeBorealis,
};

// eslint-disable-next-line no-undef
const EUI_THEME = process.env?.EUI_THEME;

export const theme =
  EUI_THEME && EUI_THEME in themes ? themes[EUI_THEME] : DEFAULT_EUI_THEME;
