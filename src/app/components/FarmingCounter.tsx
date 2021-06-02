import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles'

import { Grid, Button, TextField, FormLabel, Typography, colors } from '@material-ui/core'

import { FormattedTextField } from './FormattedTextField'
import { DropCounter } from './DropCounter'

type Props = {
  counterData: string
  onChange(countData: string): void
  questData() : {
    title: string
    bond: number
  }
}

type DropCount = {
  start: number
  current: number
}

type CounterData = {
  title: string

  count: number

  bond: {
    bondPerQuest: number
    bondModifier: string
    start: number
    current: number
  }

  dropCounts: DropCount[]
}

const emptyCountData: CounterData = {
  title: "",
  count: 0,
  bond: {
    bondPerQuest: 0,
    bondModifier: "+0",
    start: 0,
    current: 0
  },
  dropCounts: Array<DropCount>(8).fill({
    start: 0,
    current: 0
  })
}

const parseCounterData = (counterData: string) => {
  try {
    return JSON.parse(counterData) as CounterData || emptyCountData
  } catch (e) {
    return emptyCountData
  }
}

const bondBonusArray = [
  "+0",
  "+50",
  "5%",
  "5%+50",
  "10%",
  "10%+50",
  "15%",
  "15%+50",
  "20%",
  "20%+50",
  "25%",
  "25%+50",
  "30%",
  "30%+50",
  "35%",
  "35%+50",
  "40%",
  "40%+50",
  "45%",
  "45%+50",
  "50%",
  "50%+50",
]

const useStyles = makeStyles((theme: Theme) => {
  const borderColor = theme.palette.type === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)'
  return createStyles({
    container: {
      boxSizing: "border-box",
      width: "calc(100% - 8px)",
      padding: 6,
      margin: 4,
      marginTop: 8,
      border: "1px solid",
      borderRadius: 4,
      borderColor: borderColor
    },
    title: { width: 300 },
    total: { width: 100 },
    bondTextField: { width: 130, textAlign: "right", paddingRight: 15 },
    textField: { width: 80, paddingRight: 5, textAlign: "right" }
  })
})

const calculateBondWithBonus = (bond, modifier) => {
  const bondModifier = {
    a: Number.parseInt((modifier.match("([0-9]+)%") || ["0"])[0]),
    b: Number.parseInt((modifier.match("\\+([0-9]+)") || ["0"])[0])
  }
  return {
    totalBond: (bond * (100 + bondModifier.a) / 100 + bondModifier.b) >> 0,
    totalBondText: `${bond}(+${(bond * bondModifier.a / 100 + bondModifier.b) >> 0})`
  }
}

const calculateCountByBond = (counterData: CounterData) => {
  const divider = calculateBondWithBonus(counterData.bond.bondPerQuest, counterData.bond.bondModifier).totalBond
  if (divider)
    return Math.abs((counterData.bond.current - counterData.bond.start) / divider)
  return 0
}

type BondWithBonusInputProp = {
  label: string
  value: number
  modifier: string
  size: string
  onChange(value: number): void
  inputProps?: any
}
const BondWithBonusInput: FC<BondWithBonusInputProp> = (props) => {
  const { onChange, value, modifier, ...other } = props;
  const [ fieldValue, setFieldValue ] = useState<string>((value||0).toString())

  const formatText = (text: string) => {
    return calculateBondWithBonus(Number.parseInt(text), modifier).totalBondText
  }
  const unformatText = (text: string) => {
    return Number.parseInt(text).toString()
  }
  const handleChanged = (text: string) => {
    props.onChange(Number.parseInt(text))
  }

  return (
    <FormattedTextField
      {...other}
      onChange={handleChanged}
      value={fieldValue}
      defaultValue="0"
      formatText={formatText}
      unformatText={unformatText}
    />
  );
}

