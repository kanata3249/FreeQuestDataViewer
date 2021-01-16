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

export type DropItem = {
  id: number,
  group: string,
  name: string
}

type QuestDataMap = {
  [key: number]: QuestData
}

export type QuestDropRates = {
  id: number
  chapter: string
  name: string
  dropRates: {
    [id: number]: number
  }
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

const questDropList: { [id: string]: { [itemId: string]: string } } = require('./dropdata.json')
const itemNames: { [id: string]: string } = require('./itemnames.json')

export const dropItems = (): DropItem[] => {
  const group = [ "", "", "スキル石", "銅素材", "銀素材", "金素材", "モニュメント・ピース", "", "伝承結晶" ]
  return Object.entries(itemNames).reduce((acc, [idString, name]) => {
    const id = Number(idString)
    if (id >= 300 && id < 600) {
      acc.push({ name, group: group[(id / 100) >> 0], id })
    }
    return acc
  }, [])
}

export const questListByDropItem = (itemId: number) : QuestDropRates[] =>
{
  return Object.entries(questDropList).reduce((acc, [questId, dropRates]) => {
    if (dropRates[itemId]) {
      const quest = questData(Number(questId))
      acc.push({
        id: Number(questId),
        chapter: quest.chapter,
        name: `${quest.area} ${quest.name}`,
        dropRates: Object.entries(dropRates).reduce((acc, [id, rate]) => {
          acc[Number(id)] = Number(rate)
          return acc
        },{})
      })
    }
    return acc
  }, [])
}