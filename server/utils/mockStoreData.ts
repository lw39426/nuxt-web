// Mock 角色图鉴数据（仅供服务端 Mock 使用，不依赖前端类型定义）
// YouMi 定位：以"商品模块"承载角色数据，复用 brand(作品)/tags(标签)/highlights(能力)/rating(综合评分)
interface MockProduct {
  id: number
  title?: string
  code?: string
  name?: string
  main_image?: string
  sales?: number
  stock?: number
  price: number
  originalPrice?: number
  description?: string
  rating?: number
  reviewCount?: number
  images?: string[]
  brand: string
  memory?: string
  isNew?: boolean
  isSale?: boolean
  [key: string]: any
}

export interface MockCategoryItem {
  id: number
  name: string
  imageUrl: string
}

// Mock数据：作品分类（每 IP 一个系列，覆盖 8 大 IP）
// imageUrl 为空 = 未配置图片：下游 UiImage 会展示占位图，待后端录入真实图片后自动展示
const STORE_CATEGORIES: MockCategoryItem[] = [
  {
    id: 101,
    name: '名侦探柯南',
    imageUrl: ''
  },
  {
    id: 102,
    name: '海贼王',
    imageUrl: ''
  },
  {
    id: 103,
    name: '火影忍者',
    imageUrl: ''
  },
  {
    id: 104,
    name: '龙珠',
    imageUrl: ''
  },
  {
    id: 105,
    name: '灌篮高手',
    imageUrl: ''
  },
  {
    id: 106,
    name: '漫威',
    imageUrl: ''
  },
  {
    id: 107,
    name: 'DC',
    imageUrl: ''
  },
  {
    id: 108,
    name: '原神',
    imageUrl: ''
  }
]

