import { createClient } from "@woovi/node-sdk";

/**
 * Woovi (OpenPix) Global Client
 * IMPORTANT: All requests must use the AppID without the 'Bearer' prefix.
 * The SDK handles this default authentication when appId is provided.
 */
export const woovi = createClient({ 
  appId: process.env.WOOVI_APP_ID! 
});

/**
 * Helper for direct fetch calls to Woovi API when the SDK doesn't cover specific endpoints.
 * @param endpoint The API endpoint (e.g., '/charge')
 * @param options Standard RequestInit options
 */
export async function wooviRequest(
  endpoint: string,
  options: RequestInit = {}
) {
  const baseUrl = "https://api.woovi.com/api/v1";
  
  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "Authorization": process.env.WOOVI_APP_ID!,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: "Unknown Woovi API error" }));
    console.error("Woovi API Error:", error);
    throw new Error(`Woovi API error: ${JSON.stringify(error)}`);
  }

  return res.json();
}
