const fs = require('fs')

const atlasdata = require('./atlas/0_nice_war.json')

const chapterNames = []
const areaNames = []
const questInfos = []
const missingQuestInfos = []

const convert_chaptername = (longName) => {
    return longName.split(/\n/).map((line, index) =>
        index ? line.split(/ /).splice(-1) : line
    ).join(" ")
}

const check_quest_info = (questId, phase) => {
    try {
        JSON.parse(fs.readFileSync(`./atlas/quests/${questId}-${phase}.json`))
    } catch (e) {
        missingQuestInfos.push(`curl -s -o ./atlas/quests/${questId}-${phase}.json https://api.atlasacademy.io/nice/JP/quest/${questId}/${phase}`)
    }
}

const tocsv = (records) => {
    return records.map((record) => {
        return Object.values(record).map((value) => {
            if (typeof value == 'number')
                return value
            return `"${value}"`
        }).join(',')
    }).join('\n')
}

const now = new Date() / 1000

atlasdata.forEach((chapter) => {
    const chapterName = convert_chaptername(chapter.longName)
    if (chapter.flags.findIndex((flag) => flag == 'mainScenario') >= 0) {
        chapter.spots.forEach((spot) => {
            var freeQuestIndex = 0
            if (spot.name == '代々木ニ丁目') {
                spot.name = '代々木二丁目'
            }
            if (spot.spotAdds.length > 0 && spot.spotAdds[0].overrideType == 'name') {
                spot.name = spot.spotAdds[0].targetText
            }
            spot.quests.forEach((quest) => {
                if (quest.type == 'free' && quest.afterClear != 'close' && quest.closedAt > now) {
                    if (chapterNames[chapterNames.length - 1] != chapterName) {
                        chapterNames.push(chapterName)
                    }
                    if (areaNames[areaNames.length - 1]?.name != spot.name) {
                        areaNames.push({chapter: chapterName, name: spot.name})
                    }
                    check_quest_info(quest.id, quest.phasesWithEnemies.slice(-1)[0])

                    questInfos.push({
                        quest: freeQuestIndex++,
                        chapter: chapterName,
                        area: spot.name,
                        name: quest.name,
                        questId: quest.id,
                    })
                }
            })
        })
    }
})

try {
    fs.writeFileSync('atlas/1_chapter.csv', chapterNames.join('\n'))
    fs.writeFileSync('atlas/2_area.csv', tocsv(areaNames))
    fs.writeFileSync('atlas/3_quest.csv', tocsv(questInfos))
    fs.writeFileSync('atlas/9_downloadMissingQuestInfo.sh', missingQuestInfos.sort(() => Math.random() - Math.random()).map((line, index, arr) =>
        `echo -n "${index + 1}/${arr.length} "; date; sleep ${10 + (Math.random() * 30) >> 0}; ${line}`
    ).join('\n'))
} catch (e) {
    console.log(e)
}

if (missingQuestInfos.length > 0) {
    console.log(`missing quest files(count = ${missingQuestInfos.length}.  run ./atlas/9_downloadMissingQuestInfo.sh`)
}