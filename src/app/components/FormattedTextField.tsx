import React, { FC, useState } from 'react'

import { TextField } from '@mui/material'

type Props = {
  variant: "standard" | "outlined" | "filled"
  label: string
  value: string
  defaultValue: string
  formatText(text: string): string
  unformatText(text: string): string
  onChange(text: string): void
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
}

export const FormattedTextField: FC<Props> = (props) => {
  const { onChange, variant, value, defaultValue, formatText, unformatText, inputProps, ...other } = props

  const [ text, setText ] = useState<string>(props.formatText(value))

  const handleChanged = (e : React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    props.onChange(e.target.value)
  }
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setText(props.unformatText(e.target.value))
  }
  const handleFocusOut = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value.length) {
      setText(props.formatText(e.target.value))
    } else {
      setText(props.formatText(props.defaultValue))
      props.onChange(props.defaultValue)
    }
  }

  return (
    <TextField
      {...other}
      variant={variant}
      slotProps={{ htmlInput: inputProps }}
      onFocus={handleFocus}
      onBlur={handleFocusOut}
      onChange={handleChanged}
      value={text}
    />
  );
}
