import React, { FC } from 'react'
import { isMobile } from 'react-device-detect'

import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'

type Props = {
  questId: number
  questData(id: number): {
    id: number
    rawId: number
    chapterId: number
    chapter: string
    name: string
    lv: number
    ap: number
    bond: number
    exp: number
    qp: number
    drop: { id: number, group: string, name: string, rate: number }[]
    attributes: string
    enemies: [
      [
        {
          name: string
          class: string
          lv: number
          hp: number
          buff: string
          dr: string
          attributes: string
          characteristics: string
        }
      ]
    ]
  }
}

const headCellSx = {
  backgroundColor: 'common.black',
  color: 'common.white',
  fontSize: 14,
  p: 0.5,
  px: 1.25,
}
const bodyCellSx = {
  fontSize: 14,
  p: 0.5,
  px: 1.25,
  border: 0,
}
const secondaryBodyCellSx = { ...bodyCellSx, fontSize: 11 }
const oddBodyCellSx = { ...bodyCellSx, backgroundColor: 'action.hover' }
const oddSecondaryBodyCellSx = { ...secondaryBodyCellSx, backgroundColor: 'action.hover' }

const aliasForLv = {
  91: '90+',
  92: '90++',
  93: '90+++',
  94: '90★',
  95: '90★★',
  96: '90★★★',
  101: '100+',
  102: '100++',
  103: '100+++',
  104: '100★',
  105: '100★★',
  106: '100★★★'
}
const formatLv = (value: number) => aliasForLv[value] || value
const formatNumber = (value: number) => Number(value).toLocaleString().padStart(6 + 1, String.fromCharCode(0xa0))
const formatDR = (value: number) => `${value}%`

type TableColumnInfo = {
  label: string
  key: string
  align: "left" | "right" | "center"
  width: string
  formatter?: (value: number) => string
  span?: number
}
const questInfoTableColumns : TableColumnInfo[] = [
  { label: 'Lv', key: 'lv', align: "left", width: "10%", formatter: formatLv },
  { label: 'AP', key: 'ap', align: "left", width: "10%" },
  { label: '絆', key: 'bond', align: "left", width: "10%" },
  { label: 'Exp', key: 'exp', align: "left", width: "10%" },
  { label: 'QP', key: 'qp', align: "left", width: "10%" },
  { label: '', key: 'notdef', align: "left", width: "5%" },
  { label: '地形', key: 'attributes', align: "left", width: "40%" },
]

const enemyInfoTableColumnsPC : TableColumnInfo[][] = [[
  { label: 'Name', key: 'name', align: "left", width: "20%" },
  { label: '', key: 'class', align: "left", width: "5%" },
  { label: 'DR', key: 'dr', align: "center", width: "5%", formatter: formatDR},
  { label: 'HP', key: 'hp', align: "left", width: "10%", formatter: formatNumber },
  { label: '属性', key: 'attributes', align: "left", width: "10%" },
  { label: '特性', key: 'characteristics', align: "left", width: "20%" },
  { label: 'Buff', key: 'buff', align: "left", width: "15%" },
]]

const enemyInfoTableColumnsSP : TableColumnInfo[][] = [
  [
    { label: 'Name', key: 'name', align: "left", width: "50%", span: 3},
    { label: 'Buff', key: 'buff', align: "left", width: "20%" },
    { label: 'HP', key: 'hp', align: "right", width: "20%", formatter: formatNumber },
  ],
  [
    { label: 'Class', key: 'class', align: "left", width: "10%" },
    { label: 'DR', key: 'dr', align: "left", width: "10%", formatter: formatDR },
    { label: '属性', key: 'attributes', align: "left", width: "10%" },
    { label: '特性', key: 'characteristics', align: "left", width: "40%", span: 2 },
  ]
]

export const QuestViewer: FC<Props> = (props) => {
  const questData = props.questData(props.questId)

  if (!questData) {
    return (
      <></>
    )
  }
  const enemyInfoTableColumns = isMobile ? enemyInfoTableColumnsSP : enemyInfoTableColumnsPC
  const cellSx = [[bodyCellSx, secondaryBodyCellSx], [oddBodyCellSx, oddSecondaryBodyCellSx]]

  return (
    <div style={{ boxSizing: "border-box", width: "100%", padding: 6 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow key="label">
              {questInfoTableColumns.map((column, idx) =>
                <TableCell sx={headCellSx} key={idx} width={column.width}>{column.label}</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow key={props.questId}>
              {questInfoTableColumns.map((column) =>
                <TableCell sx={bodyCellSx} key={column.key} align={column.align} width={column.width}>
                  {column.formatter ? column.formatter(questData[column.key]) : questData[column.key]}
                </TableCell>
              )}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <p></p>
      <TableContainer>
        {!isMobile &&
          <Table>
            <TableHead>
              {enemyInfoTableColumns.map((row, rowIdx) =>
                <TableRow key={`label-${rowIdx}`}>
                  {row.map((column) =>
                    <TableCell sx={headCellSx} key={column.label} width={column.width} colSpan={column.span ? column.span : 1}>{column.label}</TableCell>
                  )}
                </TableRow>
              )}
            </TableHead>
          </Table>
        }
        {questData.enemies.map( (wave, waveNo) => (
          <div key={`div-${waveNo}`}>
          <Box component="p" sx={{ backgroundColor: 'common.black', color: 'common.white', mb: 0 }}>w{waveNo + 1}</Box>
          <Table>
            <TableBody>
              {wave.map( (enemy, enemyNo) => (
                enemyInfoTableColumns.map((row, rowNo) =>
                  <TableRow key={`${waveNo}-${enemyNo}-${rowNo}`}>
                    {row.map((column, columnNo) =>
                      <TableCell sx={cellSx[enemyNo % 2][rowNo == 0 ? 0 : 1]} key={`${waveNo}-${enemyNo}-${columnNo}`} align={column.align} width={column.width} colSpan={column.span ? column.span : 1}>
                        {column.formatter ? column.formatter(enemy[column.key]) : enemy[column.key]}
                      </TableCell>
                    )}
                  </TableRow>
                )
              ))}
            </TableBody>
          </Table>
          </div>
        ))}
        <Table>
          <TableHead>
            <TableRow><TableCell sx={headCellSx}>ドロップ率(参考)</TableCell></TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={bodyCellSx}>
                {questData.drop
                  .filter((drop) => drop.group.match("素材"))
                  .map((drop) => `${drop.name}: ${drop.rate}%`).join(" ")}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={bodyCellSx}>
                {questData.drop
                  .filter((drop) => drop.group == "スキル石")
                  .map((drop) => `${drop.name}: ${drop.rate}%`).join(" ")}
              </TableCell>
            </TableRow>
            {questData.drop.find((drop) => drop.group == "モニュメント・ピース") &&
              <TableRow>
                <TableCell sx={bodyCellSx}>
                  {questData.drop
                    .filter((drop) => drop.group == "モニュメント・ピース")
                    .map((drop) => `${drop.name}: ${drop.rate}%`).join(" ")}
                </TableCell>
              </TableRow>
            }
            {questData.drop.find((drop) => drop.group == "種火") &&
              <TableRow>
                <TableCell sx={bodyCellSx}>
                  {questData.drop
                    .filter((drop) => drop.group == "種火")
                    .map((drop) => `${drop.name}: ${drop.rate}%`).join(" ")}
                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}
