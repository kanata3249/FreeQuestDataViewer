import React, { FC, useState } from 'react'

import { Grid, TextField } from '@mui/material'

type DropCount = {
  start: number
  current: number
}

type Props = {
  dropCount: DropCount
  label?: string
  divider: number
  onChangeArg: number
  onChange(arg: number, countData: DropCount): void
  key: string
  noTextLabel: boolean
}

export const DropCounter: FC<Props> = (props) => {
  const [ start, setStart ] = useState(props.dropCount.start)
  const [ current, setCurrent ] = useState(props.dropCount.current)

  const handleStartChanged = (e : React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseInt(e.target.value) || 0
    setStart(newValue)
    if (newValue > current) {
      setCurrent(newValue)
      props.onChange(props.onChangeArg, { start: newValue, current: newValue })
    } else {
      props.onChange(props.onChangeArg, { start: newValue, current })
    }
  }
  const handleCurrentChanged = (e : React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseInt(e.target.value) || 0
    setCurrent(newValue)
    props.onChange(props.onChangeArg, { start, current: newValue })
  }
  const formatRate = (value: number) => (`${Math.floor(value)}.${(Math.floor(value * 100) % 100).toString().padStart(2,"0")}%`)
  const dropRate = (value: number, divider: number) => {
    if (divider) {
      return formatRate((current - start) / divider * 100)
    } else {
      return formatRate(0)
    }
  }

  return (
    <Grid container sx={{ flexDirection: "column", m: 0.25, width: 70 }}>
      {props.label ? <Grid style={{textAlign: "center"}}>{props.label}</Grid> : <></>}
      <Grid>
        <TextField variant="standard" label={props.noTextLabel ? " " : "開始値"} onChange={handleStartChanged} value={start}
         slotProps={{ htmlInput: { maxLength: 4, min: 0, style: { textAlign: "right", paddingRight: 5 }}}} type="number" size="small"
         onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}} />
      </Grid>
      <Grid>
        <TextField variant="standard" label={props.noTextLabel ? " " : "現在値"} onChange={handleCurrentChanged} value={current}
         slotProps={{ htmlInput: { maxLength: 4, min: 0, style: { textAlign: "right", paddingRight: 5 }}}} type="number" size="small"
         onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}} />
      </Grid>
      <Grid>
        <TextField variant="standard" label={props.noTextLabel ? " " : "レート"} value={dropRate(current - start, props.divider)}
         slotProps={{ htmlInput: {tabIndex: -1, maxLength: 4, style: { textAlign: "right", paddingRight: 5 }}}} size="small" />
      </Grid>
    </Grid>
  )
}
