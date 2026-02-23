const DEFAULT_BASE = '/cmd-api'

function authHeaders(extra: Record<string, string> = {}) {
  return {
    'Content-Type': 'application/json',
    ...extra,
  }
}

export async function apiFetch(path: string, options: RequestInit = {}, base: string = DEFAULT_BASE) {
  const url = `${base}${path}`
  const res = await fetch(url, {
    ...options,
    headers: authHeaders((options.headers as Record<string, string>) || {}),
  })
  if (!res.ok && res.status !== 201) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `API error ${res.status}`)
  }
  return res.json()
}

export function createApiClient(basePath: string) {
  return (path: string, options: RequestInit = {}) => apiFetch(path, options, basePath)
}
