import React, { FC, useEffect, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { AppBar, Toolbar, IconButton, Typography, Grid } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'

import { QuestSelector } from '../components/QuestSelector'
import { QuestViewer } from '../components/QuestViewer'
import { QuestMemo } from '../components/QuestMemo'

import { questList, questData } from '../../fgo/questInfo'

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    toolbar: theme.mixins.toolbar
  }))

const validatedQuestId = (questId) => {
  const quests = questList()
  if (!questData(questId)) {
    return quests[Object.keys(quests)[0]].quests[0].id
  }
  return questId
}

const saveMemo = (questId: number, text: string) =>
{
  localStorage.setItem(`memo/${questId}`, text)
}

const loadMemo = (questId: number) =>
{
  return localStorage.getItem(`memo/${questId}`) || ""
}

export const TopPage: FC = () => {
  const classes = useStyles();
  const [questId, setQuestId] = useState(validatedQuestId(parseInt(localStorage.getItem('questId'))))

  useEffect(() => {
  })

  const handleQuestIdChanged = (id: number) => {
    setQuestId(id)
    localStorage.setItem('questId', Number(id).toString())
  }

  const handleMemoChanged = (text: string) => {
    saveMemo(questId, text)
  }

  return (
    <>
      <div className={classes.toolbar}>
        <AppBar>
          <Toolbar>
            <IconButton edge="start" aria-label="menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6">
              Free Quest Data Viewer
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
      <div>
        <QuestSelector quests={questList()} questData={questData} questId={questId} onChange={handleQuestIdChanged}/>
        <QuestViewer questData={questData} questId={questId}/>
        <QuestMemo key={questId} questId={questId} maxLength={10 * 1024} onChange={handleMemoChanged} text={loadMemo(questId)}/>
      </div>
    </>
  )
}