import React, { FC, useState } from 'react'

import { Box, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material'
import { List, ListItem, ListItemText, Checkbox, FormControlLabel, Select, MenuItem, ListSubheader, Grid } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

import { dropItems, questListByDropItem, QuestDropRates, DropItem } from '../../fgo/questInfo'

type Prop = {
  open: boolean,
  itemId: number,
  onClose(selected: boolean, questId: number): void
}

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
      <Dialog open={props.open}
        fullWidth maxWidth="sm"
        onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">
          ドロップ検索
          <IconButton aria-label="close" sx={{ position: 'absolute', right: 1, top: 1, color: 'grey.500' }} onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogActions>
          <Select
            variant="standard"
            value={dropItem.id.toString()}
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
        <DialogActions sx={{ py: 0 }}>
          <FormControlLabel control={<Checkbox size="small" color="default" checked={useTotalDropRate} onChange={(e) => setUseTotalDropRate(e.target.checked)} />} label="ドロップ率合算" />
        </DialogActions>
        <DialogContent sx={{ px: 0.75 }}>
          <List dense component="nav" aria-label="main mailbox folders" >
            {questList.map((quest, questIndex) => (
              <ListItem key={questIndex} onClick={(e) => handleClickQuest(questIndex)} sx={{ px: 0.25, fontSize: "smalller" }}>
                <Grid container sx={{ flexDirection: "column" }}>
                  <Grid>
                    <Grid container>
                      <ListItemText style={{flexGrow: 1}} primary={quest.name}/>
                      <ListItemText style={{textAlign: "right"}}
                        primary={mainDropRate(quest, dropItem.id, useTotalDropRate) + "%"}
                      />
                    </Grid>
                  </Grid>
                  <Grid container >
                    <Grid>
                      <Box component="span" sx={{ m: 0, color: 'text.secondary', fontSize: "0.83em" }} >{quest.chapter.split(" ").slice(-1).pop()}</Box>
                    </Grid>
                    <Grid style={{flexGrow: 1}} >
                      {subDropRates(quest, dropItem.id, useTotalDropRate).map(({ name, id, dropRate }) => (
                        <Box component="p" key={`${questIndex}-${id}`} sx={{ m: 0, color: 'text.secondary', textAlign: "right" }} >
                          {name} {dropRate}%
                        </Box>
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