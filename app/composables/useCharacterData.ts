export interface Character {
  id: string
  name: string
  element: string
  cv: string
  description: string
  quote: string
  image: string
  avatar: string
}

export interface Region {
  id: string
  name: string
  englishName: string
  background: string
  characters: Character[]
}

export const useCharacterData = () => {
  const regions: Record<string, Region> = {
    mondstadt: {
      id: 'mondstadt',
      name: '蒙德',
      englishName: 'Mondstadt',
      background: 'https://uploadstatic.mihoyo.com/contentweb/20200211/2020021114220951905.jpg', // Placeholder or real URL
      characters: [
        {
          id: 'jean',
          name: '琴',
          element: 'Anemo',
          cv: '林簌',
          description:
            '西风骑士团代理团长，一直忠于职守，为人们带来安宁。虽然并非天赋异禀，但通过刻苦训练，如今的她已是能够独当一面的骑士了。',
          quote: '风啊，回应我吧！',
          image:
            'https://webstatic.mihoyo.com/upload/contentweb/2022/06/30/b51565c6f1298e534e90b6e63332e9c1_6618231443033589469.png',
          avatar: 'https://uploadstatic.mihoyo.com/contentweb/20220127/2022012718344593599.png' // Usually a crop
        },
        {
          id: 'amber',
          name: '安柏',
          element: 'Pyro',
          cv: '牛奶君',
          description: '西风骑士团侦察骑士，活泼开朗的少女。是蒙德城飞行冠军。',
          quote: '侦察骑士安柏，前来报到！',
          image:
            'https://webstatic.mihoyo.com/upload/contentweb/2022/07/04/6f0ef40157e95b0d59455c12f4d3f270_3262958961633311108.png',
          avatar: 'https://uploadstatic.mihoyo.com/contentweb/20220127/2022012718350213870.png'
        }
      ]
    },
    liyue: {
      id: 'liyue',
      name: '璃月',
      englishName: 'Liyue',
      background: 'https://upload-static.mihoyo.com/contentweb/20200319/2020031919253457222.jpg',
      characters: [
        {
          id: 'xiao',
          name: '魈',
          element: 'Anemo',
          cv: 'kinsen',
          description: '守护璃月港的“三眼五显仙人”之一，妙称“护法夜叉大将”。',
          quote: '如遇失道旷野之难，路遭贼人之难...',
          image: 'https://upload-static.mihoyo.com/contentweb/20210126/2021012615053245464.png',
          avatar: 'https://upload-static.mihoyo.com/contentweb/20210126/2021012615053245464.png'
        },
        {
          id: 'ningguang',
          name: '凝光',
          element: 'Geo',
          cv: '杜冥鸦',
          description: '坐拥空中宫殿，有着大量传言的璃月权贵，脸上总是挂着优雅神秘的笑容。',
          quote: '都在我的算计之中。',
          image: 'https://upload-static.mihoyo.com/contentweb/20200319/2020031919262243569.png',
          avatar: 'https://upload-static.mihoyo.com/contentweb/20200319/2020031919262243569.png'
        }
      ]
    }
  }

  return {
    regions
  }
}
