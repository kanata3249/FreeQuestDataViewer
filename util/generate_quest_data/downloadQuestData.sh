#!/bin/sh

SPREADSHEET_ID="1vrzaY3X6ZpyeQwaPP4afrxqlV109jxOX"

curl -o 1_chapter.csv "https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=1703097415&tqx=out:csv"
curl -o 2_area.csv "https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=325084492&tqx=out:csv"
curl -o 3_enemy.csv "https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=870800992&tqx=out:csv"
curl -o 4_quest.csv "https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=1705764738&tqx=out:csv"
curl -o 5_quest_enemy.csv "https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?gid=547284521&tqx=out:csv"