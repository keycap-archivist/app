#!/bin/bash

yarn build
cp package.json dist/package.json
cp yarn.lock dist/yarn.lock
cd dist
yarn
