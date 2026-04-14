#!/bin/sh

pnpm get-data
pnpm gen-data
pnpm apply-data

pnpm gen-dropdata
pnpm get-dropdata
node diff-dropdata.js 0.1 \
  && echo dropdata updated \
  && pnpm apply-dropdata

