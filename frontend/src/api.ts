import type { Catalog, Chapter, RunResult, Validation } from './types'

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || '请求失败')
  }
  return res.json()
}

export function fetchCatalog() {
  return request<Catalog>('/api/catalog')
}

export function fetchChapter(slug: string) {
  return request<Chapter>(`/api/chapters/${slug}`)
}

export function runCode(code: string) {
  return request<RunResult>('/api/run', {
    method: 'POST',
    body: JSON.stringify({ code }),
  })
}

export function submitAnswer(chapterSlug: string, exerciseId: string, code: string) {
  return request<Validation>('/api/submit', {
    method: 'POST',
    body: JSON.stringify({ chapterSlug, exerciseId, code }),
  })
}
