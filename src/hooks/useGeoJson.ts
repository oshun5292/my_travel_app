import { useEffect, useState } from 'react'

// public/ 以下の GeoJSON を読み込む。読み込み中は null を返す。
// BASE_URL を付けるのは、GitHub Pages のように /リポジトリ名/ 配下で公開しても動くようにするため。
export function useGeoJson<T>(path: string): T | null {
  const [data, setData] = useState<T | null>(null)

  useEffect(() => {
    // 読み込み完了前にコンポーネントが消えた場合に、古い結果で state を更新しないためのフラグ
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}${path}`)
      .then((res) => {
        if (!res.ok) throw new Error(`${path}: ${res.status}`)
        return res.json() as Promise<T>
      })
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch((err: unknown) => console.error('GeoJSON の読み込みに失敗', err))
    return () => {
      cancelled = true
    }
  }, [path])

  return data
}
