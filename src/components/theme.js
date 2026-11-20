/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiThemeBorealis } from '@elastic/eui-theme-borealis';

export const eui = {
  name: 'borealis',
  theme: EuiThemeBorealis,
  // Basemap ids by color mode, in order of preference. Manifests older than 9.0 only have the last one.
  styles: {
    light: ['road_map_desaturated_v9', 'road_map_desaturated'],
    dark: ['dark_map_v9', 'dark_map'],
  },
};

export function findBaseStyle(tmsServices, colorMode) {
  for (const id of eui.styles[colorMode]) {
    const service = tmsServices.find((s) => s.getId() === id);
    if (service) {
      return service;
    }
  }
  return undefined;
}
