type QuestListByChapter = {
  id: number
  name: string
  quests: [
    {
      id: number
      name: string
    }
  ]
}

type QuestList = {
  [key: number]: QuestListByChapter
}

type QuestData = {
  chapterId: number
  chapter: string
  area: string
  name: string
  lv: number
  ap: number
  bond: number
  exp: number
  qp: number
  drop: string
  attributes: string
  enemies: [
    [
      {
        enemyId: number
        name: string
        class: string
        lv: number
        hp: number
        buff: string
        dr: string
        attributes: string
        characteristics: string
      }
    ]
  ]
}

type QuestDataMap = {
  [key: number]: QuestData
}

const fgo_data = require('./quest.json')
const fgo_quest_list: QuestList = fgo_data.quests.reduce((acc, item) => {
  const { id, ...chapter } = item
  acc[id] = chapter
  return acc
}, {})
const fgo_quest_data : QuestDataMap = JSON.parse(JSON.stringify(fgo_data.questData))
Object.values(fgo_quest_data).forEach((quest) => {
  quest.enemies.forEach((wave) => {
    wave.forEach((enemy) => {
      Object.assign(enemy, fgo_data.enemyData[enemy.enemyId])
    })
  })
})

export const questList = () => {
  return fgo_quest_list
}

export const questData = (id: number) => {
  return fgo_quest_data[id]
}
