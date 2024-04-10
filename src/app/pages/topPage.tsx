import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import { useTheme } from '@material-ui/core/styles'
import { isMobile } from 'react-device-detect'

import { AppBar, Menu, MenuItem, Toolbar, IconButton, Typography, Link, Divider } from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'

import { QuestSelector } from '../components/QuestSelector'
import { QuestViewer } from '../components/QuestViewer'
import { QuestMemo } from '../components/QuestMemo'
import { FarmingCounter } from '../components/FarmingCounter'
import { DropSearchDialog } from '../components/DropSearchDialog'

import { questList, questData } from '../../fgo/questInfo'

const STORAGE_PATH_MEMO = 'freequest/memo'
const STORAGE_PATH_COUNTER = 'counter/0'

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    toolbar: theme.mixins.toolbar,
    contents: {
      maxWidth: 1000
    },
    notice: {
      marginLeft: 10,
    },
    link: {
      color: theme.palette.info.main
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
  try {
    const memomap = JSON.parse(localStorage.getItem(STORAGE_PATH_MEMO))
    if (text?.length > 0) {
      memomap[questId] = text
    } else {
      delete memomap[questId]
    }
    localStorage.setItem(STORAGE_PATH_MEMO, JSON.stringify(memomap))
  } catch (e) {
    if (text?.length > 0) {
      localStorage.setItem(STORAGE_PATH_MEMO, JSON.stringify({ [questId]: text }))
    } else {
      localStorage.setItem(STORAGE_PATH_MEMO, JSON.stringify({}))
    }
  }
}

const loadMemo = (questId: number) =>
{
  try {
    const memomap = JSON.parse(localStorage.getItem(STORAGE_PATH_MEMO))
    return memomap[questId] || ''
  } catch (e) {
    return ''
  }
}

const exportMemo = () => {
  try {
    const memomap = JSON.parse(localStorage.getItem(STORAGE_PATH_MEMO))
    return JSON.stringify(Object.values(questList()).reduce((acc, chapter) => {
      chapter.quests.forEach((quest) => {
        const text = memomap[quest.id]
        text?.length > 0 && acc.push( { chapter: chapter.name, quest: quest.name, memo: text })
      })
      return acc
    }, []))
  } catch (e) {
    return '[]'
  }
}

const importMemo = (json: string) =>
{
  try {
    const importedMemos = JSON.parse(json)
    const memomap = {}

    importedMemos.forEach((memo) => {
      memo.quest = memo.quest.replace('荒野の観楽', '荒野の歓楽')
      const chapterInfo = Object.values(questList()).find((chapter) => {
        return chapter.name == memo.chapter
                || chapter.name.split(/ /).pop() == memo.chapter.split(/ /).pop()
      })
      const questInfo = chapterInfo.quests.find((quest) => {
        return quest.name == memo.quest
      })

      if (memo.memo?.length > 0) {
        memomap[questInfo.id] = memo.memo
      }
    })
    localStorage.setItem(STORAGE_PATH_MEMO, JSON.stringify(memomap))
  } catch(error) {
  }
}

const convertOldMemo = () =>
{
  if (!localStorage.getItem(STORAGE_PATH_MEMO)) {
    if (localStorage.getItem('memo')) {
      localStorage.setItem(STORAGE_PATH_MEMO, localStorage.getItem('memo'))
      localStorage.removeItem('memo')
      return
    }
    const result = Object.values(questList()).reduce((acc, chapter) => {
      chapter.quests.forEach((quest) => {
        const memo = localStorage.getItem(`memo/${quest.id}`)
        if (memo) {
          acc[quest.id] = memo
        }
      })
      return acc
    }, {})
    localStorage.setItem(STORAGE_PATH_MEMO, JSON.stringify(result))
    // remove old memos
    Object.values(questList()).forEach((chapter) => {
      chapter.quests.forEach((quest) => {
        localStorage.removeItem(`memo/${quest.id}`)
      })
    })
  }
}

const saveCounter = (text: string) =>
{
  localStorage.setItem(STORAGE_PATH_COUNTER, text)
}

const loadCounter = () =>
{
  return localStorage.getItem(STORAGE_PATH_COUNTER)
}

export const TopPage: FC = () => {
  const classes = useStyles()
  const [ questId, setQuestId ] = useState(validatedQuestId(parseInt(localStorage.getItem('questId'))))
  const [ anchorEl, setAnchorEl ] = useState<null | HTMLElement>(null)
  const [ updateCount, setUpdateCount ] = useState(0)
  const [ showCounter, setShowCounter ] = useState(false)
  const [ counterData, setCounterData ] = useState(loadCounter())
  const [ showDropSearchDialog, setShowDropSearchDialog ] = useState(false)

  const theme = useTheme();

  convertOldMemo()

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

  const handleCounterChanged = (text : string) => {
    setCounterData(text)
    saveCounter(text)
  }

  const handleShowHideCounter = () => {
    setShowCounter(!showCounter)
    closeMenu()
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

  const questDataForCounter = () => {
    const quest = questData(questId)

    return { title: `${quest.area} ${quest.name}`, bond: quest.bond }
  }

  const closeMenu = () => {
    setAnchorEl(null)
  }

  const handleShowDropSearchDialog = () => {
    setShowDropSearchDialog(true)
    closeMenu()
  }

  const handleDropSearchDialogResult = (selected: boolean, questId: number) => {
    if (selected) {
      setQuestId(questId)
      localStorage.setItem('questId', questId.toString())
    }
    setShowDropSearchDialog(false)
  }

  const handleOpenSourceLicenses = () => {
    window.open("./opensource-licenses.txt", "_blank")
    closeMenu()
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
              <MenuItem onClick={handleShowDropSearchDialog}>ドロップ検索</MenuItem>
              {!isMobile && <MenuItem onClick={handleShowHideCounter}>{!showCounter ? "周回カウンタ表示" : "周回カウンタ非表示"} </MenuItem>}
              <Divider />
              <MenuItem onClick={handleExportMemo}>メモ書き出し</MenuItem>
              <MenuItem onClick={handleImportMemo}>メモ読み込み</MenuItem>
              <Divider />
              <MenuItem onClick={handleOpenSourceLicenses}>オープンソースライセンス</MenuItem>
            </Menu>
            <Typography variant="h6">
              Free Quest Data Viewer
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
      <div className={classes.contents}>
        {showCounter && <FarmingCounter onChange={handleCounterChanged} counterData={counterData} questData={questDataForCounter} />}
        <QuestSelector quests={questList()} questData={questData} questId={questId} onChange={handleQuestIdChanged}/>
        <QuestViewer questData={questData} questId={questId}/>
        <QuestMemo key={`${questId}-${updateCount}`} questId={questId} maxLength={10 * 1024} onChange={handleMemoChanged} text={loadMemo(questId)}/>
      </div>
      <DropSearchDialog open={showDropSearchDialog} itemId={300} onClose={handleDropSearchDialogResult} />
      <div className={classes.notice}>
        クエスト・エネミーデータなど大部分は<Link className={classes.link} color="inherit" href="https://atlasacademy.io/" target="blank">Atlas Academy</Link>を参考にさせていただいています。
        <br />
        クエストドロップデータは<Link className={classes.link} color="inherit" href="https://sites.google.com/view/fgo-domus-aurea" target="black">FGOアイテム効率劇場</Link>のデータを使用させていただいています。
      </div>
    </>
  )
}