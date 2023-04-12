#!/bin/bash

yarn install
yarn tsc

export NODE_ENV=production

yarn build:all

yarn workspace @parodos/plugin-parodos pack
yarn workspace @parodos/plugin-parodos-auth pack