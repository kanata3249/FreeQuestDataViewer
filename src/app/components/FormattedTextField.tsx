import React, { FC, useState } from 'react'

import { TextField } from '@material-ui/core'

type Props = {
  label: string
  value: string
  defaultValue: string
  formatText(text: string): string
  unformatText(text: string): string
  onChange(text: string): void
}

export const FormattedTextField: FC<Props> = (props) => {
  const { onChange, value, defaultValue, formatText, unformatText, ...other } = props

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
      onFocus={handleFocus}
      onBlur={handleFocusOut}
      onChange={handleChanged}
      value={text}
    />
  );
}
