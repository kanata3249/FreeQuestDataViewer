
const oldDropData = require('./dropdata.old.json')
const newDropData = require('./dropdata.json')
const questData = require('./quest.json')
const itemNames = require('../../src/fgo/itemNames.json')

const delta = parseFloat(process.argv[2])

const questNames = questData.quests.reduce((acc, chapter) => {
  chapter.quests.reduce((acc, quest) => {
    acc[quest.id] = chapter.name + "\t" + quest.name
    return acc
  }, acc)
  return acc
}, {})

console.log('chapter\tquest\titem\told\tnew')
Object.keys(newDropData).forEach((questId) => {
  const dropRates = newDropData[questId]
  const oldDropRates = oldDropData[questId]
  if (JSON.stringify(dropRates) != JSON.stringify(oldDropRates)) {
    Object.keys(dropRates).forEach((itemId) => {
      if (itemId >= 300 && itemId < 600) {
        if (Math.abs(parseFloat(dropRates[itemId]) - parseFloat(oldDropRates[itemId])) >= delta) {
          console.log(`${questNames[questId]}\t${itemNames[itemId]}\t${oldDropRates[itemId]}\t${dropRates[itemId]}`)
        }
      }
    })
  }
})
