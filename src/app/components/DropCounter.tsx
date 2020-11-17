import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { Grid, TextField } from '@material-ui/core'

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

const useStyles = makeStyles((theme: Theme) => (
  createStyles({
    container: {
      margin: 2,
      width: 70
    },
    textField: {
    }
  }))
)

export const DropCounter: FC<Props> = (props) => {
  const classes = useStyles()
  const theme = useTheme()
  const isSP = useMediaQuery(theme.breakpoints.down('xs'))

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
    if (newValue >= start) {
      setCurrent(newValue)
      props.onChange(props.onChangeArg, { start, current: newValue })
    }
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
    <Grid container direction="column" className={classes.container}>
      {props.label ? <Grid item style={{textAlign: "center"}}>{props.label}</Grid> : <></>}
      <Grid item>
        <TextField label={props.noTextLabel ? " " : "開始値"} onChange={handleStartChanged} value={start} inputProps={{ maxLength: 4, min: 0, style: { textAlign: "right", paddingRight: 5 }}} type="number" size="small" />
      </Grid>
      <Grid item>
        <TextField label={props.noTextLabel ? " " : "現在値"} onChange={handleCurrentChanged} value={current} inputProps={{ maxLength: 4, style: { textAlign: "right", paddingRight: 5 }}} type="number" size="small" />
      </Grid>
      <Grid item>
        <TextField label={props.noTextLabel ? " " : "レート"} onChange={handleCurrentChanged} value={dropRate(current - start, props.divider)} inputProps={{tabIndex: -1, maxLength: 4, style: { textAlign: "right", paddingRight: 5 }}} size="small" />
      </Grid>
    </Grid>
  )
}
