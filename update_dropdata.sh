cd util/generate_quest_data
yarn get-dropdata
yarn gen-dropdata
node diff-dropdata.js 0.0 \
  && echo dropdata updated \
  && cp dropdata.json ../../src/fgo