// 系列角色 Mock 数据（32 个角色，每 IP 3-5 个代表角色）
const STORE_SERIES_PRODUCTS: Record<string, MockProduct[]> = {
  名侦探柯南: [
    {
      id: 1,
      code: 'CHAR-CONAN-001',
      title: '江户川柯南',
      name: '江户川柯南',
      price: 0,
      description: '身体变小的高中生侦探，代号"真相的追寻者"。',
      rating: 9.5,
      brand: '名侦探柯南',
      era: '90年代',
      character_type: '侦探',
      origin: '《名侦探柯南》 青山刚昌 · 1994',
      background:
        '真实身份是高中生侦探工藤新一，因目击黑衣组织交易被灌下毒药 APTX4869，身体缩小成小学一年级模样。化名"江户川柯南"寄住在毛利侦探事务所，一边借助毛利小五郎的身份破案，一边追查黑衣组织的下落。',
      ratings: { popularity: 9.6, power: 6.5, intelligence: 10, charm: 8.8 },
      highlights: [
        { text: '超凡的推理洞察力' },
        { text: '精准的足球射门技术' },
        { text: '麻醉手表与变声领结' },
        { text: '滑板追击高手' }
      ],
      relationships: [
        { name: '毛利兰', relation: '青梅竹马 · 守护对象' },
        { name: '灰原哀', relation: '搭档 · 同类药受害者' },
        { name: '工藤新一', relation: '真实身份' }
      ],
      quotes: [{ text: '真相只有一个！', scene: '案件破解时刻' }],
      tags: [
        { id: 1, name: '侦探', color: '#3b82f6', weight: 10 },
        { id: 2, name: '高人气', color: '#f59e0b', weight: 10 }
      ],
      sales: 0,
      stock: 999,
      isNew: true
    },
    {
      id: 2,
      code: 'CHAR-CONAN-002',
      title: '毛利兰',
      name: '毛利兰',
      price: 0,
      description: '空手道高手，温柔与力量并存的少女。',
      rating: 9.0,
      brand: '名侦探柯南',
      era: '90年代',
      character_type: '女主角',
      origin: '《名侦探柯南》 青山刚昌 · 1994',
      background:
        '毛利小五郎的女儿，帝丹高中空手道部主力。青梅竹马工藤新一失踪后始终等待着他的归来，浑然不知身边的柯南就是新一本人。',
      ratings: { popularity: 9.2, power: 7.5, intelligence: 7.5, charm: 9.6 },
      highlights: [
        { text: '关东空手道大赛冠军级实力' },
        { text: '敏锐的直觉' },
        { text: '家务与料理全能' }
      ],
      relationships: [
        { name: '工藤新一', relation: '青梅竹马' },
        { name: '毛利小五郎', relation: '父亲' },
        { name: '铃木园子', relation: '挚友' }
      ],
      quotes: [{ text: '我一定会等他回来的。', scene: '等待新一' }],
      tags: [
        { id: 1, name: '空手道', color: '#ef4444', weight: 8 },
        { id: 2, name: '温柔', color: '#ec4899', weight: 8 }
      ],
      sales: 0,
      stock: 999
    },
    {
      id: 3,
      code: 'CHAR-CONAN-003',
      title: '怪盗基德',
      name: '怪盗基德',
      price: 0,
      description: '月光下的魔术师，窃取宝石只为寻找一粒传奇。',
      rating: 9.3,
      brand: '名侦探柯南',
      era: '90年代',
      character_type: '怪盗',
      origin: '《名侦探柯南》 青山刚昌 · 1994',
      background:
        '真实身份为黑羽快斗，为查明父亲被神秘组织暗杀的真相，继承"怪盗基德"之名。每次预告盗取宝石都是为了寻找传说中的"潘多拉"，得手后总会归还。',
      ratings: { popularity: 9.5, power: 6.0, intelligence: 9.5, charm: 9.8 },
      highlights: [
        { text: '登峰造极的魔术手法' },
        { text: '瞬间易容与变声' },
        { text: '滑翔翼空中逃脱' }
      ],
      relationships: [
        { name: '黑羽快斗', relation: '真实身份' },
        { name: '江户川柯南', relation: '宿命对手' },
        { name: '中森青子', relation: '青梅竹马' }
      ],
      quotes: [{ text: 'Ladies and gentlemen，演出开始了！', scene: '预告函之夜' }],
      tags: [
        { id: 1, name: '怪盗', color: '#8b5cf6', weight: 10 },
        { id: 2, name: '高人气', color: '#f59e0b', weight: 10 }
      ],
      sales: 0,
      stock: 999,
      isNew: true
    },
    {
      id: 4,
      code: 'CHAR-CONAN-004',
      title: '灰原哀',
      name: '灰原哀',
      price: 0,
      description: '逃离组织的天才科学家，冷静外表下藏着柔软的心。',
      rating: 9.2,
      brand: '名侦探柯南',
      era: '90年代',
      character_type: '科学家',
      origin: '《名侦探柯南》 青山刚昌 · 1994',
      background:
        '原名宫野志保，原黑衣组织科学家，代号"雪莉"，APTX4869 的研发者。姐姐被组织杀害后服药逃亡，身体缩小后化名灰原哀，被阿笠博士收留，成为柯南最重要的伙伴。',
      ratings: { popularity: 9.4, power: 5.0, intelligence: 10, charm: 9.3 },
      highlights: [
        { text: '顶级药物研发能力' },
        { text: '多国语言与黑客技术' },
        { text: '冷静的危机判断' }
      ],
      relationships: [
        { name: '江户川柯南', relation: '生死搭档' },
        { name: '宫野明美', relation: '姐姐' },
        { name: '阿笠博士', relation: '监护人' }
      ],
      quotes: [{ text: '逃跑是没有用的，侦探先生。', scene: '初登场' }],
      tags: [
        { id: 1, name: '天才', color: '#6366f1', weight: 9 },
        { id: 2, name: '冷静', color: '#0ea5e9', weight: 8 }
      ],
      sales: 0,
      stock: 999
    }
  ],
  海贼王: [
    {
      id: 11,
      code: 'CHAR-OP-001',
      title: '蒙奇·D·路飞',
      name: '蒙奇·D·路飞',
      price: 0,
      description: '要成为海贼王的男人，草帽一伙船长。',
      rating: 9.8,
      brand: '海贼王',
      era: '90年代',
      character_type: '主角',
      origin: '《海贼王》 尾田荣一郎 · 1997',
      background:
        '吃了橡胶果实的少年，立志找到大秘宝 ONE PIECE 成为海贼王。从东海风车村出发，一路聚集伙伴、挑战七武海与四皇，"五档"觉醒后将想象力化为战斗力。',
      ratings: { popularity: 10, power: 10, intelligence: 6.5, charm: 9.8 },
      highlights: [
        { text: '橡胶果实五档觉醒' },
        { text: '霸王色霸气缠绕' },
        { text: '不屈的意志力' },
        { text: '天生的领袖魅力' }
      ],
      relationships: [
        { name: '罗罗诺亚·索隆', relation: '第一位伙伴' },
        { name: '波特卡斯·D·艾斯', relation: '结义兄长' },
        { name: '香克斯', relation: '草帽的原主 · 恩人' }
      ],
      quotes: [{ text: '我是要成为海贼王的男人！', scene: '冒险宣言' }],
      tags: [
        { id: 1, name: '草帽团', color: '#f59e0b', weight: 10 },
        { id: 2, name: '船长', color: '#ef4444', weight: 10 }
      ],
      sales: 0,
      stock: 999,
      isNew: true
    },
    {
      id: 12,
      code: 'CHAR-OP-002',
      title: '罗罗诺亚·索隆',
      name: '罗罗诺亚·索隆',
      price: 0,
      description: '立志成为世界第一剑豪的三刀流剑士。',
      rating: 9.6,
      brand: '海贼王',
      era: '90年代',
      character_type: '剑豪',
      origin: '《海贼王》 尾田荣一郎 · 1997',
      background:
        '为完成与青梅竹马古伊娜的约定而立志成为世界第一大剑豪。鹰眼米霍克的弟子兼宿敌，草帽一伙的战斗主力，却是个不折不扣的路痴。',
      ratings: { popularity: 9.8, power: 10, intelligence: 7.0, charm: 9.5 },
      highlights: [
        { text: '三刀流剑术奥义' },
        { text: '霸王色霸气' },
        { text: '鬼气九刀流·阿修罗' }
      ],
      relationships: [
        { name: '蒙奇·D·路飞', relation: '船长' },
        { name: '乔拉可尔·米霍克', relation: '师匠 · 宿敌' },
        { name: '古伊娜', relation: '青梅竹马 · 约定之人' }
      ],
      quotes: [{ text: '我绝对不会再输了！', scene: '对鹰眼之战' }],
      tags: [
        { id: 1, name: '草帽团', color: '#f59e0b', weight: 10 },
        { id: 2, name: '剑士', color: '#22c55e', weight: 10 }
      ],
      sales: 0,
      stock: 999,
      isNew: true
    },
    {
      id: 13,
      code: 'CHAR-OP-003',
      title: '娜美',
      name: '娜美',
      price: 0,
      description: '精通气象的航海士，爱钱如命的草帽团智囊。',
      rating: 9.1,
      brand: '海贼王',
      era: '90年代',
      character_type: '航海士',
      origin: '《海贼王》 尾田荣一郎 · 1997',
      background:
        '原可可亚西村的贼猫，为赎回被阿龙占领的家乡而偷窃海贼的财物。加入草帽一伙后绘制世界地图，是天候棒与航海气象的专家。',
      ratings: { popularity: 9.0, power: 7.0, intelligence: 9.0, charm: 9.4 },
      highlights: [
        { text: '天候棒气象操控' },
        { text: '顶级航海与绘图技术' },
        { text: '敏锐的金钱嗅觉' }
      ],
      relationships: [
        { name: '蒙奇·D·路飞', relation: '船长' },
        { name: '贝尔梅尔', relation: '养母' },
        { name: '诺琪高', relation: '义姐' }
      ],
      quotes: [{ text: '我要绘制出自己亲眼看到的世界地图！', scene: '梦想宣言' }],
      tags: [
        { id: 1, name: '草帽团', color: '#f59e0b', weight: 10 },
        { id: 2, name: '航海士', color: '#0ea5e9', weight: 9 }
      ],
      sales: 0,
      stock: 999
    },
    {
      id: 14,
      code: 'CHAR-OP-004',
      title: '山治',
      name: '山治',
      price: 0,
      description: '寻找传说之海的厨师，踢技如烈焰。',
      rating: 9.2,
      brand: '海贼王',
      era: '90年代',
      character_type: '厨师',
      origin: '《海贼王》 尾田荣一郎 · 1997',
      background:
        '文斯莫克家族第三子，幼年遭受父亲虐待后逃离杰尔马王国，被海上餐厅老板哲普所救。立志寻找传说之海 All Blue，是草帽一伙的主厨与三大战力之一。',
      ratings: { popularity: 9.3, power: 9.5, intelligence: 8.5, charm: 9.6 },
      highlights: [
        { text: '恶魔风脚·烈焰踢技' },
        { text: '月步空中行走' },
        { text: '战斗料理双绝' }
      ],
      relationships: [
        { name: '蒙奇·D·路飞', relation: '船长' },
        { name: '哲普', relation: '救命恩人 · 师匠' },
        { name: '文斯莫克家族', relation: '血亲 · 决裂' }
      ],
      quotes: [{ text: '无论何时，都不能辜负女士。', scene: '骑士道时刻' }],
      tags: [
        { id: 1, name: '草帽团', color: '#f59e0b', weight: 10 },
        { id: 2, name: '骑士道', color: '#8b5cf6', weight: 9 }
      ],
      sales: 0,
      stock: 999
    },
    {
      id: 15,
      code: 'CHAR-OP-005',
      title: '妮可·罗宾',
      name: '妮可·罗宾',
      price: 0,
      description: '能读懂历史正文的考古学家，黑暗中的幸存者。',
      rating: 9.0,
      brand: '海贼王',
      era: '90年代',
      character_type: '考古学家',
      origin: '《海贼王》 尾田荣一郎 · 1997',
      background:
        '奥哈拉毁灭的唯一幸存者，世界上唯一能读懂历史正文的人。被世界政府通缉二十年，直到司法岛事件被草帽一伙"抢"回，才第一次拥有真正的归宿。',
      ratings: { popularity: 8.9, power: 7.5, intelligence: 10, charm: 9.5 },
      highlights: [
        { text: '花花果实多点开花' },
        { text: '古代文字解读能力' },
        { text: '丰富的暗杀知识' }
      ],
      relationships: [
        { name: '蒙奇·D·路飞', relation: '船长 · 救赎者' },
        { name: '萨乌罗', relation: '挚友' },
        { name: '克洛克达尔', relation: '前上司' }
      ],
      quotes: [{ text: '我想活下去！带我一起出海吧！', scene: '司法岛' }],
      tags: [
        { id: 1, name: '草帽团', color: '#f59e0b', weight: 10 },
        { id: 2, name: '天才', color: '#6366f1', weight: 9 }
      ],
      sales: 0,
      stock: 999
    }
  ],
  火影忍者: [
    {
      id: 21,
      code: 'CHAR-NARUTO-001',
      title: '漩涡鸣人',
      name: '漩涡鸣人',
      price: 0,
      description: '从吊车尾到七代目火影的忍道践行者。',
      rating: 9.7,
      brand: '火影忍者',
      era: '90年代',
      character_type: '主角',
      origin: '《火影忍者》 岸本齐史 · 1999',
      background:
        '九尾人柱力，自幼被村民疏远，却以"永不放弃"的忍道赢得所有人认可。师从自来也，第四次忍界大战中与佐助并肩封印辉夜，最终实现梦想成为第七代火影。',
      ratings: { popularity: 9.8, power: 10, intelligence: 7.0, charm: 9.5 },
      highlights: [
        { text: '仙人模式与六道之力' },
        { text: '螺旋丸全系奥义' },
        { text: '九尾查克拉完全同调' }
      ],
      relationships: [
        { name: '宇智波佐助', relation: '挚友 · 一生之敌' },
        { name: '自来也', relation: '师匠' },
        { name: '波风水门', relation: '父亲' }
      ],
      quotes: [{ text: '我说到做到，这就是我的忍道！', scene: '忍道宣言' }],
      tags: [
        { id: 1, name: '木叶', color: '#22c55e', weight: 10 },
        { id: 2, name: '火影', color: '#f97316', weight: 10 }
      ],
      sales: 0,
      stock: 999,
      isNew: true
    },
    {
      id: 22,
      code: 'CHAR-NARUTO-002',
      title: '宇智波佐助',
      name: '宇智波佐助',
      price: 0,
      description: '背负复仇之名的天才，独行于黑暗中的影。',
      rating: 9.6,
      brand: '火影忍者',
      era: '90年代',
      character_type: '天才',
      origin: '《火影忍者》 岸本齐史 · 1999',
      background:
        '宇智波一族幸存者，为向灭族仇人鼬复仇而走上孤独之路。知晓真相后目标转向木叶高层，最终之战败给鸣人后放下仇恨，以"影之火影"的方式守护村子。',
      ratings: { popularity: 9.7, power: 10, intelligence: 9.0, charm: 9.7 },
      highlights: [
        { text: '写轮眼·须佐能乎' },
        { text: '千鸟与雷遁奥义' },
        { text: '轮回眼时空间忍术' }
      ],
      relationships: [
        { name: '漩涡鸣人', relation: '挚友 · 宿命对手' },
        { name: '宇智波鼬', relation: '兄长' },
        { name: '春野樱', relation: '妻子' }
      ],
      quotes: [{ text: '我早已闭上了双眼，我的目的只在黑暗之中。', scene: '复仇之路' }],
      tags: [
        { id: 1, name: '宇智波', color: '#ef4444', weight: 10 },
        { id: 2, name: '天才', color: '#6366f1', weight: 9 }
      ],
      sales: 0,
      stock: 999,
      isNew: true
    },
    {
      id: 23,
      code: 'CHAR-NARUTO-003',
      title: '春野樱',
      name: '春野樱',
      price: 0,
      description: '从暗恋少女成长为顶尖医疗忍者的新时代三忍。',
      rating: 8.8,
      brand: '火影忍者',
      era: '90年代',
      character_type: '医疗忍者',
      origin: '《火影忍者》 岸本齐史 · 1999',
      background:
        '第七班唯一的女性成员，师从五代目火影纲手，习得百豪之术与怪力。第四次忍界大战中担任医疗后勤核心，战后成为木叶医院的顶梁柱。',
      ratings: { popularity: 8.8, power: 8.5, intelligence: 8.5, charm: 9.0 },
      highlights: [
        { text: '百豪之术·无限再生' },
        { text: '纲手传承的怪力' },
        { text: '顶级医疗忍术' }
      ],
      relationships: [
        { name: '宇智波佐助', relation: '丈夫' },
        { name: '纲手', relation: '师匠' },
        { name: '漩涡鸣人', relation: '队友' }
      ],
      quotes: [{ text: '这一次，换我来守护你们两个！', scene: '第四次忍界大战' }],
      tags: [
        { id: 1, name: '木叶', color: '#22c55e', weight: 10 },
        { id: 2, name: '医疗', color: '#14b8a6', weight: 8 }
      ],
      sales: 0,
      stock: 999
    },
    {
      id: 24,
      code: 'CHAR-NARUTO-004',
      title: '旗木卡卡西',
      name: '旗木卡卡西',
      price: 0,
      description: '拷贝了千种忍术的写轮眼天才，第七班导师。',
      rating: 9.3,
      brand: '火影忍者',
      era: '90年代',
      character_type: '导师',
      origin: '《火影忍者》 岸本齐史 · 1999',
      background:
        '木叶白牙之子，"拷贝忍者"之名响彻忍界。带土托付的写轮眼成为他一生的羁绊，作为第七班导师引导鸣人、佐助、小樱走上各自的忍道，后继任第六代火影。',
      ratings: { popularity: 9.4, power: 9.5, intelligence: 9.5, charm: 9.2 },
      highlights: [
        { text: '写轮眼拷贝千种忍术' },
        { text: '雷切·体术奥义' },
        { text: '神威时空间瞳术' }
      ],
      relationships: [
        { name: '宇智波带土', relation: '挚友 · 写轮眼赠与者' },
        { name: '第七班', relation: '学生' },
        { name: '波风水门', relation: '师匠' }
      ],
      quotes: [
        { text: '不遵守规则的人被称为废物，但不珍惜伙伴的人连废物都不如。', scene: '生存演习' }
      ],
      tags: [
        { id: 1, name: '木叶', color: '#22c55e', weight: 10 },
        { id: 2, name: '导师', color: '#8b5cf6', weight: 9 }
      ],
      sales: 0,
      stock: 999
    }
  ],
  龙珠: [
    {
      id: 31,
      code: 'CHAR-DB-001',
      title: '孙悟空',
      name: '孙悟空',
      price: 0,
      description: '为变强而生的赛亚人，地球最强的守护者。',
      rating: 9.9,
      brand: '龙珠',
      era: '80年代',
      character_type: '主角',
      origin: '《龙珠》 鸟山明 · 1984',
      background:
        '在地球长大的赛亚人卡卡罗特，自幼跟随龟仙人修行。从寻找龙珠的冒险少年成长为超级赛亚人，一次次在地球存亡之际突破极限，纯粹地为"变强"而活。',
      ratings: { popularity: 10, power: 10, intelligence: 6.0, charm: 9.5 },
      highlights: [
        { text: '超级赛亚人全系变身' },
        { text: '瞬间移动' },
        { text: '龟派气功·元气弹' }
      ],
      relationships: [
        { name: '贝吉塔', relation: '宿命对手 · 战友' },
        { name: '龟仙人', relation: '师匠' },
        { name: '琪琪', relation: '妻子' }
      ],
      quotes: [{ text: '哦嗨哟！我是孙悟空！', scene: '经典登场' }],
      tags: [
        { id: 1, name: '赛亚人', color: '#f97316', weight: 10 },
        { id: 2, name: '经典', color: '#f59e0b', weight: 10 }
      ],
      sales: 0,
      stock: 999,
      isNew: true
    },
    {
      id: 32,
      code: 'CHAR-DB-002',
      title: '贝吉塔',
      name: '贝吉塔',
      price: 0,
      description: '骄傲的赛亚人王子，永远追赶卡卡罗特的背影。',
      rating: 9.5,
      brand: '龙珠',
      era: '80年代',
      character_type: '王子',
      origin: '《龙珠》 鸟山明 · 1984',
      background:
        '赛亚人行星的王子，初登场时是入侵地球的强敌，败于悟空后为超越他而留在地球。从骄傲的侵略者成长为守护家园的战士，是布尔玛的丈夫、特兰克斯的父亲。',
      ratings: { popularity: 9.6, power: 10, intelligence: 8.0, charm: 9.0 },
      highlights: [
        { text: '超级赛亚人蓝' },
        { text: '王子战技·终极闪光' },
        { text: '自我牺牲的觉悟' }
      ],
      relationships: [
        { name: '孙悟空', relation: '宿命对手' },
        { name: '布尔玛', relation: '妻子' },
        { name: '特兰克斯', relation: '儿子' }
      ],
      quotes: [{ text: '我是骄傲的赛亚人王子，贝吉塔！', scene: '战斗宣言' }],
      tags: [
        { id: 1, name: '赛亚人', color: '#f97316', weight: 10 },
        { id: 2, name: '骄傲', color: '#6366f1', weight: 9 }
      ],
      sales: 0,
      stock: 999
    },
    {
      id: 33,
      code: 'CHAR-DB-003',
      title: '比克',
      name: '比克',
      price: 0,
      description: '由邪转正的那美克星战士，悟家的守护者。',
      rating: 9.0,
      brand: '龙珠',
      era: '80年代',
      character_type: '战士',
      origin: '《龙珠》 鸟山明 · 1984',
      background:
        '短笛大魔王的分身，原本为复仇而生的邪念体，在与孙悟饭的相处中被感化。成为悟饭的师父后彻底洗心革面，是悟空不在时最可靠的伙伴。',
      ratings: { popularity: 9.0, power: 9.0, intelligence: 9.0, charm: 8.0 },
      highlights: [
        { text: '那美克星人超速再生' },
        { text: '魔贯光杀炮' },
        { text: '同化增幅战力' }
      ],
      relationships: [
        { name: '孙悟饭', relation: '弟子 · 如亲子' },
        { name: '孙悟空', relation: '宿敌 · 战友' },
        { name: '短笛大魔王', relation: '本体 · 父' }
      ],
      quotes: [{ text: '悟饭，好好活着。', scene: '牺牲时刻' }],
      tags: [
        { id: 1, name: '那美克星', color: '#22c55e', weight: 9 },
        { id: 2, name: '导师', color: '#8b5cf6', weight: 8 }
      ],
      sales: 0,
      stock: 999
    }
  ],
  灌篮高手: [
    {
      id: 41,
      code: 'CHAR-SLAM-001',
      title: '樱木花道',
      name: '樱木花道',
      price: 0,
      description: '自称天才的问题少年，篮板下的红色风暴。',
      rating: 9.4,
      brand: '灌篮高手',
      era: '90年代',
      character_type: '主角',
      origin: '《灌篮高手》 井上雄彦 · 1990',
      background:
        '湘北高中一年级问题少年，为讨好晴子而加入篮球队，却真正爱上了篮球。凭借超人的身体素质和"我是天才"的自信，从门外汉飞速成长为左右胜负的关键球员。',
      ratings: { popularity: 9.5, power: 9.0, intelligence: 5.5, charm: 9.3 },
      highlights: [
        { text: '超常的身体爆发力' },
        { text: '天才篮板嗅觉' },
        { text: '两万次投篮特训' }
      ],
      relationships: [
        { name: '赤木晴子', relation: '暗恋对象' },
        { name: '流川枫', relation: '宿敌 · 队友' },
        { name: '赤木刚宪', relation: '队长' }
      ],
      quotes: [{ text: '我是天才！', scene: '高光时刻' }],
      tags: [
        { id: 1, name: '湘北', color: '#ef4444', weight: 10 },
        { id: 2, name: '篮板', color: '#f97316', weight: 9 }
      ],
      sales: 0,
      stock: 999,
      isNew: true
    },
    {
      id: 42,
      code: 'CHAR-SLAM-002',
      title: '流川枫',
      name: '流川枫',
      price: 0,
      description: '沉默寡言的超级新星，湘北的王牌得分手。',
      rating: 9.3,
      brand: '灌篮高手',
      era: '90年代',
      character_type: '王牌',
      origin: '《灌篮高手》 井上雄彦 · 1990',
      background:
        '湘北高中一年级的得分机器，富丘中学的传奇。球风冷傲独断，唯一的目标是成为日本第一的高中生球员，为此选择在赴美留学前先战胜仙道。',
      ratings: { popularity: 9.4, power: 9.0, intelligence: 8.0, charm: 9.8 },
      highlights: [
        { text: '无解的单打得分能力' },
        { text: '野兽级的滞空拉杆' },
        { text: '逐渐觉醒的团队意识' }
      ],
      relationships: [
        { name: '樱木花道', relation: '宿敌 · 队友' },
        { name: '仙道彰', relation: '追赶的目标' },
        { name: '赤木晴子', relation: '被暗恋' }
      ],
      quotes: [{ text: '辅助我一下就好。', scene: '山王之战' }],
      tags: [
        { id: 1, name: '湘北', color: '#ef4444', weight: 10 },
        { id: 2, name: '王牌', color: '#8b5cf6', weight: 9 }
      ],
      sales: 0,
      stock: 999
    },
    {
      id: 43,
      code: 'CHAR-SLAM-003',
      title: '赤木晴子',
      name: '赤木晴子',
      price: 0,
      description: '温柔可爱的篮球队经理，樱木篮球之路的起点。',
      rating: 8.7,
      brand: '灌篮高手',
      era: '90年代',
      character_type: '女主角',
      origin: '《灌篮高手》 井上雄彦 · 1990',
      background:
        '湘北队长赤木刚宪的妹妹，篮球队经理。一句"你喜欢篮球吗"将樱木花道带进篮球世界，自己也在不知不觉中见证并守护着这群少年的成长。',
      ratings: { popularity: 8.8, power: 4.0, intelligence: 7.5, charm: 9.5 },
      highlights: [{ text: '敏锐的球场观察力' }, { text: '对篮球纯粹的热忱' }],
      relationships: [
        { name: '樱木花道', relation: '被暗恋 · 挚友' },
        { name: '赤木刚宪', relation: '兄长' },
        { name: '流川枫', relation: '暗恋对象' }
      ],
      quotes: [{ text: '你喜欢篮球吗？', scene: '命运的相遇' }],
      tags: [
        { id: 1, name: '湘北', color: '#ef4444', weight: 10 },
        { id: 2, name: '温柔', color: '#ec4899', weight: 8 }
      ],
      sales: 0,
      stock: 999
    }
  ],
  漫威: [
    {
      id: 51,
      code: 'CHAR-MARVEL-001',
      title: '钢铁侠',
      name: '钢铁侠',
      price: 0,
      description: '天才、亿万富翁、花花公子、慈善家——我是钢铁侠。',
      rating: 9.7,
      brand: '漫威',
      era: '10年代',
      character_type: '英雄',
      origin: '《钢铁侠》 漫威影业 · 2008',
      background:
        '斯塔克工业继承人托尼·斯塔克，被绑架后打造第一代战甲逃出生天，从此以钢铁侠身份守护世界。复仇者联盟的创始人之一，最终以无限手套的响指换回半个宇宙的生命。',
      ratings: { popularity: 9.8, power: 9.5, intelligence: 10, charm: 9.8 },
      highlights: [
        { text: '马克系列纳米战甲' },
        { text: '天才级工程学头脑' },
        { text: '贾维斯 AI 辅助作战' }
      ],
      relationships: [
        { name: '美国队长', relation: '战友 · 挚友' },
        { name: '小辣椒', relation: '妻子' },
        { name: '蜘蛛侠', relation: '弟子' }
      ],
      quotes: [{ text: 'I am Iron Man.', scene: '终局之战' }],
      tags: [
        { id: 1, name: '复仇者', color: '#ef4444', weight: 10 },
        { id: 2, name: '天才', color: '#6366f1', weight: 10 }
      ],
      sales: 0,
      stock: 999,
      isNew: true
    },
    {
      id: 52,
      code: 'CHAR-MARVEL-002',
      title: '蜘蛛侠',
      name: '蜘蛛侠',
      price: 0,
      description: '能力越大，责任越大——你的友好邻居。',
      rating: 9.5,
      brand: '漫威',
      era: '10年代',
      character_type: '英雄',
      origin: '《蜘蛛侠》 漫威 · 1962',
      background:
        '被放射性蜘蛛咬伤的高中生彼得·帕克，获得超强力量与蜘蛛感应。本可以阻止却放走的劫匪害死了叔叔本，从此谨记"能力越大，责任越大"的信条。',
      ratings: { popularity: 9.6, power: 8.5, intelligence: 9.0, charm: 9.5 },
      highlights: [
        { text: '蜘蛛感应预判危险' },
        { text: '蛛网发射器' },
        { text: '天才级科学头脑' }
      ],
      relationships: [
        { name: '钢铁侠', relation: '导师 · 如父' },
        { name: '梅婶', relation: '监护人' },
        { name: '本叔叔', relation: '已故亲人 · 信条之源' }
      ],
      quotes: [{ text: '能力越大，责任越大。', scene: '叔叔的遗训' }],
      tags: [
        { id: 1, name: '复仇者', color: '#ef4444', weight: 10 },
        { id: 2, name: '邻居英雄', color: '#3b82f6', weight: 9 }
      ],
      sales: 0,
      stock: 999,
      isNew: true
    },
    {
      id: 53,
      code: 'CHAR-MARVEL-003',
      title: '美国队长',
      name: '美国队长',
      price: 0,
      description: '我可以打一整天——二战走出的传奇士兵。',
      rating: 9.3,
      brand: '漫威',
      era: '10年代',
      character_type: '英雄',
      origin: '《美国队长》 漫威 · 1941',
      background:
        '瘦弱的布鲁克林青年史蒂夫·罗杰斯，注射超级士兵血清后成为人类体能巅峰。冰封七十年后苏醒于现代，复联的精神领袖，最终选择回到过去与佩姬共度一生。',
      ratings: { popularity: 9.4, power: 9.0, intelligence: 8.5, charm: 9.2 },
      highlights: [
        { text: '超级士兵血清强化' },
        { text: '振金盾牌攻防一体' },
        { text: '不灭的意志与领袖力' }
      ],
      relationships: [
        { name: '钢铁侠', relation: '战友 · 挚友' },
        { name: '巴基', relation: '挚友' },
        { name: '佩姬·卡特', relation: '一生挚爱' }
      ],
      quotes: [{ text: '我可以打一整天。', scene: '小巷之战' }],
      tags: [
        { id: 1, name: '复仇者', color: '#ef4444', weight: 10 },
        { id: 2, name: '领袖', color: '#f59e0b', weight: 9 }
      ],
      sales: 0,
      stock: 999
    },
    {
      id: 54,
      code: 'CHAR-MARVEL-004',
      title: '雷神',
      name: '雷神',
      price: 0,
      description: '阿斯加德的雷霆之神，风暴战斧的主人。',
      rating: 9.1,
      brand: '漫威',
      era: '10年代',
      character_type: '英雄',
      origin: '《雷神》 漫威 · 1962',
      background:
        '阿斯加德众神之父奥丁之子，雷霆之力的化身。曾被放逐地球学会谦逊，失去雷神之锤后觉醒风暴战斧，是复仇者联盟中最强大的战力之一。',
      ratings: { popularity: 9.2, power: 10, intelligence: 7.5, charm: 9.0 },
      highlights: [{ text: '雷霆之力本体' }, { text: '风暴战斧' }, { text: '神级体魄与长寿' }],
      relationships: [
        { name: '洛基', relation: '弟弟 · 挚友' },
        { name: '奥丁', relation: '父亲' },
        { name: '绿巨人', relation: '战友' }
      ],
      quotes: [{ text: '他还要再来一次吗？', scene: '萨卡竞技场' }],
      tags: [
        { id: 1, name: '复仇者', color: '#ef4444', weight: 10 },
        { id: 2, name: '神明', color: '#8b5cf6', weight: 9 }
      ],
      sales: 0,
      stock: 999
    },
    {
      id: 55,
      code: 'CHAR-MARVEL-005',
      title: '浩克',
      name: '浩克',
      price: 0,
      description: '越愤怒越强大的绿色巨人，班纳博士的另一面。',
      rating: 9.0,
      brand: '漫威',
      era: '10年代',
      character_type: '英雄',
      origin: '《无敌浩克》 漫威 · 1962',
      background:
        '科学家布鲁斯·班纳在伽马炸弹事故中身体变异，情绪激动时会变身绿巨人浩克。力量没有上限，愤怒越深越强，最终班纳与浩克达成和解合为一体。',
      ratings: { popularity: 9.1, power: 10, intelligence: 8.0, charm: 7.5 },
      highlights: [
        { text: '无上限的愤怒力量' },
        { text: '超强的再生能力' },
        { text: '班纳的天才头脑' }
      ],
      relationships: [
        { name: '布鲁斯·班纳', relation: '本体' },
        { name: '黑寡妇', relation: '挚爱' },
        { name: '雷神', relation: '战友' }
      ],
      quotes: [{ text: '浩克，砸！', scene: '战斗时刻' }],
      tags: [
        { id: 1, name: '复仇者', color: '#ef4444', weight: 10 },
        { id: 2, name: '力量型', color: '#22c55e', weight: 9 }
      ],
      sales: 0,
      stock: 999
    }
  ],
  DC: [
    {
      id: 61,
      code: 'CHAR-DC-001',
      title: '蝙蝠侠',
      name: '蝙蝠侠',
      price: 0,
      description: '哥谭的黑暗骑士，凡人之躯比肩神明的侦探。',
      rating: 9.6,
      brand: 'DC',
      era: '10年代',
      character_type: '英雄',
      origin: '《蝙蝠侠》 DC 漫画 · 1939',
      background:
        '幼年目睹父母在犯罪巷被枪杀的布鲁斯·韦恩，用二十年将自己锻造成世界最伟大的侦探与格斗家。没有超能力，却以凡人之躯成为正义联盟的战术核心与底牌。',
      ratings: { popularity: 9.7, power: 8.0, intelligence: 10, charm: 9.5 },
      highlights: [
        { text: '世界最伟大侦探' },
        { text: '127 种格斗术大师' },
        { text: '无尽的战术预案' }
      ],
      relationships: [
        { name: '阿福', relation: '管家 · 长辈' },
        { name: '罗宾', relation: '弟子 · 义子' },
        { name: '小丑', relation: '宿敌' }
      ],
      quotes: [{ text: '我即复仇，我是黑夜。', scene: '哥谭宣言' }],
      tags: [
        { id: 1, name: '正义联盟', color: '#3b82f6', weight: 10 },
        { id: 2, name: '侦探', color: '#6366f1', weight: 10 }
      ],
      sales: 0,
      stock: 999,
      isNew: true
    },
    {
      id: 62,
      code: 'CHAR-DC-002',
      title: '超人',
      name: '超人',
      price: 0,
      description: '钢铁之躯，希望与善良的永恒象征。',
      rating: 9.3,
      brand: 'DC',
      era: '10年代',
      character_type: '英雄',
      origin: '《超人》 DC 漫画 · 1938',
      background:
        '氪星毁灭前被父母送至地球的卡·艾尔，在堪萨斯的农场长大成为克拉克·肯特。黄色太阳赋予他无与伦比的力量，而养父母的教导让他成为希望的象征。',
      ratings: { popularity: 9.4, power: 10, intelligence: 8.5, charm: 9.2 },
      highlights: [
        { text: '热视线与冰冻吐息' },
        { text: '超光速飞行' },
        { text: '近乎不坏的钢铁之躯' }
      ],
      relationships: [
        { name: '露易丝·莱恩', relation: '挚爱' },
        { name: '蝙蝠侠', relation: '战友' },
        { name: '佐德将军', relation: '同族宿敌' }
      ],
      quotes: [{ text: '你不是孤独一人。', scene: '希望时刻' }],
      tags: [
        { id: 1, name: '正义联盟', color: '#3b82f6', weight: 10 },
        { id: 2, name: '经典', color: '#f59e0b', weight: 9 }
      ],
      sales: 0,
      stock: 999
    },
    {
      id: 63,
      code: 'CHAR-DC-003',
      title: '神奇女侠',
      name: '神奇女侠',
      price: 0,
      description: '天堂岛的戴安娜公主，亚马逊战士女王。',
      rating: 9.2,
      brand: 'DC',
      era: '10年代',
      character_type: '英雄',
      origin: '《神奇女侠》 DC 漫画 · 1941',
      background:
        '亚马逊公主戴安娜，宙斯与希波吕忒之女。为拯救人类离开与世隔绝的天堂岛，在第一次世界大战的硝烟中理解了人类的复杂，成为慈悲与力量并存的女武神。',
      ratings: { popularity: 9.3, power: 9.5, intelligence: 8.5, charm: 9.8 },
      highlights: [{ text: '真言套索' }, { text: '神级的力量与格斗' }, { text: '弑神剑与盾牌' }],
      relationships: [
        { name: '史蒂夫·特雷弗', relation: '挚爱' },
        { name: '希波吕忒', relation: '母亲' },
        { name: '超人', relation: '战友' }
      ],
      quotes: [{ text: '只有爱能真正拯救这个世界。', scene: '战争终章' }],
      tags: [
        { id: 1, name: '正义联盟', color: '#3b82f6', weight: 10 },
        { id: 2, name: '战士', color: '#f59e0b', weight: 9 }
      ],
      sales: 0,
      stock: 999
    },
    {
      id: 64,
      code: 'CHAR-DC-004',
      title: '小丑',
      name: '小丑',
      price: 0,
      description: '混乱的代理人，哥谭挥之不去的梦魇。',
      rating: 9.4,
      brand: 'DC',
      era: '10年代',
      character_type: '反派',
      origin: '《蝙蝠侠》 DC 漫画 · 1940',
      background:
        '坠入化学池的失败喜剧演员，"糟糕的一天"就能让任何人疯癫——他信奉混乱即公平。没有超能力却让整个哥谭颤栗，是蝙蝠侠镜像般的存在。',
      ratings: { popularity: 9.5, power: 6.5, intelligence: 10, charm: 8.5 },
      highlights: [
        { text: '深不可测的犯罪头脑' },
        { text: '化学与心理战专家' },
        { text: '对疼痛的异常耐受' }
      ],
      relationships: [
        { name: '蝙蝠侠', relation: '宿敌 · 互相成就' },
        { name: '哈莉·奎茵', relation: '追随者' }
      ],
      quotes: [{ text: '为什么不笑一个呢？', scene: '混乱之夜' }],
      tags: [
        { id: 1, name: '反派', color: '#8b5cf6', weight: 10 },
        { id: 2, name: '混乱', color: '#ec4899', weight: 9 }
      ],
      sales: 0,
      stock: 999
    }
  ],
  原神: [
    {
      id: 71,
      code: 'CHAR-GI-001',
      title: '钟离',
      name: '钟离',
      price: 0,
      description: '尘世闲游的往生堂客卿，磐石般沉稳的岩王帝君。',
      rating: 9.5,
      brand: '原神',
      era: '20年代',
      character_type: '神明',
      origin: '《原神》 miHoYo · 2020',
      background:
        '璃月的岩之神摩拉克斯，守护璃月三千七百年的"岩王帝君"。将神位交还人间后化名钟离，以凡人身份体验尘世，却总是忘记带摩拉。',
      ratings: { popularity: 9.6, power: 9.5, intelligence: 9.5, charm: 9.6 },
      highlights: [
        { text: '岩元素护盾·玉璋护盾' },
        { text: '天星陨落' },
        { text: '六千年的契约与智慧' }
      ],
      relationships: [
        { name: '胡桃', relation: '雇主' },
        { name: '魈', relation: '守护的夜叉' },
        { name: '雷电将军', relation: '七神同僚' }
      ],
      quotes: [{ text: '天动万象，山海化形。', scene: '天星降临' }],
      tags: [
        { id: 1, name: '璃月', color: '#f59e0b', weight: 10 },
        { id: 2, name: '岩神', color: '#a16207', weight: 10 }
      ],
      sales: 0,
      stock: 999,
      isNew: true
    },
    {
      id: 72,
      code: 'CHAR-GI-002',
      title: '雷电将军',
      name: '雷电将军',
      price: 0,
      description: '追求"永恒"的雷电真影，稻妻幕府的至高主宰。',
      rating: 9.4,
      brand: '原神',
      era: '20年代',
      character_type: '神明',
      origin: '《原神》 miHoYo · 2020',
      background:
        '稻妻的雷神巴尔泽布，为对抗磨损将自我封入一心净土，以人偶之躯推行"锁国令"。旅行者的到来让她重新审视"永恒"的意义，从孤高的神明走向与人同行的影。',
      ratings: { popularity: 9.5, power: 9.5, intelligence: 8.5, charm: 9.7 },
      highlights: [{ text: '无想的一刀' }, { text: '雷元素·梦想真说' }, { text: '一心净土' }],
      relationships: [
        { name: '八重神子', relation: '挚友' },
        { name: '九条裟罗', relation: '部下' },
        { name: '钟离', relation: '七神同僚' }
      ],
      quotes: [{ text: '此世，最珍贵之物——', scene: '无想的一刀' }],
      tags: [
        { id: 1, name: '稻妻', color: '#8b5cf6', weight: 10 },
        { id: 2, name: '雷神', color: '#6366f1', weight: 10 }
      ],
      sales: 0,
      stock: 999,
      isNew: true
    },
    {
      id: 73,
      code: 'CHAR-GI-003',
      title: '神里绫华',
      name: '神里绫华',
      price: 0,
      description: '白鹭公主，稻妻名门神里家的大小姐。',
      rating: 9.2,
      brand: '原神',
      era: '20年代',
      character_type: '剑士',
      origin: '《原神》 miHoYo · 2020',
      background:
        '社奉行神里家的大小姐，剑术与礼法皆臻完美，被称为"白鹭公主"。外表清冷高洁，实则渴望与普通人交心，一场庭院中的冰上之舞令无数旅行者倾心。',
      ratings: { popularity: 9.3, power: 8.5, intelligence: 8.5, charm: 10 },
      highlights: [{ text: '神里流·霜灭' }, { text: '冰华剑舞' }, { text: '名门教养与茶道' }],
      relationships: [
        { name: '神里绫人', relation: '兄长' },
        { name: '托马', relation: '家臣' },
        { name: '旅行者', relation: '珍视之友' }
      ],
      quotes: [{ text: '风雅之物，总藏于寻常。', scene: '茶会闲谈' }],
      tags: [
        { id: 1, name: '稻妻', color: '#8b5cf6', weight: 10 },
        { id: 2, name: '优雅', color: '#0ea5e9', weight: 9 }
      ],
      sales: 0,
      stock: 999
    },
    {
      id: 74,
      code: 'CHAR-GI-004',
      title: '胡桃',
      name: '胡桃',
      price: 0,
      description: '往生堂第七十七代堂主，古灵精怪的雪霁梅香。',
      rating: 9.3,
      brand: '原神',
      era: '20年代',
      character_type: '堂主',
      origin: '《原神》 miHoYo · 2020',
      background:
        '璃月往生堂第七十七代堂主，主持送仙典仪与葬仪的行家。看似跳脱搞怪，实则对生死之事怀着最庄重的敬意，蝶引来时，梅香雪霁。',
      ratings: { popularity: 9.4, power: 9.0, intelligence: 8.0, charm: 9.8 },
      highlights: [
        { text: '往生秘传枪法' },
        { text: '蝶引来时·安神秘法' },
        { text: '葬仪典章全知' }
      ],
      relationships: [
        { name: '钟离', relation: '客卿' },
        { name: '七七', relation: '抓娃娃对象' },
        { name: '旅行者', relation: '好友' }
      ],
      quotes: [{ text: '生死有命，不强求，不避讳。', scene: '往生堂日常' }],
      tags: [
        { id: 1, name: '璃月', color: '#f59e0b', weight: 10 },
        { id: 2, name: '火元素', color: '#ef4444', weight: 9 }
      ],
      sales: 0,
      stock: 999,
      isNew: true
    }
  ]
}

/** 全量角色列表：聚合所有系列数据（详情 / 搜索 / 相关推荐共用） */
const PRODUCT_DETAIL_LIST: MockProduct[] = Object.values(STORE_SERIES_PRODUCTS).flat()

export const getMockStoreCategories = () => STORE_CATEGORIES

// 获取指定分类下的系列产品
export const getSeriesProductsByCategoryId = (categoryId: number) => {
  const category = STORE_CATEGORIES.find((item) => item.id === categoryId)
  if (!category) return []
  return STORE_SERIES_PRODUCTS[category.name] || []
}

// 获取指定分类下的所有产品
export const getMockStoreSeries = () => {
  return STORE_CATEGORIES.map((category) => {
    const products = STORE_SERIES_PRODUCTS[category.name] || []
    return {
      categoryId: category.id,
      category: category.name,
      featured: products[0] || null,
      otherProducts: products.slice(1)
    }
  }).filter((item) => item.featured)
}

export const getMockProductList = (): MockProduct[] => PRODUCT_DETAIL_LIST

export const getMockProductById = (id: number): MockProduct | null => {
  return PRODUCT_DETAIL_LIST.find((item) => item.id === id) || null
}
