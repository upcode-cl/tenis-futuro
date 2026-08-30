export type InstagramPost = {
  id: string;
  caption: string | null;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | string;
  mediaUrl: string | null;
  permalink: string;
  thumbnailUrl: string | null;
  timestamp: string;
};

type InstagramApiMedia = {
  id: string;
  caption?: string;
  media_type: string;
  media_url?: string;
  permalink: string;
  thumbnail_url?: string;
  timestamp: string;
};

type InstagramApiResponse = {
  data?: InstagramApiMedia[];
  error?: { message: string; type?: string; code?: number };
};

export async function getInstagramPosts(
  limit = 6,
): Promise<{ posts: InstagramPost[]; error: string | null }> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_USER_ID;

  if (!token || !userId) {
    return {
      posts: [],
      error: "Faltan INSTAGRAM_ACCESS_TOKEN o INSTAGRAM_USER_ID en .env.local",
    };
  }

  const fields =
    "id,caption,media_type,media_url,permalink,thumbnail_url,timestamp";
  const url = new URL(`https://graph.instagram.com/v21.0/${userId}/media`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("access_token", token);
  url.searchParams.set("limit", String(limit));

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });
    const json = (await res.json()) as InstagramApiResponse;

    if (!res.ok || json.error) {
      return {
        posts: [],
        error: json.error?.message ?? `Error Instagram HTTP ${res.status}`,
      };
    }

    const posts: InstagramPost[] = (json.data ?? []).map((item) => ({
      id: item.id,
      caption: item.caption ?? null,
      mediaType: item.media_type,
      mediaUrl: item.media_url ?? null,
      permalink: item.permalink,
      thumbnailUrl: item.thumbnail_url ?? null,
      timestamp: item.timestamp,
    }));

    return { posts, error: null };
  } catch (err) {
    return {
      posts: [],
      error: err instanceof Error ? err.message : "Error al consultar Instagram",
    };
  }
}
