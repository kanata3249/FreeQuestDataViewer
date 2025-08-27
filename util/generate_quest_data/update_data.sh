#!/bin/sh

yarn get-data
yarn gen-data
yarn apply-data

yarn gen-dropdata
yarn get-dropdata
node diff-dropdata.js 0.1 \
  && echo dropdata updated \
  && yarn apply-dropdata

