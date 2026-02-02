import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Anon Key is missing");
}

// Create client WITHOUT schema config - auth needs default endpoints
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});

// Helper to get auth token
async function getAuthToken(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token || supabaseKey;
}

// API helper for custom schema operations
export const api = {
  // GET - Select data
  async get<T>(
    table: string,
    options?: {
      select?: string;
      filter?: Record<string, string>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
      single?: boolean;
    },
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const token = await getAuthToken();

      let url = `${supabaseUrl}/rest/v1/${table}?select=${options?.select || "*"}`;

      if (options?.filter) {
        for (const [key, value] of Object.entries(options.filter)) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      }
      if (options?.order) {
        url += `&order=${options.order.column}.${options.order.ascending ? "asc" : "desc"}`;
      }
      if (options?.limit) {
        url += `&limit=${options.limit}`;
      }

      const response = await fetch(url, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
          "Accept-Profile": "rumah_quran",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();

      if (options?.single) {
        return { data: data[0] || null, error: null };
      }

      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  // POST - Insert data
  async insert<T>(
    table: string,
    data: Record<string, unknown>,
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const token = await getAuthToken();

      const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
        method: "POST",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
          "Content-Profile": "rumah_quran",
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to insert");
      }

      const result = await response.json();
      return { data: result[0] || result, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  // PATCH - Update data
  async update<T>(
    table: string,
    filter: Record<string, string>,
    data: Record<string, unknown>,
  ): Promise<{ data: T | null; error: Error | null }> {
    try {
      const token = await getAuthToken();

      let url = `${supabaseUrl}/rest/v1/${table}?`;
      const filterParams = Object.entries(filter)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");
      url += filterParams;

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
          "Content-Profile": "rumah_quran",
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update");
      }

      const result = await response.json();
      return { data: result[0] || result, error: null };
    } catch (err: any) {
      return { data: null, error: err };
    }
  },

  // DELETE - Soft delete (update deleted_at)
  async softDelete(
    table: string,
    filter: Record<string, string>,
  ): Promise<{ error: Error | null }> {
    try {
      const token = await getAuthToken();

      let url = `${supabaseUrl}/rest/v1/${table}?`;
      const filterParams = Object.entries(filter)
        .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
        .join("&");
      url += filterParams;

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${token}`,
          "Content-Profile": "rumah_quran",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ deleted_at: new Date().toISOString() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete");
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  },
};

// Direct fetch helper for custom schema (kept for backward compatibility)
export async function fetchProfiles(options?: {
  filter?: { column: string; value: string };
  limit?: number;
  single?: boolean;
  token?: string;
}) {
  // Use provided token or fall back to anon key
  let token = options?.token;
  if (!token) {
    const { data: sessionData } = await supabase.auth.getSession();
    token = sessionData?.session?.access_token || supabaseKey;
  }

  let url = `${supabaseUrl}/rest/v1/profiles?select=*`;

  if (options?.filter) {
    url += `&${options.filter.column}=eq.${encodeURIComponent(options.filter.value)}`;
  }
  if (options?.limit) {
    url += `&limit=${options.limit}`;
  }

  const response = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${token}`,
      "Accept-Profile": "rumah_quran",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    return {
      data: null,
      error: { message: errorText, status: response.status },
    };
  }

  const data = await response.json();

  if (options?.single) {
    return { data: data[0] || null, error: null };
  }

  return { data, error: null };
}

export default supabase;
