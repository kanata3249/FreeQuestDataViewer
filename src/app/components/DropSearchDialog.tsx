import React, { FC, useState } from 'react'
import { makeStyles, createStyles, Theme, useTheme } from '@material-ui/core/styles'

import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@material-ui/core'
import { List, ListItem, ListItemText, Checkbox, FormControlLabel, Select, MenuItem, ListSubheader } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import { Grid } from '@material-ui/core'

import { dropItems, questListByDropItem, QuestDropRates, DropItem } from '../../fgo/questInfo'

type Prop = {
  open: boolean,
  itemId: number,
  onClose(selected: boolean, questId: number): void
}

const useStyles = makeStyles((theme: Theme) => 
  createStyles({
    dialog: {
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
    action2: {
      paddingTop: 0,
      paddingBottom: 0,
    },
    contents: {
      paddingLeft: 6,
      paddingRight: 6
    },
    questListItem: {
      paddingLeft: 2,
      paddingRight: 2,
      fontSize: "smalller"
    },
    chapter: {
      margin: 0,
      color: theme.palette.text.secondary,
      fontSize: "0.83em"
    },
    subDrop: {
      margin: 0,
      color: theme.palette.text.secondary,
      textAlign: "right"
    }
  })
)

const dropItemList = dropItems()

const totalRate = (dropRates: { [id: number]: number }): number => {
  const total = Object.entries(dropRates).reduce((acc, [id, rate]) => {
    if (dropItemList.find((a) => a.id == Number(id))) {
      return acc + rate
    }
    return acc
  }, 0)

  return ((total * 10) >> 0) / 10
}

export const DropSearchDialog: FC<Prop> = (props) => {
  const classes = useStyles()
  const theme = useTheme();

  const [ useTotalDropRate, setUseTotalDropRate ] = useState(false)
  const [ dropItem, setDropItem ] = useState(dropItemList.find((a) => a.id == props.itemId))
  const questList = questListByDropItem(dropItem?.id).sort((a, b) => {
    if (useTotalDropRate) {
      return totalRate(b.dropRates) - totalRate(a.dropRates)
    } else {
      return b.dropRates[dropItem?.id] - a.dropRates[dropItem?.id]
    }
  })

  const handleSearchItemChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = dropItemList.find((a) => a.id == Number(e.target.value))
    
    value && setDropItem(value)
  }

  const handleClose = () => {
    props.onClose(false, 0)
  }

  const handleClickQuest = (questIndex: number) => {
    props.onClose(true, questList[questIndex].id)
  }

  const mainDropRate = (quest: QuestDropRates, mainDropId: number, useTotalDropRate: boolean) : number => {
    if (useTotalDropRate) {
      return totalRate(quest.dropRates)
    } else {
      return quest.dropRates[mainDropId]
    }
  }

  const subDropRates = (quest: QuestDropRates, mainDropId: number, useTotalDropRate: boolean) : { name: string, id: number, dropRate: number }[] => {
    const sub = dropItemList.reduce((acc, dropItem) => {
      if (dropItem.id != mainDropId && quest.dropRates[dropItem.id]) {
        acc.push( { name: dropItem.name, id: dropItem.id, dropRate: quest.dropRates[dropItem.id] } )
      }
      return acc
    }, []).sort((a, b) => (b.id - a.id))
    if (useTotalDropRate) {
      const dropItem = dropItemList.find((item) => item.id == mainDropId)
      sub.unshift({ name: dropItem.name, id: dropItem.id, dropRate: quest.dropRates[dropItem.id]})
    }
    return sub
  }

  return (
    <div>
      <Dialog className={classes.dialog} open={props.open}
        fullWidth maxWidth="sm"
        onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">
          ドロップ検索
          <IconButton aria-label="close" className={classes.closeButton} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogActions>
          <Select
            value={dropItem.id}
            onChange={handleSearchItemChanged}
            native
            style={{width: "100%"}}
            >
              {dropItemList.reduce((acc, item) => {
                if (!acc.includes(item.group)) {
                  acc.push(item.group)
                }
                return acc
              },[]).reduce((acc, group) => {
                acc.push(
                  <optgroup label={group} key={group} >
                    {dropItemList.filter((a) => (
                        a.group == group
                      )).map((item) => (
                        <option key={item.id} value={item.id} >{item.name}</option>
                      ))
                    }
                  </optgroup>
                )
                return acc
              }, [])}
          </Select>
        </DialogActions>
        <DialogActions className={classes.action2} >
          <FormControlLabel control={<Checkbox size="small" color="default" checked={useTotalDropRate} onChange={(e) => setUseTotalDropRate(e.target.checked)} />} label="ドロップ率合算" />
        </DialogActions>
        <DialogContent className={classes.contents} >
          <List dense component="nav" aria-label="main mailbox folders" >
            {questList.map((quest, questIndex) => (
              <ListItem key={questIndex} onClick={(e) => handleClickQuest(questIndex)} className={classes.questListItem} >
                <Grid container direction="column" >
                  <Grid item>
                    <Grid container>
                      <ListItemText style={{flexGrow: 1}} primary={quest.name}/>
                      <ListItemText style={{textAlign: "right"}}
                        primary={mainDropRate(quest, dropItem.id, useTotalDropRate) + "%"}
                      />
                    </Grid>
                  </Grid>
                  <Grid container >
                    <Grid item >
                      <span className={classes.chapter} >{quest.chapter.split(" ").slice(-1).pop()}</span>
                    </Grid>
                    <Grid item style={{flexGrow: 1}} >
                      {subDropRates(quest, dropItem.id, useTotalDropRate).map(({ name, id, dropRate }) => (
                        <p key={`${questIndex}-${id}`} className={classes.subDrop} >
                          {name} {dropRate}%
                        </p>
                      ))}
                    </Grid>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </div>
  )
}