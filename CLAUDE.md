# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクトの目的

台湾の鉄道旅行用の、**自分専用の観光マップ**。Google マップでは鉄道路線が見えにくいため、路線がはっきり見える地図に行きたいスポットを重ねて、移動の順番を考えるために使う。

- 地図に特化する。観光ガイドや台湾の一般知識は作らない。
- 編集するのは本人だけ。同行者は URL で閲覧のみ。
- PC で計画し、旅行中はスマホで見る。どちらの画面幅でも使えること。
- 訪問順や日程はデータに持たない（地図を見て本人が考える）。

技術選定の理由は `docs/decisions.md`、失敗の記録は `docs/learning_log.md` に追記する。

## コマンド

```powershell
npm run dev             # 開発サーバー（http://localhost:5173）
npm run build           # 型チェック（tsc -b）と本番ビルド（dist/）
npm run lint            # oxlint
npm run fetch:railways  # 鉄道データの再生成（--refresh で Overpass API から取り直す）
```

テストはまだ導入していない。

## 構成

Vite + React + TypeScript。地図は React Leaflet（Leaflet）。

### 鉄道データは自前で生成して静的ファイルとして配信する

- `scripts/fetch-railways.ts` が Overpass API から台湾の鉄道路線と駅を取得し、`public/data/railways.geojson` と `public/data/stations.geojson` を出力する。
  - 生データは `scripts/.cache/overpass.json` にキャッシュする（gitignore 対象）。変換ロジックを直すときは、キャッシュを使って再実行する。公開 API へ何度もアクセスしないこと。
- 路線の種類 `RailKind`（hsr / tra / metro / lrt / heritage）は、スクリプトの `classifyWay` / `classifyStation` で OSM のタグから判定する。アプリ側の型は `src/types/railway.ts`。種類を増やすときは、スクリプト・型・`src/railStyle.ts` の3か所をそろえる。
- OpenRailwayMap のタイルは使わない（旧タイル URL が 403 を返し、利用規約も厳しいため。詳細は `docs/decisions.md`）。

### 地図の描画

- 背景は CARTO Positron（淡色）。鉄道の線を目立たせるため。API キーが必須で、`.env.local` の `VITE_CARTO_API_KEY` から読む（雛形は `.env.example`）。キーなしだと「API KEY REQUIRED」の透かしが出る。キーをコードや git に直接書かない。
- 線は `preferCanvas`（Canvas 描画）。約4,600本あり、SVG では重くなるため。
- 路線の重なり順は、`railStyle.ts` の `zIndex` で features を並べ替えて決める。駅はズーム11以上でだけ表示する。

## 今後の予定（未実装）

スポットは Supabase（PostgreSQL）に保存する。読み取りは誰でも可能、書き込みは本人だけ（RLS で `auth.uid() = user_id` に制限し、新規ユーザー登録はオフ）。ログインはメールのマジックリンク。公開先は GitHub Pages（https://oshun5292.github.io/my_travel_app/）。main への push で `.github/workflows/deploy.yml` がビルドして公開する。CARTO キーは Actions の Secret `CARTO_API_KEY` から渡す。本番ビルドだけ `base: '/my_travel_app/'`（`vite.config.ts`）。リポジトリは PUBLIC なので、秘密の値をコミットしない。
