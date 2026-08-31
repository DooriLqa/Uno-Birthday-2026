import beachPanorama from '@/shared/assets/beach-search/beach-panorama.png'
import coconut from '@/shared/assets/beach-search/coconut.png'
import messageBottle from '@/shared/assets/beach-search/message-bottle.png'
import shell from '@/shared/assets/beach-search/shell.png'
import starfish from '@/shared/assets/beach-search/starfish.png'
import sunglasses from '@/shared/assets/beach-search/sunglasses.png'

export type SearchItem = {
  id: string
  label: string
  image: string
  left: string
  top: string
  width: string
  rotation: string
}

export const beachPanoramaImage = beachPanorama

export const searchItems: SearchItem[] = [
  {
    id: 'shell',
    label: 'Ракушка',
    image: shell,
    left: '29%',
    top: '76%',
    width: '4%',
    rotation: '-18deg',
  },
  {
    id: 'coconut',
    label: 'Кокос',
    image: coconut,
    left: '10%',
    top: '57%',
    width: '5%',
    rotation: '8deg',
  },
  {
    id: 'sunglasses',
    label: 'Солнечные очки',
    image: sunglasses,
    left: '51%',
    top: '65%',
    width: '5.5%',
    rotation: '-9deg',
  },
  {
    id: 'starfish',
    label: 'Морская звезда',
    image: starfish,
    left: '70%',
    top: '77%',
    width: '4%',
    rotation: '16deg',
  },
  {
    id: 'message-bottle',
    label: 'Бутылка с посланием',
    image: messageBottle,
    left: '82%',
    top: '58%',
    width: '4%',
    rotation: '-25deg',
  },
]
