#!/usr/bin/bash
/* eslint-disable no-console */

// disabling building temporarily to not break backstage plugins release job
// https://github.com/janus-idp/backstage-plugins/actions/runs/9255511136/job/25459744222#step:4:4465
// command should be: webpack --progress
echo "build temporarily disabled"; mkdir -p dist/
