import { useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'
import { useGeoJson } from '../hooks/useGeoJson'
import { RAIL_STYLES } from '../railStyle'
import type { RailLineProps, RailLines } from '../types/railway'

export function RailwayLayer() {
  const lines = useGeoJson<RailLines>('data/railways.geojson')

  // Leaflet は配列の順に描くので、zIndex の小さい路線を先に並べて主要路線を上に重ねる。
  const sorted = useMemo<RailLines | null>(() => {
    if (!lines) return null
    const features = [...lines.features].sort(
      (a, b) => RAIL_STYLES[a.properties.kind].zIndex - RAIL_STYLES[b.properties.kind].zIndex,
    )
    return { ...lines, features }
  }, [lines])

  if (!sorted) return null

  return (
    <GeoJSON
      data={sorted}
      // react-leaflet は properties を any 型で渡すため、自前の型を明示する
      style={(feature) => {
        const { kind } = feature!.properties as RailLineProps
        const s = RAIL_STYLES[kind]
        return { color: s.color, weight: s.weight, dashArray: s.dashArray, opacity: 0.9 }
      }}
      onEachFeature={(feature, layer) => {
        if (feature.properties.name) layer.bindTooltip(feature.properties.name, { sticky: true })
      }}
    />
  )
}
