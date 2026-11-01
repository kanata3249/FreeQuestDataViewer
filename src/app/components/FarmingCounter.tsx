import React, { FC, useState } from 'react'
import { useTheme } from '@mui/material/styles'

import { Grid, Button, TextField, FormLabel, Typography, FormControlLabel, Radio, RadioGroup, Popover, FormGroup, Checkbox } from '@mui/material'

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
  "5%",
  "10%",
  "15%",
  "20%",
  "25%",
  "30%",
  "35%",
  "40%",
  "45%",
  "50%",
  "55%",
  "60%",
  "65%",
  "70%",
  "75%",
  "80%",
  "85%",
  "90%",
  "95%",
  "100%",
]

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
  variant: "standard" | "outlined" | "filled"
  label: string
  value: number
  modifier: string
  size: string
  onChange(value: number): void
  inputProps?: any
}
const BondWithBonusInput: FC<BondWithBonusInputProp> = (props) => {
  const { onChange, variant, value, modifier, ...other } = props;
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
      variant={variant}
      onChange={handleChanged}
      value={fieldValue}
      defaultValue="0"
      formatText={formatText}
      unformatText={unformatText}
    />
  );
}

type BondBonusInputProp = {
  variant: "standard" | "outlined" | "filled"
  label: string
  value: string
  size: 'small' | 'medium'
  onChange(value: string): void
  inputProps?: any
}
const BondBonusInput: FC<BondBonusInputProp> = (props) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLInputElement | null>(null)
  const bondModifiers = parseBondModifier(props.value)
  const ceBonus = formatBondModifier(bondModifiers.bonus, 0, 0)

  const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const onChangeCeBonus = (event : React.ChangeEvent<HTMLInputElement>) => {
    const newBonusModifiers = parseBondModifier(event.target.value)
    const newBonusText = formatBondModifier(newBonusModifiers.bonus, bondModifiers.ceFixedBonus, bondModifiers.startupBonus)
    props.onChange(newBonusText)
  }
  const onChangeCeFixedBonus = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      bondModifiers.ceFixedBonus = 50
    } else {
      bondModifiers.ceFixedBonus = 0
    }
    const newBonusText = formatBondModifier(bondModifiers.bonus, bondModifiers.ceFixedBonus, bondModifiers.startupBonus)
    props.onChange(newBonusText)
  }
  const onChangeStartupBonus = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      bondModifiers.startupBonus = (bondModifiers.startupBonus % 10 + 20)
    } else {
      bondModifiers.startupBonus = (bondModifiers.startupBonus % 10)
    }
    const newBonusText = formatBondModifier(bondModifiers.bonus, bondModifiers.ceFixedBonus, bondModifiers.startupBonus)
    props.onChange(newBonusText)
  }
  const onChangeStartupSupportBonus = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      bondModifiers.startupBonus = (((bondModifiers.startupBonus / 10) >> 0) * 10 + 4)
    } else {
      bondModifiers.startupBonus = (((bondModifiers.startupBonus / 10) >> 0) * 10)
    }
    const newBonusText = formatBondModifier(bondModifiers.bonus, bondModifiers.ceFixedBonus, bondModifiers.startupBonus)
    props.onChange(newBonusText)
  }
  return (
    <>
      <TextField variant="standard" label={props.label} value={props.value} size={props.size} onClick={handleClick} slotProps={{ htmlInput: props.inputProps }}>
      </TextField>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <FormGroup style={{marginLeft: 8, marginRight: 8, marginBottom: 8}}>
          <TextField variant="standard" label='礼装/イベント' onChange={onChangeCeBonus} size={props.size} select value={ceBonus} slotProps={{ select: { native: true } }}>
            {bondBonusArray.map((bonus) =>
                  <option key={bonus} value={bonus}>{bonus}</option>)}
          </TextField>
          <FormControlLabel control={<Checkbox id='ceFixedBonus' color='default' checked={bondModifiers.ceFixedBonus ? true : false} onChange={onChangeCeFixedBonus}/>} label='肖像' />
          <FormControlLabel control={<Checkbox id='startupBonus' color='default' checked={bondModifiers.startupBonus >= 20} onChange={onChangeStartupBonus}/>} label='前衛' />
          <FormControlLabel control={<Checkbox id='startupSupportBonus' color='default' checked={(bondModifiers.startupBonus % 10) ? true : false} onChange={onChangeStartupSupportBonus}/>} label='サポ前衛' />
        </FormGroup>
      </Popover>
    </>
  )
}

