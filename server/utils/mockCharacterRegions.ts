export interface MockCharacter {
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

export interface MockRegion {
  id: string
  name: string
  bgDay: string
  bgNight?: string
  characters: MockCharacter[]
}

export const MOCK_CHARACTER_REGIONS: MockRegion[] = [
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
  },
  {
    id: 'inazuma',
    name: '稻妻城',
    bgDay: 'https://uploadstatic.mihoyo.com/contentweb/20210719/2021071917030766463.jpg',
    bgNight: 'https://uploadstatic.mihoyo.com/contentweb/20210719/2021071917033032133.jpg',
    characters: [
      {
        id: 118893,
        name: '神里绫华',
        element: 'Anemo',
        cv_cn: '林簌',
        cv_jp: '斎藤千和',
        quote: '对于您会面一事，我期待很久！',
        description:
          '稻妻「社奉行」神里家的大小姐。端庄文雅，聪慧坚韧。待人接物真诚又得体，深受稻妻民众爱戴，贵有「白鹭公主」之名。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20210720/2021072011085576262.png',
        coverImg: 'https://uploadstatic.mihoyo.com/contentweb/20210720/2021072011090118454.png',
        audio_enter: ''
      },
      {
        id: 118894,
        name: '雷电将军',
        element: 'Electro',
        cv_cn: '菊花花',
        cv_jp: '泽城美雪',
        quote: '唯有永恒，才最接近真理！',
        description: '雷电将军，此世最殊胜威怖的雷霆化身，稻妻幕府的最高主宰。',
        avatar: 'https://uploadstatic.mihoyo.com/contentweb/20210817/2021081714114216212.png',
        coverImg: 'https://uploadstatic.mihoyo.com/contentweb/20210817/2021081714114216212.png',
        audio_enter: ''
      }
    ]
  }
]

export const buildRegionListPayload = () => {
  return MOCK_CHARACTER_REGIONS.map((region) => ({
    code: region.id,
    name: region.name,
    bg_day_url: region.bgDay,
    bg_night_url: region.bgNight || '',
    characters: []
  }))
}

export const buildRegionDetailPayload = (code: string) => {
  const region = MOCK_CHARACTER_REGIONS.find((item) => item.id === code)
  if (!region) return null

  return {
    code: region.id,
    name: region.name,
    bg_day_url: region.bgDay,
    bg_night_url: region.bgNight || '',
    characters: region.characters.map((char) => ({
      id: char.id,
      name: char.name,
      element: char.element,
      cv_cn: char.cv_cn,
      cv_jp: char.cv_jp,
      quote: char.quote,
      description: char.description,
      avatar_url: char.avatar,
      cover_img_url: char.coverImg,
      audio_enter_url: char.audio_enter || ''
    }))
  }
}
