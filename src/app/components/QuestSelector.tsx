import React, { FC, useState } from 'react'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'

import { FormControl, InputLabel, Select, MenuItem } from '@mui/material'

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

export const QuestSelector: FC<Props> = (props) => {
  const theme = useTheme();
  const isSP = useMediaQuery(theme.breakpoints.down('xs'));

  const questId = props.questId
  const chapterId = props.questData(questId).chapterId

  const handleChapterChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    const chapterId = parseInt(e.target.value)
    if (props.questData(questId).chapterId != chapterId) {
      const newQuestId = props.quests[chapterId].quests[0].id
      props.onChange(newQuestId)
    }
  }
  const handleQuestChange = (e : React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(parseInt(e.target.value))
  }

  return (
    <div style={{ boxSizing: "border-box", width: "100%" }}>
      <FormControl sx={{ m: 1, minWidth: isSP ? "95%" : 280 }}>
        <InputLabel>Chapter</InputLabel>
        <Select value={chapterId.toString()} onChange={handleChapterChange}>
          {Object.keys(props.quests).map((chapterId) =>
            <MenuItem key={chapterId} value={chapterId}>{props.quests[chapterId].name}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl sx={{ m: 1, minWidth: isSP ? "95%" : 280 }}>
        <InputLabel>Quests</InputLabel>
        <Select value={questId.toString()} onChange={handleQuestChange}>
          {props.quests[chapterId].quests.map((quest) =>
            <MenuItem key={quest.id} value={quest.id}>{quest.name}</MenuItem>)}
        </Select>
      </FormControl>
    </div>
  )
}
