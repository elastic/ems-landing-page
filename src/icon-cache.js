/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/**
 * Pre-register all EUI icons used in this application.
 * This must be imported before any EUI components are rendered.
 */

import { appendIconComponentCache } from '@elastic/eui/es/components/icon/icon';

// App icons
import { icon as EuiIconEmsApp } from '@elastic/eui/es/components/icon/assets/app_ems';
import { icon as EuiIconWarning } from '@elastic/eui/es/components/icon/assets/warning';
import { icon as EuiIconGithub } from '@elastic/eui/es/components/icon/assets/logo_github';
import { icon as EuiIconElastic } from '@elastic/eui/es/components/icon/assets/logo_elastic';
import { icon as EuiIconBug } from '@elastic/eui/es/components/icon/assets/bug';
import { icon as EuiIconDocuments } from '@elastic/eui/es/components/icon/assets/documents';
import { icon as EuiIconStop } from '@elastic/eui/es/components/icon/assets/stop';
import { icon as EuiIconStopSlash } from '@elastic/eui/es/components/icon/assets/stop_slash';

// Table sorting icons
import { icon as EuiIconSortable } from '@elastic/eui/es/components/icon/assets/sortable';
import { icon as EuiIconSortUp } from '@elastic/eui/es/components/icon/assets/sort_up';
import { icon as EuiIconSortDown } from '@elastic/eui/es/components/icon/assets/sort_down';

// Table of contents icons
import { icon as EuiIconArrowDown } from '@elastic/eui/es/components/icon/assets/arrow_down';
import { icon as EuiIconArrowLeft } from '@elastic/eui/es/components/icon/assets/arrow_left';
import { icon as EuiIconArrowRight } from '@elastic/eui/es/components/icon/assets/arrow_right';
import { icon as EuiIconVector } from '@elastic/eui/es/components/icon/assets/vector';
import { icon as EuiIconGrid } from '@elastic/eui/es/components/icon/assets/grid';
import { icon as EuiIconGlobe } from '@elastic/eui/es/components/icon/assets/globe';
import { icon as EuiIconSearch } from '@elastic/eui/es/components/icon/assets/search';

// ComboBox icons
import { icon as EuiIconEmpty } from '@elastic/eui/es/components/icon/assets/empty';
import { icon as EuiIconCross } from '@elastic/eui/es/components/icon/assets/cross';
import { icon as EuiIconCheck } from '@elastic/eui/es/components/icon/assets/check';
import { icon as EuiIconReturn } from '@elastic/eui/es/components/icon/assets/return';

// Color picker icons
import { icon as EuiIconSwatchInput } from '@elastic/eui/es/components/icon/assets/swatch_input';

appendIconComponentCache({
  // App icons
  emsApp: EuiIconEmsApp,
  warning: EuiIconWarning,
  logoGithub: EuiIconGithub,
  logoElastic: EuiIconElastic,
  bug: EuiIconBug,
  documents: EuiIconDocuments,
  stop: EuiIconStop,
  stopSlash: EuiIconStopSlash,
  
  // Table sorting icons
  sortable: EuiIconSortable,
  sortUp: EuiIconSortUp,
  sortDown: EuiIconSortDown,
  
  // Table of contents icons
  arrowDown: EuiIconArrowDown,
  arrowLeft: EuiIconArrowLeft,
  arrowRight: EuiIconArrowRight,
  vector: EuiIconVector,
  grid: EuiIconGrid,
  globe: EuiIconGlobe,
  search: EuiIconSearch,
  
  // ComboBox icons
  empty: EuiIconEmpty,
  cross: EuiIconCross,
  check: EuiIconCheck,
  'return': EuiIconReturn,
  returnKey: EuiIconReturn,
  
  // Color picker icons
  swatchInput: EuiIconSwatchInput,
});
