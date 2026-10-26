import { MapContainer, TileLayer } from 'react-leaflet'
import { RailwayLayer } from './RailwayLayer'
import { StationLayer } from './StationLayer'

// 台湾本島全体が収まる中心とズーム
const TAIWAN_CENTER: [number, number] = [23.7, 120.95]
const INITIAL_ZOOM = 8

// CARTO の背景タイルは API キーが必須（キーなしだと「API KEY REQUIRED」の透かしタイルになる）。
// キーは .env.local の VITE_CARTO_API_KEY で渡す。Vite は VITE_ で始まる変数だけをブラウザ用コードに埋め込む。
const CARTO_API_KEY: string | undefined = import.meta.env.VITE_CARTO_API_KEY
if (!CARTO_API_KEY) {
  console.warn('VITE_CARTO_API_KEY が未設定です。背景地図に透かしが入ります。.env.example を参照してください。')
}
const CARTO_TILE_URL =
  'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' +
  (CARTO_API_KEY ? `?key=${CARTO_API_KEY}` : '')

export function RailMap() {
  return (
    // preferCanvas: 約4,600本の線を SVG 要素ではなく1枚の Canvas に描き、動作を軽くする
    <MapContainer center={TAIWAN_CENTER} zoom={INITIAL_ZOOM} preferCanvas className="rail-map">
      {/* 淡い色の背景地図にして、鉄道の線を目立たせる */}
      <TileLayer
        url={CARTO_TILE_URL}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={20}
      />
      <RailwayLayer />
      <StationLayer />
    </MapContainer>
  )
}
