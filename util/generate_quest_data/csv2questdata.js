//
// convert freequest data csv to json
//
// Expected csv format.
// chapter: id	name
// area: chapter_id	area_id	name
// enemy: id	race	name	attributes	characteristics	dr
// quest: id	chapter_id	area_id	quest_id	name	lv	ap	bond	exp	qp	drop	attributes
// quest_enemy: id	quest_id	wave	pos	enemy_id	name	class	lv	hp	buff
//

fs = require('fs')
csv = require('csvtojson')

const csvs = process.argv.slice(2)

const csv2json = async (file) => {
  return await csv({checkType:true}).fromFile(file)
}

Promise.all([csv2json(csvs[0]), csv2json(csvs[1]), csv2json(csvs[2]), csv2json(csvs[3]), csv2json(csvs[4])])
.then(([chapter_array, area_array, enemy_array, quest_array, quest_enemy_array]) => {

  quest_array.forEach((item) => {
    const area = area_array.find((area_item) => {
     return ((area_item.area_id == item.area_id) && (area_item.chapter_id == item.chapter_id))
    })
    const chapter = chapter_array.find((chapter_item) => {
      return (chapter_item.id == item.chapter_id)
    })
    if (chapter.quests) {
      chapter.quests.push({ id: item.id, name: `${area.name} ${item.name}` })
     } else {
      chapter.quests = [ { id: item.id, name: `${area.name} ${item.name}` } ]
     }
  })
  const enemyData = enemy_array.reduce((acc, item) => {
    const {id, ...enemy_info} = item
    acc[id] = { ...enemy_info }
    return acc
  }, {})
  const questData = quest_array.reduce((acc, item) => {
    const {id, chapter_id, area_id, quest_id, ...quest_info} = item
    const area = area_array.find((area_item) => {
      return ((area_item.area_id == area_id) && (area_item.chapter_id == chapter_id))
     })
     const chapter = chapter_array.find((chapter_item) => {
       return (chapter_item.id == chapter_id)
     })
     acc[id] = { chapterId: chapter_id, chapter: chapter.name, area: area.name, ...quest_info, enemies: [] }
    return acc
  }, {})
  quest_enemy_array.forEach((item) => {
    const { id, quest_id, wave, pos, enemy_id, ...quest_enemy_info } = item
    if (questData[item.quest_id].enemies.length < wave) {
      questData[item.quest_id].enemies.push([])
    }
    questData[item.quest_id].enemies[wave - 1].push({ enemyId: enemy_id, ...quest_enemy_info})
  })
  const result = {
    quests: chapter_array,
    enemyData: enemyData,
    questData: questData
  }

  try {
    fs.writeFileSync("quest.json", JSON.stringify(result) + "\n")
  } catch (e) {
    console.log(e)
  }
})
