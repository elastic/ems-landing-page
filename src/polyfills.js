/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 *
 * Must load before main.jsx so dependency chunks (e.g. @elastic/ems-client → lru-cache → pseudomap)
 * see process and Buffer when they execute.
 */
import process from 'process';
import { Buffer } from 'buffer';
globalThis.process = process;
globalThis.Buffer = Buffer;
