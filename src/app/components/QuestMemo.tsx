import React, { FC, useState } from 'react'

import { TextField } from '@mui/material'

type Props = {
  maxLength: number
  text: string
  questId: number
  onChange(text: string): void
}

export const QuestMemo: FC<Props> = (props) => {
  const [composing, setComposing] = useState(false)
  const [text, setText] = useState(props.text)
  const [savedText, setSavedText] = useState(props.text)

  const handleMemoChanged = (e : React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
    if (!composing) {
      props.onChange(e.target.value)
      setSavedText(e.target.value)
    }
  }
  const handleCompositionEnd = () => {
    setComposing(false)
    if (text != savedText) {
      props.onChange(text)
      setSavedText(text)
    }
  }

  return (
    <div style={{ width: "100%", padding: 6 }}>
      <TextField multiline={true} label="Memo" rows={10} fullWidth={true} variant='outlined' slotProps={{ htmlInput: { maxLength: props.maxLength } }} value={text}
       onChange={handleMemoChanged} onCompositionStart={() => setComposing(true)} onCompositionEnd={handleCompositionEnd}
      />
    </div>
  )
}
