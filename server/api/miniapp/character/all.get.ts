/**
 * GET /api/miniapp/character/all
 *
 * 单接口返回全量角色数据（地区 + 角色），结构干净，前端一次请求搞定一切。
 * 生产环境将此处的静态数据替换为数据库查询或第三方 API 聚合即可。
 */

interface Character {
  id: number
  name: string
  element: string
  cv_cn: string
  cv_jp: string
  quote: string
  description: string
  avatar: string
  coverImg: string
  audio_enter?: string
}

interface Region {
  id: string
  name: string
  bgDay: string
  bgNight?: string
  characters: Character[]
}

const regions: Region[] = [
  {
    id: 'mondstadt',
    name: '蒙德城',
    bgDay: 'https://uploadstatic.mihoyo.com/contentweb/20200211/2020021114220951905.jpg',
    bgNight: 'https://uploadstatic.mihoyo.com/contentweb/20210218/2021021815221477648.jpg',
    characters: [
      {
        id: 118853,
        name: '琴',
        element: 'Anemo',
        cv_cn: '林簌',
        cv_jp: '斎藤千和',
        quote: '风啊，回应我吧！',
        description:
          '身为西风骑士团的代理团长，一直忠于职守，为人们带来安宁。虽然并非天赋异禀，但通过刻苦训练，如今的她已是能够独当一面的骑士了。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20220127/2022012718344593599.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/06/30/b51565c6f1298e534e90b6e63332e9c1_6618231443033589469.png',
        audio_enter: ''
      },
      {
        id: 118854,
        name: '安柏',
        element: 'Pyro',
        cv_cn: '牛奶君',
        cv_jp: '木野日菜',
        quote: '侦察骑士安柏，前来报到！',
        description:
          '西风骑士团侦察骑士，活泼开朗的少女。是蒙德城有史以来最出色的飞行冠军，也是蒙德城骑士团中唯一的侦察骑士。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20220127/2022012718350213870.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/07/04/6f0ef40157e95b0d59455c12f4d3f270_3262958961633311108.png',
        audio_enter: ''
      },
      {
        id: 118856,
        name: '温迪',
        element: 'Anemo',
        cv_cn: '边江',
        cv_jp: '村瀬歩',
        quote: '好酒，好诗，好风——人生三乐。',
        description:
          '总是流浪四方的行吟诗人，看起来轻浮得一点都不像蒙德人，然而他吟唱的歌谣，总能使人感受到来自远古的风之气息。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20200306/2020030617010584165.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/07/04/c6e3a40e28b1f01a3bf50ae2a21e7d78_7467413399895563437.png',
        audio_enter: ''
      },
      {
        id: 118857,
        name: '可莉',
        element: 'Pyro',
        cv_cn: '汪可盈',
        cv_jp: '洲崎綾',
        quote: '可莉的爸爸妈妈都说可莉是小太阳！',
        description:
          '魔法学者爱丽丝之女，红色系魔女。性格活泼可爱，但对火焰和炸弹有着常人难以理解的执着，经常因为在蒙德城附近炸鱼而被关禁闭。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20200306/2020030617024063283.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/07/04/5f5e1c7bd03b3a00eedacce8e7f59a51_3540867780637143076.png',
        audio_enter: ''
      }
    ]
  },
  {
    id: 'liyue',
    name: '璃月港',
    bgDay: 'https://uploadstatic.mihoyo.com/contentweb/20200515/2020051511072867344.jpg',
    bgNight: 'https://uploadstatic.mihoyo.com/contentweb/20210218/2021021815224612647.jpg',
    characters: [
      {
        id: 118858,
        name: '魈',
        element: 'Anemo',
        cv_cn: 'kinsen',
        cv_jp: '内田雄馬',
        quote: '如遇失道旷野之难，路遭贼人之难……',
        description:
          '守护璃月港的"三眼五显仙人"之一，妙称"护法夜叉大将"。受业于降魔大神明蕊，诛除魔物无数，背负着难以言说的业障。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20200306/2020030617035787693.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/06/30/930f3ce55517e3c711a962c82e4639c0_8788966481995409698.png',
        audio_enter: ''
      },
      {
        id: 118859,
        name: '凝光',
        element: 'Geo',
        cv_cn: '杜冥鸦',
        cv_jp: '沢城みゆき',
        quote: '都在我的算计之中。',
        description:
          '坐拥空中宫殿，有着大量传言的璃月权贵，脸上总是挂着优雅神秘的笑容。她正在悄悄实施着一个宏大的商业计划。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20200306/2020030617042023125.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/07/04/d35a0a1d13f821fd55a6951210c672ac_8868204139408761896.png',
        audio_enter: ''
      },
      {
        id: 118860,
        name: '胡桃',
        element: 'Pyro',
        cv_cn: '忻幸',
        cv_jp: '東山奈央',
        quote: '人生有涯，别嫌我说话太直。',
        description:
          '往生堂第七十七代堂主，「华祭」策划者，有着令人难以捉摸的个性，又或许在她怪异的举止背后，藏着比任何人都更豁达的生死观。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20220127/2022012718373148742.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/07/04/70f748a4a81ff5fd31ccecb35a81a1b8_752703024219609484.png',
        audio_enter: ''
      },
      {
        id: 118861,
        name: '钟离',
        element: 'Geo',
        cv_cn: '鱼冻',
        cv_jp: '前野智昭',
        quote: '所谓历史，是无论如何也忘不掉的东西。',
        description:
          '以"顾问"身份受雇于往生堂的神秘男人。博古通今，消息灵通，是整个璃月知识最为渊博的人之一。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20220127/2022012718374943706.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/07/04/f2df5ea8a614f6e4b33f34f0b5eec3b6_8344751501398994891.png',
        audio_enter: ''
      },
      {
        id: 118862,
        name: '甘雨',
        element: 'Cryo',
        cv_cn: '卢静',
        cv_jp: '本渡楓',
        quote: '若使命允许，我愿永伴左右。',
        description:
          '半人半仙鹤的璃月七星之一"天权"的秘书，平静内敛，言语简洁。为了更好地完成工作，她不断自我鞭策，不知疲倦。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20220127/2022012718381024600.png',
        coverImg:
          'https://webstatic.mihoyo.com/upload/contentweb/2022/07/04/b6c1a7e1b3a16a73c0b67e4b7e5fec6e_1001826176553762882.png',
        audio_enter: ''
      }
    ]
  }
]

export default defineEventHandler(() => {
  return {
    code: 200,
    message: 'OK',
    data: regions
  }
})
