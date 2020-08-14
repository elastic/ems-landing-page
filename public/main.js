/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import './main.css';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import 'whatwg-fetch';
import App from './js/components/app';

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('wrapper')
);

