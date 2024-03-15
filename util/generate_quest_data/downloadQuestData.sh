#!/bin/sh

SPREADSHEET_ID="1hcTm8x1ipr8y4LWWjkrLf6oS0Jkz16YQ"

curl -o input/1_chapter.csv "https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=1703097415&tqx=out:csv"
curl -o input/2_area.csv "https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=325084492&tqx=out:csv"
curl -o input/3_quest.csv "https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=1705764738&tqx=out:csv"
