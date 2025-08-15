const fs = require('fs')
const csv = require('csvtojson')

const atlasdata = require('./atlas/0_nice_war.json')

const grandTrainingBattle = '冠位戴冠戦'

const convert_chaptername = (longName) => {
    const lines = longName.split(/\n/)
    const titles = lines.reduce((acc, line) => {
        acc.push(line.split(/ /))
        return acc
    },[])

    if (titles[1]) {
        return `${titles[0].join(' ')} ${titles[1].splice(-1)}`
    } else {
        if (titles[0][1])
            return `${titles[0][0]} ${titles[0].splice(-1)}`
        else
            return titles[0][0]
    }
}

const printable_individuality = {
    'fieldSunlight': '陽射し',
    'fieldCity': '都市',
    'fieldShore': '水辺',
    'fieldForest': '森',
    'fieldBurning': '炎上',
    'fieldDarkness': '暗闇',
    'fieldAir': '空中',
    "milleniumCastle": "千年城",
}

const printable_classname = {
    'saber': '剣',
    'archer': '弓',
    'lancer': '槍',
    'rider': '騎',
    'caster': '術',
    'assassin': '殺',
    'berserker': '狂',
    'ruler': '裁',
    'avenger': '讐',
    'alterEgo': '分',
    'moonCancer': '月',
    'foreigner': '降',
    'pretender': '詐',
    'beast': '獣',
    'atlasUnmappedClass': '獣',
    'shielder': '盾',
}

const printable_attribute = {
    'sky': '天',
    'earth': '地',
    'human': '人',
    'star': '星',
    'beast': '獣'
}

const printable_traits = {
    "alignmentBalanced": "中庸",
    "alignmentChaotic": "混沌",
    "alignmentEvil": "悪",
    "alignmentGood": "善",
    "alignmentLawful": "秩序",
    "alignmentMadness": "狂",
    "alignmentNeutral": "中立",
    "alignmentSummer": "夏",
    "100600": "花嫁",
    "arthur": "アーサー",
    "artificialDemon": "造魔",
    "associatedToTheArgo": "アルゴノーツ",
    "atalante": "",
    "attributeBeast": "",
    "attributeEarth": "",
    "attributeHuman": "",
    "attributeSky": "",
    "attributeStar": "",
    "basedOnServant": "サーヴァント",
    "brynhildsBeloved": "愛する者",
    "canBeInBattle": "",
    "centaur": "ケンタウロス",
    "childServant": "子供",
    "servant": "サーヴァント",
    "chimera": "キメラ",
    "classAlterEgo": "",
    "classArcher": "",
    "classAssassin": "",
    "classAvenger": "",
    "classBeastI": "",
    "homunculus": "ホムンクルス",
    "automata": "オートマタ",
    "classBeastII": "",
    "amazoness": "アマゾネス",
    "classBeastIIIL": "",
    "spellBook": "スペルブック",
    "classBeastIIIR": "",
    "classBerserker": "",
    "classCaster": "",
    "classForeigner": "",
    "classGrandCaster": "",
    "classLancer": "",
    "classMoonCancer": "",
    "classPretender": "",
    "classRider": "",
    "classRuler": "",
    "classSaber": "",
    "classShielder": "",
    "golem": "ゴーレム",
    "demon": "悪魔",
    "demonBeast": "魔獣",
    "demonic": "魔性",
    "demonicBeastServant": "",
    "divine": "神性",
    "divineOrDemonOrUndead": "",
    "divineSpirit": "神霊",
    "dragon": "竜",
    "dragonType": "ドラゴン",
    "dragonSlayer": "",
    "existenceOutsideTheDomain": "領域外の生命",
    "fae": "妖精",
    "fairyTaleServant": "童話",
    "feminineLookingServant": "性別不明",
    "genderCaenisServant": "",
    "genderFemale": "女",
    "genderMale": "男",
    "genderUnknown": "性別不明",
    "genji": "源氏",
    "ghost": "ゴースト",
    "giant": "巨人",
    "greekMythologyMales": "ギリシャ神話系男性",
    "hasCostume": "",
    "hominidaeServant": "",
    "human": "人間",
    "humanoid": "人型",
    "illya": "イリヤ",
    "king": "王",
    "knightsOfTheRound": "円卓",
    "lamia": "ラミア",
    "livingHuman": "今を生きる人類",
    "mechanical": "機械",
    "nobunaga": "信長",
    "oni": "鬼",
    "riding": "騎乗スキル",
    "roman": "ローマ",
    "saberClassServant": "セイバークラスのサーヴァント",
    "saberface": "アルトリア顔",
    "shuten": "",
    "skeleton": "スケルトン",
    "skyOrEarth": "",
    "skyOrEarthExceptPseudoAndDemi": "",
    "soldier": "兵士",
    "superGiant": "超巨大",
    "threatToHumanity": "人類の脅威",
    "unknown": "",
    "undead": "死霊",
    "weakToEnumaElish": "",
    "werebeast": "獣人",
    "wildbeast": "猛獣",
    "wyvern": "ワイバーン",
    "zombie": "ゾンビ",
    "shinsengumiServant": "新撰組",
    "2840": "梁山泊",
    "holdingHolyGrail": "聖杯所持"
}

