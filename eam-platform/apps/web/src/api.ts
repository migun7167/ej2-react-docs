/** fetch wrapper — error format เดียวกับ API: { error: { code, message } } */
export class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public field?: string,
    public details?: any,
  ) {
    super(message);
  }
}

let devUser = localStorage.getItem('devUser') ?? 'admin';
export function setDevUser(u: string) {
  devUser = u;
  localStorage.setItem('devUser', u);
}
export function getDevUser() {
  return devUser;
}

export async function api<T = any>(
  path: string,
  options: { method?: string; body?: unknown; idempotencyKey?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = { 'X-Dev-User': devUser };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
  const res = await fetch(path, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    let err: any = {};
    try {
      err = (await res.json()).error ?? {};
    } catch {
      /* non-JSON error */
    }
    throw new ApiClientError(err.code ?? 'HTTP_' + res.status, err.message ?? res.statusText, err.field, err.details);
  }
  return res.json();
}
