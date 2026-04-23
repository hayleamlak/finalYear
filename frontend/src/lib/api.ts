import { env } from "@/lib/env";

type RequestOptions = RequestInit & {
  token?: string;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...requestOptions } = options;
  let response: Response;
  const requestUrl = `${env.apiUrl}${path}`;

  try {
    response = await fetch(requestUrl, {
      ...requestOptions,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(headers ?? {}),
      },
    });
  } catch {
    throw new Error(`Network request failed. Check API URL: ${env.apiUrl}`);
  }

  const payload = (await response.json().catch(() => null)) as T | { message?: string } | null;

  if (!response.ok) {
    const message = payload && typeof payload === "object" && "message" in payload ? payload.message : null;
    throw new Error(message ?? `Request failed with status ${response.status}`);
  }

  return payload as T;
}