const convert_individuality = (individualities) => {
    return individualities.reduce((acc, individuality) => {
        const individuality_str = printable_individuality[individuality.name]
        if (!individuality_str) {
            console.log(`unknown field: ${individuality.name}`)
        }
        return [...acc, ...(individuality_str ? [individuality_str] : [])]
    }, []).join(' ')
}

const questLevelAndBondTemplate = {
  "100★★★": 4748,
  "100★★": 4438,
  "100★": 4147,
  "100+++": 3876,
  "100++": 3622,
  "100+": 3385,
  "100": 3164,
  "90★★★": 4557,
  "90★★": 3797,
  "90★": 3164,
  "90++": 2636,
  "90++": 1318,
  "90+": 1098
}

const gen_quest_level = (recommendLv, bond) => {
    const lvByBond = (Object.entries(questLevelAndBondTemplate).find((lv) => lv[1] == bond) || [ recommendLv, bond ])[0]
    const over90 = {
        '90+': 91,
        '90++': 92,
        '90+++': 93,
        '90★': 94,
        '90★★': 95,
        '90★★★': 96,
        '100': 100,
        '100+': 101,
        '100++': 102,
        '100+++': 103,
        '100★': 104,
        '100★★': 105,
        '100★★★': 106,
    }
    return over90[lvByBond] || parseInt(recommendLv)
}

const gen_enemy_type = (enemy) => {
    return enemy.name.startsWith('シャドウサーヴァント') ? `${enemy.name.replace(/[ＡＢＣ]$/, '')}\n${enemy.svt.name}` : enemy.svt.name
}

const gen_enemy_name = (enemy) => {
    return enemy.name.replace(/[ＡＢＣ]$/, '')
}

const gen_enemy_traits = (enemy) => {
    const alignment = []
    const traits = enemy.traits.reduce((acc, trait) => {
        if (printable_traits[trait.name]) {
            if (trait.name.startsWith('alignment')) {
                alignment.push(printable_traits[trait.name])
            } else {
                if (acc.findIndex((v) => v == printable_traits[trait.name]) < 0) {
                    acc.push(printable_traits[trait.name])
                }
            }
        }
        return acc
    }, [])
    const passive = enemy.classPassive.classPassive.reduce((acc, skill) => {
        skill.functions.forEach((func) => {
            if (func.funcPopupText == '弱体耐性アップ') {
                acc.push(`${skill.name.replace(' ', '')}(${func.svals[0].Value / 10}%)`)
            }
        })
        return acc
    }, [])

    return [...alignment, ...traits, ...passive].join(' ')
}

const gen_enemy_buffs = (enemy) => {
    if (enemy.classPassive.addPassive.length > 0) {
        return enemy.classPassive.addPassive.reduce((acc, addPassive) => {
            if (addPassive.name == 'テオス・クリロノミア') {
                acc.push('被ダメージカット-500')  // Ugh!
            }
            const defenceWeakness = addPassive.name.match('^対(.*)防御脆性$')
            if (defenceWeakness) {
                acc.push(`〔${defenceWeakness[1]}〕からの被ダメージ属性相性500%`)  // Ugh!
            }
            return acc
        },[])
    }
    return ''
}

const gen_enemies = (questId, questInfo) => {
    return questInfo.stages.map((stage) => {
        return stage.enemies.map((enemy) => {
            const spec = {
                attribute: printable_attribute[enemy.svt.attribute],
                characteristics: gen_enemy_traits(enemy),
                DR: `${enemy.deathRate / 10}%`
            }
            return {
                questId,
                wave: stage.wave,
                pos: enemy.deckId,
                type: gen_enemy_type(enemy),
                name: gen_enemy_name(enemy),
                class: printable_classname[enemy.svt.className],
                lv: enemy.lv,
                hp: enemy.hp,
                buff: gen_enemy_buffs(enemy),
                ...spec
            }
        }).flat()
    }).flat()
}

