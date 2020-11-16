import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'

import { AppBar, Menu, MenuItem, Toolbar, IconButton, Typography, Link } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'

import { QuestSelector } from '../components/QuestSelector'
import { QuestViewer } from '../components/QuestViewer'
import { QuestMemo } from '../components/QuestMemo'

import { questList, questData } from '../../fgo/questInfo'

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    toolbar: theme.mixins.toolbar,
    contents: {
      maxWidth: 1000
    },
    notice: {
      marginLeft: 10,
    }
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

const exportMemo = () => {
  return JSON.stringify(Object.values(questList()).reduce((acc, chapter) => {
    chapter.quests.forEach((quest) => {
      const memo = loadMemo(quest.id)
      memo && acc.push( { chapter: chapter.name, quest: quest.name, memo: memo })
    })
    return acc
  }, []))
}

const importMemo = (json: string) =>
{
  try {
    const memos = JSON.parse(json)

    memos.forEach((memo) => {
      const chapterInfo = Object.values(questList()).find((chapter) => {
        return chapter.name == memo.chapter
      })
      const questInfo = chapterInfo.quests.find((quest) => {
        return quest.name == memo.quest
      })

      saveMemo(questInfo.id, memo.memo)
    })
  } catch(error) {
  }
}
export const TopPage: FC = () => {
  const classes = useStyles()
  const [ questId, setQuestId ] = useState(validatedQuestId(parseInt(localStorage.getItem('questId'))))
  const [ anchorEl, setAnchorEl ] = useState<null | HTMLElement>(null)
  const [ updateCount, setUpdateCount ] = useState(0)

  const updateMemo = () => {
    setUpdateCount(updateCount + 1)
  }

  const handleQuestIdChanged = (id: number) => {
    setQuestId(id)
    localStorage.setItem('questId', Number(id).toString())
  }

  const handleMemoChanged = (text: string) => {
    saveMemo(questId, text)
  }

  const handleMenuClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleExportMemo = () => {
    const memos = exportMemo()
    const jsonURL = window.URL.createObjectURL(new Blob([memos], { type: 'text/json' }))
    const link = document.createElement('a')
    document.body.appendChild(link)
    link.href = jsonURL
    link.setAttribute('download', 'quest_memo.json')
    link.click()
    document.body.removeChild(link)

    closeMenu()
  }

  const handleImportMemo = () => {
    interface HTMLElementEvent<T extends HTMLElement> extends Event {
      target: T
    }

    const fileSelector = document.createElement('input')
    fileSelector.setAttribute('type', 'file')
    fileSelector.setAttribute('accept', 'text/json')
    fileSelector.addEventListener("change", (inputEvent: HTMLElementEvent<HTMLInputElement>) => {
      const reader = new FileReader()

      reader.addEventListener("load", (evt) => {
        importMemo(reader.result as string)
        updateMemo()
      })
      reader.readAsText(inputEvent.target.files[0])
    })
    fileSelector.click()
  
    closeMenu()
  }

  const closeMenu = () => {
    setAnchorEl(null)
  }

  return (
    <>
      <div className={classes.toolbar}>
        <AppBar>
          <Toolbar>
            <IconButton edge="start" aria-label="menu" aria-controls="main-menu" onClick={handleMenuClick}>
              <MenuIcon />
            </IconButton>
            <Menu id="main-menu" anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
              <MenuItem onClick={handleExportMemo}>メモ書き出し</MenuItem>
              <MenuItem onClick={handleImportMemo}>メモ読み込み</MenuItem>
            </Menu>
            <Typography variant="h6">
              Free Quest Data Viewer
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
      <div className={classes.contents}>
        <QuestSelector quests={questList()} questData={questData} questId={questId} onChange={handleQuestIdChanged}/>
        <QuestViewer questData={questData} questId={questId}/>
        <QuestMemo key={`${questId}-${updateCount}`} questId={questId} maxLength={10 * 1024} onChange={handleMemoChanged} text={loadMemo(questId)}/>
      </div>
      <div className={classes.notice}>
        クエスト・エネミーデータなど大部分は<Link href="https://w.atwiki.jp/f_go/" target="blank">Fate/Grand Order @wiki 【FGO】</Link>を参考にさせていただいています。
      </div>
    </>
  )
}