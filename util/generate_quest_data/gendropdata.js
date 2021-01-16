//
// convert drop data json to json
//
// Expected json format.
// FGOアイテム効率劇場 published json
//    https://spreadsheets.google.com/feeds/list/1TrfSDteVZnjUPz68rKzuZWZdZZBLqw03FlvEToOvqH0/8/public/values?alt=json
//

fs = require('fs')

const questdata = require('./quest.json')

const dropdata = JSON.parse(fs.readFileSync(process.argv[2], "utf8"))
const rows = dropdata.feed.entry

const known_areas = {
  "冬木": true,
  "オルレアン": true,
  "セプテム": true,
  "オケアノス": true,
  "ロンドン": true,
  "北米": true,
  "キャメロット": true,
  "バビロニア": true,
  "新宿": true,
  "アガルタ": true,
  "下総国": true,
  "セイレム": true,
  "アナスタシア": true,
  "ゲッテルデメルング": true,
  "シン": true,
  "ユガ・クシェートラ": true,
  "アトランティス": true,
  "オリュンポス": true,
  "平安京": true,
}

const convertKeyName = {
  "エリア": "chapter",
  "クエスト名": "questName",

  "輝石, 剣": "200",
  "輝石, 弓": "201",
  "輝石, 槍": "202",
  "輝石, 騎": "203",
  "輝石, 術": "204",
  "輝石, 殺": "205",
  "輝石, 狂": "206",
  
  "魔石, 剣": "210",
  "魔石, 弓": "211",
  "魔石, 槍": "212",
  "魔石, 騎": "213",
  "魔石, 術": "214",
  "魔石, 殺": "215",
  "魔石, 狂": "216",
  
  "秘石, 剣": "220",
  "秘石, 弓": "221",
  "秘石, 槍": "222",
  "秘石, 騎": "223",
  "秘石, 術": "224",
  "秘石, 殺": "225",
  "秘石, 狂": "226",
  
  "銅素材, 証": "300",
  "銅素材, 骨": "301",
  "銅素材, 牙": "302",
  "銅素材, 塵": "303",
  "銅素材, 鎖": "304",
  "銅素材, 毒針": "305",
  "銅素材, 髄液": "306",
  "銅素材, 鉄杭": "307",
  "銅素材, 火薬": "308",
  
  "銀素材, 種": "400",
  "銀素材, ﾗﾝﾀﾝ": "401",
  "銀素材, 八連": "402",
  "銀素材, 蛇玉": "403",
  "銀素材, 羽根": "404",
  "銀素材, 歯車": "405",
  "銀素材, 頁": "406",
  "銀素材, ホム": "407",
  "銀素材, 蹄鉄": "408",
  "銀素材, 勲章": "409",
  "銀素材, 貝殻": "410",
  "銀素材, 勾玉": "411",
  "銀素材, 結氷": "412",
  "銀素材, 指輪": "413",
  "銀素材, ｵｰﾛﾗ": "414",
  "銀素材, 鈴": "415",
  "銀素材, 矢尻": "416",
  "銀素材, 冠": "417",
  "銀素材, 霊子": "418",
  "銀素材, 糸玉": "419",
  
  "金素材, 爪": "500",
  "金素材, 心臓": "501",
  "金素材, 逆鱗": "502",
  "金素材, 根": "503",
  "金素材, 幼角": "504",
  "金素材, 涙石": "505",
  "金素材, 脂": "506",
  "金素材, ﾗﾝﾌﾟ": "507",
  "金素材, ｽｶﾗﾍﾞ": "508",
  "金素材, 産毛": "509",
  "金素材, 胆石": "510",
  "金素材, 神酒": "511",
  "金素材, 炉心": "512",
  "金素材, 鏡": "513",
  "金素材, 卵": "514",
  "金素材, ｶｹﾗ": "515",
  "金素材, 実": "516",
  "金素材, 鬼灯": "517",
  
  "ピース, 剣": "600",
  "ピース, 弓": "601",
  "ピース, 槍": "602",
  "ピース, 騎": "603",
  "ピース, 術": "604",
  "ピース, 殺": "605",
  "ピース, 狂": "606",
  
  "モニュ, 剣": "610",
  "モニュ, 弓": "611",
  "モニュ, 槍": "612",
  "モニュ, 騎": "613",
  "モニュ, 術": "614",
  "モニュ, 殺": "615",
  "モニュ, 狂": "616",
}

const findQuestId = (questName) => {
  const quest = questdata.quests.reduce((acc, chapter) => {
    return acc.concat(chapter.quests)
  },[]).find((quest) => {
    if (questName.match(/（.*）/)) {
      return quest.name.split(" ")[1].match(questName.replace(/^.*（(.*)）.*/, "$1"))
    } else {
      return quest.name.split(" ")[0] == questName
    }
  })

  if (quest) {
    return quest.id
  }
  console.log("unknown quest name", questName)
  return "0"
}
  
const ignore_categories = {
  "肖像": true,
  "ランチタイム": true,
  "肖像+ランチタイム": true,
  "ティータイム（茶）": true
}

const columns = {}

Object.keys(rows[0]).forEach((key) => {
  if (rows[0][key].$t && rows[0][key].$t.match(/^(エリア|クエスト名)/)) {
    columns[key] = rows[0][key].$t
  }
})

let category = ""
Object.keys(rows[1]).forEach((key) => {
  if (key.startsWith('gsx$_')) {
    if (rows[0][key]) {
      category = rows[0][key].$t
    }
    if (!ignore_categories[category]) {
      columns[key] = category + ", " + rows[1][key].$t
    }
  }
})
const results = rows.slice(2).map((row) => (
  Object.keys(columns).reduce((acc, columnKey) => {
    if (row[columnKey] && convertKeyName[columns[columnKey]]) {
      acc[convertKeyName[columns[columnKey]]] = row[columnKey].$t
    }
    return acc
  }, {})
)).filter((quest) => {
  return known_areas[quest["chapter"]]
}).reduce((acc, quest) => {
  const { chapter, questName, ...droprates } = quest
  acc[findQuestId(questName)] = droprates
  return acc
},{})

try {
  fs.writeFileSync("dropdata.json", JSON.stringify(results))
} catch (e) {
  console.log(e)
}