export const FarmingCounter: FC<Props> = (props) => {
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
  const handleBondBonusChanged = (value: string) => {
    const newCounterData = { ...counterData, values: { ...counterData.values, modifier: value } }
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
    <Grid container sx={{ flexDirection: "column", boxSizing: "border-box", width: "calc(100% - 8px)", p: 0.75, m: 0.5, mt: 1, border: "1px solid", borderRadius: 1, borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)' }} spacing={2}>
      <Grid>
        <Grid container spacing={1}>
          <Grid>
            <TextField variant="standard" label="クエスト名" onChange={handleTitleChanged} value={counterData.title}
              sx={{ width: 300 }} slotProps={{ htmlInput: {style: { textAlign: "center" }}}}/>
          </Grid>
          <Grid>
            <TextField variant="standard" label="トータル" onChange={handleCountChanged} type="number" value={counterData.count}
              sx={{ width: 100 }} slotProps={{ htmlInput: {min: 0, style: { textAlign: "right" } }}}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}} />
          </Grid>
          <Grid>
            <Button onClick={applyQuestData} variant="outlined" >クエスト反映</Button>
          </Grid>
          <Grid>
            <Button onClick={resetCounter} variant="outlined" >リセット</Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid>
        <Grid container sx={{ alignItems: "baseline" }} spacing={1}>
          <Grid>
            <BondWithBonusInput variant="standard" label="1周あたり" onChange={handleBondPerQuestChanged} key={bondPerQuestKey}
              value={counterData.values.perQuest} modifier={counterData.values.modifier} size="small" inputProps={{style: { width: 110, textAlign: "right", paddingRight: 15 }}} />
          </Grid>
          <Grid>
            <BondBonusInput variant="standard" label="ボーナス" onChange={handleBondBonusChanged} value={counterData.values.modifier} size="small" inputProps={{style: { width: 110, textAlign: "right", paddingRight: 15 }}} />
          </Grid>
          <Grid>
            <TextField variant="standard" label="開始値" onChange={handleBondStartChanged} value={counterData.values.start}
              size="small" type="number" slotProps={{ htmlInput: {style: { width: 90, paddingRight: 5, textAlign: "right" }}}}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}} />
          </Grid>
          <Grid>
            <TextField variant="standard" label="現在値" onChange={handleBondCurrentChanged} value={counterData.values.current}
              size="small" type="number" slotProps={{ htmlInput: {style: { width: 90, paddingRight: 5, textAlign: "right" }}}}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}} />
            </Grid>
          <Grid>
            <TextField variant="standard" label="換算周回数" onChange={handleBondCountChanged} value={calculateCount(counterData)}
              error={!isBondCountValid()} size="small" type="number" slotProps={{ htmlInput: {min: 0, style: { width: 80, paddingRight: 5, textAlign: "right" }}}}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => {e.target.select()}} />
          </Grid>
          <Grid>
            <Button onClick={applyCountByBond} disabled={!isApplyOK()} variant="outlined" >トータル周<br/>回数へ反映</Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid>
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
      <Grid>
        <FormLabel><Typography variant="caption">ドロップ</Typography></FormLabel>
        <Grid container spacing={0}>
          {counterData.dropCounts.map((dropCount: DropCount, idx: number) => (
            <Grid key={`${idx}-${counterData.count}`}>
              <DropCounter onChange={handleDropCountChanged} onChangeArg={idx} noTextLabel={idx != 0}
                dropCount={dropCount} divider={counterData.count + calculateCount(counterData)} key={`${dropCounterKey}-${idx}-${counterData.count}`}/>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  )
}
