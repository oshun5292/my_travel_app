# 判断の記録

新しいものを下に追記する。

## 2026-10-25 技術スタック: Vite + React + TypeScript
- **判断**: 当初の「ビルドなしの素の JavaScript」案をやめ、Vite + React + TypeScript にする。
- **理由**: 現在主流の構成を使い、学びながら作りたいという本人の方針に合わせるため。型があるとコードレビューもしやすい。

## 2026-10-25 地図ライブラリ: React Leaflet
- **判断**: MapLibre GL JS ではなく React Leaflet を使う。
- **理由**: 地図の要素を `<Marker>` のような React の部品として書けて、初学者にも読みやすい。今回の用途（線とピンを描く）なら、ベクター地図の機能（回転など）は必要ない。

## 2026-10-25 鉄道路線: OSM から自前で GeoJSON を生成する
- **事実**: OpenRailwayMap の旧画像タイル（`tiles.openrailwaymap.org`）が 403 を返す。新サイト `openrailwaymap.app` は MapLibre 向けのベクタータイルだけを配信している。利用規約には「Referer ヘッダーの偽装禁止」「違反は予告なくブロック」とある（[USAGE.md](https://github.com/hiddewie/OpenRailwayMap-vector/blob/master/USAGE.md)）。
- **判断**: Overpass API で OSM の鉄道データを1回だけ取得し、GeoJSON にしてリポジトリに置く。
- **理由**: 外部サービスの都合で、旅行中に地図が消えるリスクをなくせる。路線の色や太さも自由に決められる。
- **代償**: 路線の新設などは自動では反映されない。必要になったら `npm run fetch:railways -- --refresh` で取り直す。

## 2026-10-25 背景地図: CARTO Positron
- **理由**: 淡い配色なので、自前で描く鉄道の線が目立つ。API キーが要らない。
- **（2026-10-26 更新）** 「API キーが要らない」は成り立たなくなった。CARTO の規約が 2026-09-29 付で変わり、キーなしのタイルは「API KEY REQUIRED」の透かしになる。
  - **事実**: 個人利用は非商用扱いで無料（月500万リクエストまで）。帰属表示（OSM と CARTO）は必須。出典: https://carto.com/basemaps/apikey/
  - **判断**: Positron は続けて使い、無料キーを `.env.local` の `VITE_CARTO_API_KEY` で渡す。キーはタイル URL に載りブラウザから見えるため秘密にはならない（個人用の無料キーなので許容する）。
  - **未確認**: GitHub Pages へ公開するときのキーの渡し方（ビルド時に環境変数を渡す必要がある）。規約の「キーを無関係なプロジェクトで共有しない」に反しないこと。旅行中のオフライン対応。

## 2026-10-25 スポットの保存先: Supabase（予定）
- **理由**: PC とスマホで同じデータを使いたい。PostgreSQL なので SQL で設計でき、ログイン機能と行単位の権限（RLS）が付いている。
- **権限**: 読み取りは誰でも可能、書き込みは本人だけ。新規ユーザー登録はオフにする。

## 2026-10-26 公開方法: GitHub Pages + GitHub Actions（キーは Secrets）
- **事実**: リポジトリ（https://github.com/oshun5292/my_travel_app）は PUBLIC。GitHub Pages は Free プランだと公開リポジトリでのみ使える（有料プランなら非公開でも可。出典: GitHub Docs「Creating a GitHub Pages site」）。公開した Pages サイトは、URL を知る誰でも見られる。
- **判断**: main への push で GitHub Actions がビルドし、Pages へ公開する（`.github/workflows/deploy.yml`）。CARTO のキーは Actions の Secret `CARTO_API_KEY` に登録し、ビルド時に `VITE_CARTO_API_KEY` として渡す。
- **理由**: キーをリポジトリと git 履歴に残さないため。更新が push だけで済む。
- **注意**: キーは完成した JavaScript に埋め込まれるため、公開サイトでは誰でも見える。守るのは CARTO 側の Referer 制限（`https://oshun5292.github.io/*` のみ許可）で、公開後に設定する。
- **付随設定**: `vite.config.ts` に本番ビルドだけ `base: '/my_travel_app/'` を付けた（開発サーバーは `/` のまま）。
