
const oldDropData = require('./../../src/fgo/dropdata.json')
const newDropData = require('./dropdata.json')
const questData = require('./quest.json')
const itemNames = require('../../src/fgo/itemnames.json')

const delta = parseFloat(process.argv[2])

const questNames = questData.quests.reduce((acc, chapter) => {
  chapter.quests.reduce((acc, quest) => {
    acc[quest.id] = chapter.name + "\t" + quest.name
    return acc
  }, acc)
  return acc
}, {})

let changed = false
Object.keys(newDropData).forEach((questId) => {
  const dropRates = newDropData[questId]
  const oldDropRates = oldDropData[questId]
  if (oldDropRates && Object.keys(oldDropRates).length > 0) {
    if (JSON.stringify(dropRates) != JSON.stringify(oldDropRates)) {
      Object.keys(dropRates).forEach((itemId) => {
        if (itemNames[itemId] && Math.abs(parseFloat(dropRates[itemId]) - parseFloat(oldDropRates[itemId])) >= delta) {
          !changed && console.log('chapter\tquest\titem\told\tnew') 
          changed = true
          console.log(`${questNames[questId]}\t${itemNames[itemId]}\t${oldDropRates[itemId]}\t${dropRates[itemId]}`)
        }
      })
    }
  } else {
    Object.keys(dropRates).forEach((itemId) => {
      if (itemNames[itemId]) {
        !changed && console.log('chapter\tquest\titem\told\tnew') 
        changed = true
        console.log(`${questNames[questId]}\t${itemNames[itemId]}\t0.0\t${dropRates[itemId]}`)
      }
    })
  }
})

if (Object.keys(newDropData).length < Object.keys(oldDropData).length) {
  console.log(`dropdata entries = ${Object.keys(newDropData).length},  less than previous entries = ${Object.keys(oldDropData).length}.`)
  process.exitCode = 1
} else {
  !changed && console.log('no differences')
  process.exitCode = changed ? 0 : 1
}
