// OpenStreetMap から台湾の鉄道路線と駅を取得し、地図表示用の GeoJSON を作る。
// 実行: npm run fetch:railways（--refresh を付けると Overpass API から取り直す）
//
// 流れ: Overpass API → scripts/.cache/overpass.json（生データ）→ 変換 → public/data/*.geojson
// 生データをキャッシュするのは、変換ロジックを直すたびに公開 API へ負荷をかけないため。

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CACHE_PATH = join(ROOT, 'scripts', '.cache', 'overpass.json')

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

// service タグ付きの線（側線・車両基地・引込線）は除き、本線だけを取る。
const QUERY = `
[out:json][timeout:180];
area["ISO3166-1"="TW"][admin_level=2]->.tw;
(
  way["railway"~"^(rail|subway|light_rail|narrow_gauge|monorail)$"][!"service"](area.tw);
  node["railway"~"^(station|halt)$"](area.tw);
);
out geom;
`

async function fetchOverpass(): Promise<unknown> {
  const res = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'taiwan-rail-map/0.1 (personal travel map; one-off data fetch)',
    },
    body: new URLSearchParams({ data: QUERY }),
  })
  if (!res.ok) {
    throw new Error(`Overpass API error: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

async function loadRaw(refresh: boolean): Promise<unknown> {
  if (!refresh && existsSync(CACHE_PATH)) {
    console.log(`キャッシュを使用: ${CACHE_PATH}`)
    return JSON.parse(readFileSync(CACHE_PATH, 'utf8'))
  }
  console.log('Overpass API から取得中（数十秒〜数分かかります）...')
  const raw = await fetchOverpass()
  mkdirSync(dirname(CACHE_PATH), { recursive: true })
  writeFileSync(CACHE_PATH, JSON.stringify(raw))
  console.log(`保存: ${CACHE_PATH}`)
  return raw
}

// ---- 変換 ----

type Tags = Record<string, string | undefined>
type OsmNode = { type: 'node'; id: number; lat: number; lon: number; tags: Tags }
type OsmWay = { type: 'way'; id: number; tags: Tags; geometry: { lat: number; lon: number }[] }
type OverpassResponse = { elements: (OsmNode | OsmWay)[] }

// src/types/railway.ts の RailKind と同じ値。スクリプトとアプリは別々に実行されるので、ここでは文字列で持つ。
type RailKind = 'hsr' | 'tra' | 'metro' | 'lrt' | 'heritage'

function classifyWay(t: Tags): RailKind {
  if (t.highspeed === 'yes') return 'hsr'
  if (t.railway === 'subway' || t.name?.includes('捷運')) return 'metro' // 桃園機場捷運は railway=rail
  if (t.railway === 'light_rail' || t.railway === 'monorail') return 'lrt'
  if (t.railway === 'narrow_gauge' || t.usage === 'tourism') return 'heritage' // 阿里山線・糖業鉄道
  return 'tra'
}

function classifyStation(t: Tags): RailKind {
  if (t.operator?.includes('高速鐵路')) return 'hsr'
  if (t.station === 'subway') return 'metro'
  if (t.station === 'light_rail') return 'lrt'
  if (t.station === 'train') return 'tra'
  return 'heritage' // station タグなしは林業鉄道・糖業鉄道の駅がほとんど
}

// 小数5桁 ≒ 1m 精度。地図表示には十分で、ファイルサイズを大きく減らせる。
const round = (n: number) => Math.round(n * 1e5) / 1e5

function toGeoJson(raw: OverpassResponse) {
  const lines = raw.elements
    .filter((e): e is OsmWay => e.type === 'way')
    .map((w) => ({
      type: 'Feature' as const,
      properties: { kind: classifyWay(w.tags), name: w.tags.name ?? null },
      geometry: {
        type: 'LineString' as const,
        coordinates: w.geometry.map((p) => [round(p.lon), round(p.lat)]),
      },
    }))

  const stations = raw.elements
    .filter((e): e is OsmNode => e.type === 'node' && e.tags.name !== undefined)
    .map((n) => ({
      type: 'Feature' as const,
      properties: {
        kind: classifyStation(n.tags),
        name: n.tags.name,
        nameEn: n.tags['name:en'] ?? null,
      },
      geometry: { type: 'Point' as const, coordinates: [round(n.lon), round(n.lat)] },
    }))

  return {
    lines: { type: 'FeatureCollection' as const, features: lines },
    stations: { type: 'FeatureCollection' as const, features: stations },
  }
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const item of items) counts[key(item)] = (counts[key(item)] ?? 0) + 1
  return counts
}

const raw = (await loadRaw(process.argv.includes('--refresh'))) as OverpassResponse
const { lines, stations } = toGeoJson(raw)

const OUT_DIR = join(ROOT, 'public', 'data')
mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(join(OUT_DIR, 'railways.geojson'), JSON.stringify(lines))
writeFileSync(join(OUT_DIR, 'stations.geojson'), JSON.stringify(stations))

console.log('路線:', countBy(lines.features, (f) => f.properties.kind))
console.log('駅:', countBy(stations.features, (f) => f.properties.kind))
console.log(`出力: ${OUT_DIR}`)
