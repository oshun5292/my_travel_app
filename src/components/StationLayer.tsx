import { useState } from 'react'
import { CircleMarker, Popup, useMapEvents } from 'react-leaflet'
import { useGeoJson } from '../hooks/useGeoJson'
import { RAIL_STYLES } from '../railStyle'
import type { Stations } from '../types/railway'

// 広域表示で全駅を出すと線が見えなくなるので、ある程度拡大したときだけ表示する。
const MIN_ZOOM = 11

export function StationLayer() {
  const stations = useGeoJson<Stations>('data/stations.geojson')
  const map = useMapEvents({ zoomend: () => setZoom(map.getZoom()) })
  const [zoom, setZoom] = useState(() => map.getZoom())

  if (!stations || zoom < MIN_ZOOM) return null

  return stations.features.map((f) => {
    const [lng, lat] = f.geometry.coordinates
    const { name, nameEn, kind } = f.properties
    return (
      <CircleMarker
        key={`${name}-${lng}-${lat}`}
        center={[lat, lng]}
        radius={5}
        pathOptions={{ color: RAIL_STYLES[kind].color, weight: 2, fillColor: '#fff', fillOpacity: 1 }}
      >
        <Popup>
          <strong>{name}</strong>
          {nameEn && <div>{nameEn}</div>}
          <div>{RAIL_STYLES[kind].label}</div>
        </Popup>
      </CircleMarker>
    )
  })
}
