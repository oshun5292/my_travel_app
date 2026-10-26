import type { RailKind } from './types/railway'

type RailStyle = {
  label: string
  color: string
  weight: number
  dashArray?: string
  // 描画順。大きいほど上に重なる（主要路線を上にして見やすくする）。
  zIndex: number
}

export const RAIL_STYLES: Record<RailKind, RailStyle> = {
  hsr: { label: '高鉄（新幹線）', color: '#f07800', weight: 5, zIndex: 5 },
  tra: { label: '台鉄', color: '#1f4fa8', weight: 4, zIndex: 4 },
  metro: { label: 'MRT（捷運）', color: '#9b2fae', weight: 4, zIndex: 3 },
  lrt: { label: 'LRT（輕軌）', color: '#119a6f', weight: 3, zIndex: 2 },
  heritage: { label: '林業・糖業鉄道', color: '#8b5a2b', weight: 3, dashArray: '6 4', zIndex: 1 },
}
