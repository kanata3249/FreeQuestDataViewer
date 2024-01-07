import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles'

import { Grid, Button, TextField, FormLabel, Typography, FormControlLabel, Radio, RadioGroup } from '@material-ui/core'

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

  values: {
    perQuest: number
    modifier: string
    start: number
    current: number
    direction: number
    useMod: boolean
  }

  dropCounts: DropCount[]
}

const emptyCountData: CounterData = {
  title: "",
  count: 0,
  values: {
    perQuest: 0,
    modifier: "+0",
    start: 0,
    current: 0,
    direction: -1,
    useMod: false
  },
  dropCounts: Array<DropCount>(8).fill({
    start: 0,
    current: 0
  })
}

const parseCounterData = (counterData: string) => {
  try {
    const parsedCounterData = JSON.parse(counterData)
    if (parsedCounterData && !parsedCounterData.values) {
      parsedCounterData.values = parsedCounterData.bond
      parsedCounterData.values.perQuest = parsedCounterData.bond.bondPerQuest
      parsedCounterData.values.modifier = parsedCounterData.bond.bondModifier

      parsedCounterData.values.direction = -1
    }
    return { ...emptyCountData, ...parsedCounterData }
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
    bondTextField: { width: 110, textAlign: "right", paddingRight: 15 },
    valueTextField: { width: 90, paddingRight: 5, textAlign: "right" },
    textField: { width: 80, paddingRight: 5, textAlign: "right" }
  })
})

const parseBondModifier = (modifiers: string) => {
  const mods = modifiers?.split(/\+/) || [ '0%' ]
  if (mods[0].length == 0) {
    mods[0] = '0%'
  }
  if (mods[1]?.endsWith('%')) {
    mods.splice(1, 0, '0')
  }
  return {
    bonus: Number.parseInt(mods[0]),
    ceFixedBonus: Number.parseInt(mods[1] || '0'),
    startupBonus: Number.parseInt(mods[2] || '0')
  }
}
const formatBondModifier = (ceBonus: number, ceFixedBonus: number, startupBonus: number) => {
  return `${ceBonus ? ceBonus + '%' : (ceFixedBonus ? '' : '+0')}${ceFixedBonus ? '+' + ceFixedBonus : ''}${startupBonus ? '+' + startupBonus + '%' : ''}`
}
const rounddown = (v: number) => (v >> 0)
const calculateBondWithBonus = (base, modifier) => {
  const bondModifier = parseBondModifier(modifier)

  const totalBond = rounddown(rounddown(base * ( 1 + bondModifier.startupBonus / 100)) * (1 + bondModifier.bonus / 100) + bondModifier.ceFixedBonus)
  return {
    totalBond: totalBond,
    totalBondText: `${base}(+${totalBond - base})`
  }
}

const calculateCount = (counterData: CounterData) => {
  if (counterData.values.useMod) {
    const bondWithBonus = calculateBondWithBonus(counterData.values.perQuest, counterData.values.modifier).totalBond
    const cur = counterData.values.current % 100
    const mods = [...Array(100)].map((_, i) => (i * bondWithBonus + counterData.values.start) % 100)
    return mods.findIndex((v) => v == cur)
  } else {
    const divider = calculateBondWithBonus(counterData.values.perQuest, counterData.values.modifier).totalBond
    if (divider)
      return counterData.values.direction * (counterData.values.current - counterData.values.start) / divider
    return 0
  }
}

