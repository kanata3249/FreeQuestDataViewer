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
  id: number
  rawId: number
  chapterId: number
  chapter: string
  area: string
  name: string
  lv: number
  ap: number
  bond: number
  exp: number
  qp: number
  drop: { id: number, group: string, name: string, rate: number }[]
  attributes: string
  enemies: [
    [
      {
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
const fgo_quest_list: QuestList = fgo_data.quests.reduce((acc, chapter) => {
  const quests = chapter.quests
    .map((quest) => (
      {
        id: quest.id,
        rawId: quest.rawId,
        name: `${quest.area} ${quest.name}`
      })
    ).sort((a, b) => a.rawId - b.rawId)
  acc[chapter.id] = { ...chapter, quests }
  return acc
}, {})
console.log(fgo_quest_list)
const fgo_quest_data: QuestDataMap = fgo_data.quests.reduce((acc, chapter) => {
  chapter.quests.forEach((quest) => {
    acc[quest.id] = { chapterId: chapter.id, chapter: chapter.name, ...JSON.parse(JSON.stringify(quest)) }
  })
  return acc
}, {})

const questDropList: { [id: string]: { [itemId: string]: string } } = require('./dropdata.json')
const itemNames: { [id: string]: string } = require('./itemnames.json')
const group = ["", "種火", "スキル石", "銅素材", "銀素材", "金素材", "モニュメント・ピース", "", "伝承結晶"]

export const dropItems = (): DropItem[] => {
  return Object.entries(itemNames).reduce((acc, [idString, name]) => {
    const id = Number(idString)
    if (id >= 300 && id < 600) {
      acc.push({ name, group: group[(id / 100) >> 0], id })
    }
    return acc
  }, [])
}

export const questListByDropItem = (itemId: number): QuestDropRates[] => {
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
        }, {})
      })
    }
    return acc
  }, [])
}

const questDropItems = (questId: number): { id: number, group: string, name: string, rate: number }[] => {
  const questDrop = questDropList[questId]
  const dropItemIds = questDrop && Object.keys(questDrop).map((key) => Number(key)) || []
  const itemGroup = (itemId: number) => ((itemId / 100) >> 0)
  const itemSubGroup = (itemId: number) => (((itemId / 10) % 10) >> 0)

  const sortedDropItemIds = [
    ...dropItemIds.filter((itemId) => (itemGroup(itemId) == 5)).sort((a, b) => b - a),
    ...dropItemIds.filter((itemId) => (itemGroup(itemId) == 4)).sort((a, b) => b - a),
    ...dropItemIds.filter((itemId) => (itemGroup(itemId) == 3 && itemId != 308)).sort((a, b) => b - a),
    ...dropItemIds.filter((itemId) => (itemId == 308)),
    ...dropItemIds.filter((itemId) => (itemGroup(itemId) == 2)).sort((a, b) => (itemSubGroup(b) - itemSubGroup(a)) || (a - b)),
    ...dropItemIds.filter((itemId) => (itemGroup(itemId) == 6)).sort((a, b) => (itemSubGroup(b) - itemSubGroup(a)) || (a - b)),
    ...dropItemIds.filter((itemId) => (itemGroup(itemId) == 1)).sort((a, b) => (itemSubGroup(b) - itemSubGroup(a)) || (a - b)),
  ]

  return sortedDropItemIds.map((itemId) => (
    { id: itemId, group: group[itemGroup(itemId)], name: itemNames[itemId], rate: Number(questDrop[itemId]) }
  ))
}

export const questList = () => {
  return fgo_quest_list
}

export const questData = (id: number): QuestData => {
  if (fgo_quest_data[id]) {
    return { ...fgo_quest_data[id], drop: questDropItems(id) }
  }
  return undefined
}
