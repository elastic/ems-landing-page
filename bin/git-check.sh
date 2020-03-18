#!/bin/bash

#
# Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
# or more contributor license agreements. Licensed under the Elastic License;
# you may not use this file except in compliance with the Elastic License.
#

set -e
set +x

dirty=`git status --porcelain`

if [[ -n "$dirty" ]]; then
  echo -e "Git working directory not clean:\n$dirty"
  exit 1
fi

exit 0