const updateByCount = (counterData: CounterData, newCount: number) => {
  if (counterData.values.useMod) {
    const bondWithBonus = calculateBondWithBonus(counterData.values.perQuest, counterData.values.modifier).totalBond
    return { ...counterData, values: { ...counterData.values, current: (counterData.values.start + bondWithBonus * newCount) % 100 } }
  } else {
    const bondWithBonus = calculateBondWithBonus(counterData.values.perQuest, counterData.values.modifier).totalBond
    return { ...counterData, values: { ...counterData.values, current: counterData.values.start + counterData.values.direction * (newCount * bondWithBonus) } }
  }
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
    const newCounterData = { ...counterData, values: { ...counterData.values, perQuest: value } }
    props.onChange(JSON.stringify(newCounterData))
  }
  const handleBondBonusChanged = (e : React.ChangeEvent<HTMLInputElement>) => {
    const newCounterData = { ...counterData, values: { ...counterData.values, modifier: e.target.value } }
    updateBondPerQuest()
    props.onChange(JSON.stringify(newCounterData))
  }
  const handleBondStartChanged = (e : React.ChangeEvent<HTMLInputElement>) => {
    const newCounterData = { ...counterData, values: { ...counterData.values, start: Number.parseInt(e.target.value) || 0 } }
    props.onChange(JSON.stringify(newCounterData))
  }
  const handleBondCurrentChanged = (e : React.ChangeEvent<HTMLInputElement>) => {
    const newCounterData = { ...counterData, values: { ...counterData.values, current: Number.parseInt(e.target.value) || 0 } }
    props.onChange(JSON.stringify(newCounterData))
  }
  const handleBondCountChanged = (e : React.ChangeEvent<HTMLInputElement>) => {
    const newCount = Number.parseInt(e.target.value)
    if (!Number.isNaN(newCount)) {
      props.onChange(JSON.stringify(updateByCount(counterData, newCount)))
    }
  }
  const handleDropCountChanged = (index: number, dropCount: DropCount) => {
    counterData.dropCounts[index] = dropCount
    props.onChange(JSON.stringify(counterData))
  }
  const handleModeChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCounterData = JSON.parse(JSON.stringify(counterData))
    const mode = (event.target as HTMLInputElement).value
    newCounterData.values.useMod = false
    if (mode == "mod") {
      newCounterData.values.useMod = true
    } else {
      newCounterData.values.direction = mode == "dsc" ? -1 : 1
    }
    props.onChange(JSON.stringify(newCounterData))
  }
  const applyCountByBond = () => {
    const newCounterData = {
      ...counterData,
      count: counterData.count + calculateCount(counterData),
      values: { ...counterData.values, start: counterData.values.current }
    }
    props.onChange(JSON.stringify(newCounterData))
  }
  const isApplyOK = () => {
    const count = calculateCount(counterData)
    return Number.isInteger(count) && (count != 0)
  }
  const isBondCountValid = () => {
    const count = calculateCount(counterData)
    return Number.isInteger(count)
  }
  const applyQuestData = () => {
    const { title, bond } = props.questData()
    const newCounterData = { ...counterData, title, values: { ...counterData.values, perQuest: bond }}
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
            <BondWithBonusInput label="1周あたり" onChange={handleBondPerQuestChanged} key={bondPerQuestKey}
              value={counterData.values.perQuest} modifier={counterData.values.modifier} size="small" inputProps={{className: classes.bondTextField}} />
          </Grid>
          <Grid item>
            <TextField label="ボーナス" onChange={handleBondBonusChanged} value={counterData.values.modifier} size="small" select SelectProps={{ native: true }}>
            {bondBonusArray.map((bonus) =>
              <option key={bonus} value={bonus}>{bonus}</option>)}
            </TextField>
          </Grid>
          <Grid item>
            <TextField label="開始値" onChange={handleBondStartChanged} value={counterData.values.start}
              size="small" type="number" inputProps={{className: classes.valueTextField}}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}} />
          </Grid>
          <Grid item>
            <TextField label="現在値" onChange={handleBondCurrentChanged} value={counterData.values.current}
              size="small" type="number" inputProps={{className: classes.valueTextField}}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}} />
            </Grid>
          <Grid item>
            <TextField label="換算周回数" onChange={handleBondCountChanged} value={calculateCount(counterData)}
              error={!isBondCountValid()} size="small" type="number" inputProps={{min: 0, className: classes.textField}}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}} />
          </Grid>
          <Grid item>
            <Button onClick={applyCountByBond} disabled={!isApplyOK()} variant="outlined" >トータル周<br/>回数へ反映</Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <FormLabel id="count-mode-group-label">カウント方法</FormLabel>
        <RadioGroup name="mode"
          row aria-labelledby="count-mode-group-label"
          value={counterData.values.useMod ? "mod" : counterData.values.direction < 0 ? "dsc" : "asc"}
          onChange={handleModeChanged} >
          <FormControlLabel value="dsc" control={<Radio color="default" size="small" />} label="残値" />
          <FormControlLabel value="asc" control={<Radio color="default" size="small" />} label="累積値" />
          <FormControlLabel value="mod" control={<Radio color="default" size="small" />} label="QP下2桁" />
        </RadioGroup>
      </Grid>
      <Grid item>
        <FormLabel><Typography variant="caption">ドロップ</Typography></FormLabel>
        <Grid container spacing={0}>
          {counterData.dropCounts.map((dropCount: DropCount, idx: number) => (
            <Grid item key={`${idx}-${counterData.count}`}>
              <DropCounter onChange={handleDropCountChanged} onChangeArg={idx} noTextLabel={idx != 0}
                dropCount={dropCount} divider={counterData.count + calculateCount(counterData)} key={`${dropCounterKey}-${idx}-${counterData.count}`}/>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  )
}
