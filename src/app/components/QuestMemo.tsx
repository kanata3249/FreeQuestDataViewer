import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { TextField } from '@material-ui/core'

type Props = {
  maxLength: number
  text: string
  questId: number
  onChange(text: string): void
}

const useStyles = makeStyles((theme: Theme) => (
  createStyles({
    container: {
      width: "100%",
      padding: 6,
    },
  }))
)

export const QuestMemo: FC<Props> = (props) => {
  const classes = useStyles();
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
    <div className={classes.container}>
      <TextField multiline={true} label="Memo" rows={10} fullWidth={true} variant='outlined' inputProps={{ maxLength: props.maxLength }} value={text}
       onChange={handleMemoChanged} onCompositionStart={() => setComposing(true)} onCompositionEnd={handleCompositionEnd}
      />
    </div>
  )
}
