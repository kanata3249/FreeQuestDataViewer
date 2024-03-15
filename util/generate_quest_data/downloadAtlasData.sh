#!/bin/sh

mkdir -p atlas
curl -o atlas/0_nice_war.json -z atlas/0_nice_war.json "https://api.atlasacademy.io/export/JP/nice_war.json"
