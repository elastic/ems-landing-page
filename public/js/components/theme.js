/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiThemeAmsterdam } from '@elastic/eui';
import { EuiThemeBorealis } from '@elastic/eui-theme-borealis';

const DEFAULT_EUI_THEME = 'amsterdam';

const themes = {
  amsterdam: EuiThemeAmsterdam,
  borealis: EuiThemeBorealis,
};

// eslint-disable-next-line no-undef
const EUI_THEME = process.env?.EUI_THEME || DEFAULT_EUI_THEME;

export const eui = {
  name: EUI_THEME,
  theme: themes[EUI_THEME],
  light_style:
    EUI_THEME === 'amsterdam'
      ? 'road_map_desaturated'
      : 'road_map_desaturated_v9',
  dark_style: EUI_THEME === 'amsterdam' ? 'dark_map' : 'dark_map_v9'
};
