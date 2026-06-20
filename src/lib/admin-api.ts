/**
 * Super-admin API client.
 *
 * The generated `@/api-client` hooks are produced from the
 * OpenAPI spec, which does not (yet) describe the `/api/admin/*` routes.
 * Rather than regenerate, this module talks to those endpoints directly
 * with `fetch` — the same pattern already used in `login.tsx` for the
 * company lookup. The bearer token is read from localStorage.
 */

const ADMIN_BASE = "/api/admin";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("salam_tech_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error || `Xatolik (${res.status})`;
  } catch {
    return `Xatolik (${res.status})`;
  }
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${ADMIN_BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as T;
}

async function postJson<T>(path: string): Promise<T> {
  const res = await fetch(`${ADMIN_BASE}${path}`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(await readError(res));
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CompanyStats {
  users: number;
  products: number;
  salesCount: number;
  salesTotal: number;
}



export interface Company {
  id: string;
  name: string;
  isBlocked: boolean;
  subscriptionPlan: string;
  createdAt: string;
  stats: CompanyStats;
}

// hellol

export interface CompanyUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface CompanyDetail {
  id: string;
  name: string;
  isBlocked: boolean;
  subscriptionPlan: string;
  createdAt: string;
  users: CompanyUser[];
  stats: CompanyStats & { customers: number };
}

export interface PlatformAnalytics {
  companies: { total: number; blocked: number; active: number };
  users: number;
  sales: { count: number; volume: number };
  plans: Array<{ plan: string; count: number }>;
}

export interface Me {
  id: number;
  name: string;
  email: string;
  role: string;
  companyId: string;
  businessName: string;
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const adminApi = {
  analytics: () => getJson<PlatformAnalytics>("/analytics"),
  companies: () => getJson<Company[]>("/companies"),
  company: (id: string) => getJson<CompanyDetail>(`/companies/${id}`),
  block: (id: string) => postJson<Company>(`/companies/${id}/block`),
  unblock: (id: string) => postJson<Company>(`/companies/${id}/unblock`),
};

/** Fetch the current user — used to gate the admin area by role. */
export async function fetchMe(): Promise<Me> {
  const res = await fetch("/api/auth/me", { headers: authHeaders() });
  if (!res.ok) throw new Error("unauthorized");
  return (await res.json()) as Me;
}
