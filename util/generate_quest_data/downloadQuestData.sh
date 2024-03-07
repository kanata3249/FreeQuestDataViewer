#!/bin/sh

SPREADSHEET_ID="1vrzaY3X6ZpyeQwaPP4afrxqlV109jxOX"

curl -o input/1_chapter.csv "https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=1703097415&tqx=out:csv"
curl -o input/2_area.csv "https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=325084492&tqx=out:csv"
curl -o input/3_enemy.csv "https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=870800992&tqx=out:csv"
curl -o input/4_quest.csv "https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=1705764738&tqx=out:csv"
curl -o input/5_quest_enemy.csv "https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=547284521&tqx=out:csv"