export const FarmingCounter: FC<Props> = (props) => {
  const classes = useStyles()
  const theme = useTheme()
  const counterData = parseCounterData(props.counterData)
  const [ bondPerQuestKey, setBondPerQuestKey ] = useState(0)
  const [ dropCounterKey, setDropCounterKey ] = useState(0)

  const updateBondPerQuest = () => {
    setBondPerQuestKey(bondPerQuestKey + 1)
  }
  const updateDropCounter = () => {
    setDropCounterKey(dropCounterKey + 1)
  }
  const handleTitleChanged = (e : React.ChangeEvent<HTMLInputElement>) => {
    const newCounterData = { ...counterData, title: e.target.value }
    props.onChange(JSON.stringify(newCounterData))
  }
  const handleCountChanged = (e : React.ChangeEvent<HTMLInputElement>) => {
    const newCounterData = { ...counterData, count: Number.parseInt(e.target.value) || 0 }
    props.onChange(JSON.stringify(newCounterData))
  }
  const handleBondPerQuestChanged = (value: number) => {
    const newCounterData = { ...counterData, bond: { ...counterData.bond, bondPerQuest: value } }
    props.onChange(JSON.stringify(newCounterData))
  }
  const handleBondBonusChanged = (e : React.ChangeEvent<HTMLInputElement>) => {
    const newCounterData = { ...counterData, bond: { ...counterData.bond, bondModifier: e.target.value } }
    updateBondPerQuest()
    props.onChange(JSON.stringify(newCounterData))
  }
  const handleBondStartChanged = (e : React.ChangeEvent<HTMLInputElement>) => {
    const newCounterData = { ...counterData, bond: { ...counterData.bond, start: Number.parseInt(e.target.value) || 0 } }
    props.onChange(JSON.stringify(newCounterData))
  }
  const handleBondCurrentChanged = (e : React.ChangeEvent<HTMLInputElement>) => {
    const newCounterData = { ...counterData, bond: { ...counterData.bond, current: Number.parseInt(e.target.value) || 0 } }
    props.onChange(JSON.stringify(newCounterData))
  }
  const handleBondCountChanged = (e : React.ChangeEvent<HTMLInputElement>) => {
    const newCount = Number.parseInt(e.target.value)
    if (!Number.isNaN(newCount)) {
      const oldCount = calculateCountByBond(counterData) >> 0
      const bondWithBonus = calculateBondWithBonus(counterData.bond.bondPerQuest, counterData.bond.bondModifier).totalBond
      if (Math.abs(newCount - oldCount) == 1) {
        counterData.bond.current = counterData.bond.start - (newCount * bondWithBonus)
        props.onChange(JSON.stringify(counterData))
      }
    }
  }
  const handleDropCountChanged = (index: number, dropCount: DropCount) => {
    counterData.dropCounts[index] = dropCount
    props.onChange(JSON.stringify(counterData))
  }
  const applyCountByBond = () => {
    const newCounterData = {
      ...counterData,
      count: counterData.count + calculateCountByBond(counterData),
      bond: { ...counterData.bond, start: counterData.bond.current }
    }
    props.onChange(JSON.stringify(newCounterData))
  }
  const isApplyOK = () => {
    const count = calculateCountByBond(counterData)
    return Number.isInteger(count) && (count != 0)
  }
  const isBondCountValid = () => {
    const count = calculateCountByBond(counterData)
    return Number.isInteger(count)
  }
  const applyQuestData = () => {
    const { title, bond } = props.questData()
    const newCounterData = { ...counterData, title, bond: { ...counterData.bond, bondPerQuest: bond }}
    updateBondPerQuest()
    props.onChange(JSON.stringify(newCounterData))
  }
  const resetCounter = () => {
    updateBondPerQuest()
    updateDropCounter()
    props.onChange(JSON.stringify(emptyCountData))
  }
  return (
    <Grid container direction="column" className={classes.container} spacing={2}>
      <Grid item>
        <Grid container spacing={1}>
          <Grid item>
            <TextField label="クエスト名" onChange={handleTitleChanged} value={counterData.title}
              className={classes.title} inputProps={{style: { textAlign: "center" }}}/>
          </Grid>
          <Grid item>
            <TextField label="トータル" onChange={handleCountChanged} type="number" value={counterData.count}
              className={classes.total} inputProps={{min: 0, style: { textAlign: "right" } }}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}} />
          </Grid>
          <Grid item>
            <Button onClick={applyQuestData} variant="outlined" >クエスト反映</Button>
          </Grid>
          <Grid item>
            <Button onClick={resetCounter} variant="outlined" >リセット</Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <Grid container alignItems="baseline" spacing={1}>
          <Grid item>
            <BondWithBonusInput label="絆" onChange={handleBondPerQuestChanged} key={bondPerQuestKey}
              value={counterData.bond.bondPerQuest} modifier={counterData.bond.bondModifier} size="small" inputProps={{className: classes.bondTextField}} />
          </Grid>
          <Grid item>
            <TextField label="ボーナス" onChange={handleBondBonusChanged} value={counterData.bond.bondModifier} size="small" select SelectProps={{ native: true }}>
            {bondBonusArray.map((bonus) =>
              <option key={bonus} value={bonus}>{bonus}</option>)}
            </TextField>
          </Grid>
          <Grid item>
            <TextField label="絆 開始値" onChange={handleBondStartChanged} value={counterData.bond.start}
              size="small" type="number" inputProps={{className: classes.textField}}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}} />
          </Grid>
          <Grid item>
            <TextField label="絆 現在値" onChange={handleBondCurrentChanged} value={counterData.bond.current}
              size="small" type="number" inputProps={{className: classes.textField}}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}} />
            </Grid>
          <Grid item>
            <TextField label="換算周回数" onChange={handleBondCountChanged} value={calculateCountByBond(counterData)}
              error={!isBondCountValid()} size="small" type="number" inputProps={{min: 0, className: classes.textField}}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}} />
          </Grid>
          <Grid item>
            <Button onClick={applyCountByBond} disabled={!isApplyOK()} variant="outlined" >トータル周<br/>回数へ反映</Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <FormLabel><Typography variant="caption">ドロップ</Typography></FormLabel>
        <Grid container spacing={0}>
          {counterData.dropCounts.map((dropCount: DropCount, idx: number) => (
            <Grid item key={`${idx}-${counterData.count}`}>
              <DropCounter onChange={handleDropCountChanged} onChangeArg={idx} noTextLabel={idx != 0}
                dropCount={dropCount} divider={counterData.count + calculateCountByBond(counterData)} key={`${dropCounterKey}-${idx}-${counterData.count}`}/>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  )
}
