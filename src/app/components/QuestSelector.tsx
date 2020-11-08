import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'

import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core'

type Props = {
  quests: {
    [key : number]: {
      id: number,
      name: string
      quests: [{
        id: number,
        name: string
      }]
    }
  }
  questData(id : number): {
    chapterId: number
  }
  onChange(questId: number): void
  questId: number
}

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    toolbar: theme.mixins.toolbar,
    formControl: {
      margin: theme.spacing(1),
      minWidth: 280,
    },
    formControlSP: {
      margin: theme.spacing(1),
      minWidth: "95%",
    },
  }))

export const QuestSelector: FC<Props> = (props) => {
  const classes = useStyles()
  const theme = useTheme();
  const isSP = useMediaQuery(theme.breakpoints.down('xs'));

  const [ chapterId, setChapterId ] = useState(props.questData(props.questId).chapterId)
  const [ questId, setQuestId ] = useState(props.questId)

  const handleChapterChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const chapterId = parseInt(e.target.value)
    setChapterId(chapterId)
    if (props.questData(props.questId).chapterId != chapterId) {
      const newQuestId = props.quests[chapterId].quests[0].id
      setQuestId(newQuestId)
      props.onChange(newQuestId)
    }
  }
  const handleQuestChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    setQuestId(parseInt(e.target.value))
    props.onChange(parseInt(e.target.value))
  }

  return (
    <div>
      <FormControl className={isSP ? classes.formControlSP : classes.formControl}>
        <InputLabel>Chapter</InputLabel>
        <Select value={chapterId} onChange={handleChapterChange}>
          {Object.keys(props.quests).map((chapterId) =>
            <MenuItem key={chapterId} value={chapterId}>{props.quests[chapterId].name}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl className={isSP ? classes.formControlSP : classes.formControl}>
        <InputLabel>Quests</InputLabel>
        <Select value={questId} onChange={handleQuestChange}>
          {props.quests[chapterId].quests.map((quest) =>
            <MenuItem key={quest.id} value={quest.id}>{quest.name}</MenuItem>)}
        </Select>
      </FormControl>
    </div>
  )
}
