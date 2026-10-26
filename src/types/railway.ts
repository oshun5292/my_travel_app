import type { FeatureCollection, LineString, Point } from 'geojson'

// 路線の種類。scripts/fetch-railways.ts が OSM のタグから判定して GeoJSON に書き込む。
export type RailKind = 'hsr' | 'tra' | 'metro' | 'lrt' | 'heritage'

export type RailLineProps = { kind: RailKind; name: string | null }
export type StationProps = { kind: RailKind; name: string; nameEn: string | null }

export type RailLines = FeatureCollection<LineString, RailLineProps>
export type Stations = FeatureCollection<Point, StationProps>