const load_quest_info = (questId, phase) => {
    let questInfo
    try {
        questInfo = JSON.parse(fs.readFileSync(`./atlas/quests/${questId}-${phase}.json`))
    } catch (e) {
        missingQuestInfos.push(`curl -s -o ./atlas/quests/${questId}-${phase}.json https://api.atlasacademy.io/nice/JP/quest/${questId}/${phase}`)
        return {}
    }

    return {
        lv: gen_quest_level(questInfo.recommendLv, questInfo.bond),
        ap: questInfo.consume,
        bond: questInfo.bond,
        exp: questInfo.exp,
        qp: questInfo.qp,
        drop: '',
        attributes: convert_individuality(questInfo.individuality),
        rawId: questId,
        enemies: gen_enemies(questId, questInfo)
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

const nextYear = new Date() / 1000 + 60 * 60 * 24 * 365
const chapterNames = []
const questData = { quests: [] }

const missingQuestInfos = []
const questInfos = {}

const csvs = process.argv.slice(2)

const csv2json = async (file) => {
    return await csv({ checkType: true }).fromFile(file)
}

Promise.all([csv2json(csvs[0]), csv2json(csvs[1]), csv2json(csvs[2])])
    .then(([chapter_array, area_array, quest_array]) => {
        chapter_array.sort((a, b) => a.id - b.id)
        quest_array.sort((a, b) => a.id - b.id)

        const chapter_map = chapter_array.reduce((acc, chapter) => {
            acc[chapter.name] = chapter.id
            return acc
        }, {})
        const quest_id_map = quest_array.reduce((acc, quest) => {
            acc[quest.raw_id] = quest.id
            return acc
        }, {})

        atlasdata.forEach((chapter) => {
            const convertedChapterName = convert_chaptername(chapter.longName)
            const isGrandTrainingBattle = convertedChapterName.startsWith(grandTrainingBattle)
            const chapterName = convertedChapterName
            if (chapter.flags.findIndex((flag) => flag == 'mainScenario') >= 0
                || chapter.name.startsWith(grandTrainingBattle)) {
                const chapterInfo = {
                    id: chapter_map[chapterName],
                    name: chapterName,
                    quests: []
                }

                chapter.spots.forEach((spot) => {
                    var freeQuestIndex = 0
                    if (spot.name == '代々木ニ丁目') {
                        spot.name = '代々木二丁目'
                    }
                    if (spot.spotAdds.length > 0 && spot.spotAdds[0].overrideType == 'name') {
                        spot.name = spot.spotAdds[0].targetText
                    }
                    spot.quests.forEach((quest) => {
                        if ((quest.type == 'free' || (quest.type == 'event' && isGrandTrainingBattle))
                             && quest.afterClear != 'close' && quest.closedAt > nextYear) {
                            if (chapterNames[chapterNames.length - 1] != chapterName) {
                                chapterNames.push(chapterName)
                                questData.quests.push(chapterInfo)
                            } else {
                                chapterInfo.quests = questData.quests[questData.quests.length - 1].quests
                            }

                            const { enemies, rawId, ...questInfo } = load_quest_info(quest.id, [ ...quest.phases, ...quest.phasesWithEnemies].slice(-1)[0])
                            if (!enemies) {
                                console.log('no quest info found, ', quest.id, chapterInfo.name, spot.name)
                            }

                            const enemies2 = enemies?.reduce((acc, enemy) => {
                                const { wave, pos, questId, type, name, attribute, characteristics, DR, ...enemyInfo } = enemy
                                if (acc.length < wave) {
                                    acc.push([])
                                }
                                acc[wave - 1].push({
                                    name: name.startsWith('シャドウサーヴァント') ? type : name,
                                    ...enemyInfo,
                                    attributes: attribute,
                                    characteristics,
                                    dr: parseFloat(DR)
                                })
                                return acc
                            }, [])

                            chapterInfo.quests.push(
                                questInfos[rawId] = {
                                    id: quest_id_map[quest.id.toString()],
                                    rawId: quest.id,
                                    area: spot.name,
                                    name: quest.name,
                                    ...questInfo,
                                    enemies: enemies2,
                                }
                            )
                        }
                    })
                    chapterInfo.quests.sort((a, b) => a.id - b.id)
                })
            }
        })
        questData.quests.sort((a, b) => a.id - b.id)

        try {
            fs.writeFileSync('quest.json', JSON.stringify(questData))
        } catch (e) {
            console.log(e)
        }

    })

