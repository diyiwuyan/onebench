const json = (body, status = 200, cache = "no-store") => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": cache,
    "x-content-type-options": "nosniff",
  },
});

const blockedFeedHost = (hostname) => {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host === "::1" || host === "0:0:0:0:0:0:0:1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80:")) return true;
  const match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!match) return false;
  const [a, b] = match.slice(1).map(Number);
  return a === 0 || a === 10 || a === 127 || a >= 224 || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 100 && b >= 64 && b <= 127);
};

const clean = (value = "", limit = 240) => String(value)
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
  .replace(/<[^>]+>/g, " ")
  .replace(/&amp;/gi, "&").replace(/&lt;/gi, "<").replace(/&gt;/gi, ">")
  .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
  .replace(/\s+/g, " ").trim().slice(0, limit);

const parseFeed = (xml, feedUrl, limit) => {
  const blocks = [...String(xml).matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map((match) => match[1]);
  if (!blocks.length) blocks.push(...[...String(xml).matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)].map((match) => match[1]));
  const read = (block, names) => {
    for (const name of names) {
      const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
      if (match) return match[1];
    }
    return "";
  };
  const feedTitle = clean(read(String(xml), ["title"]), 160) || new URL(feedUrl).hostname;
  const items = blocks.slice(0, limit).map((block, index) => {
    const atomLink = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/i)?.[1];
    const url = clean(atomLink || read(block, ["link"]), 2000);
    const rawDate = clean(read(block, ["pubDate", "published", "updated", "dc:date"]), 200);
    const date = new Date(rawDate);
    return {
      id: clean(read(block, ["guid", "id"]), 500) || url || `rss-${index}`,
      title: clean(read(block, ["title"])) || "未命名文章",
      meta: `${feedTitle} · ${Number.isNaN(date.getTime()) ? "刚刚更新" : date.toLocaleDateString("zh-CN")}`,
      url,
      publishedAt: Number.isNaN(date.getTime()) ? "" : date.toISOString(),
    };
  }).filter((item) => /^https?:\/\//i.test(item.url));
  return { title: feedTitle, items };
};

async function handleApi(request, env, url) {
  if (request.method !== "GET") return json({ error: "只支持 GET" }, 405);
  if (url.pathname === "/api/news") {
    const assetUrl = new URL(request.url);
    assetUrl.pathname = "/data/news.json";
    assetUrl.search = "";
    return env.ASSETS.fetch(new Request(assetUrl, request));
  }
  if (url.pathname !== "/api/rss") return null;
  let feedUrl;
  try { feedUrl = new URL(url.searchParams.get("url") || ""); } catch { return json({ error: "请输入完整的 RSS 地址" }, 400); }
  if (feedUrl.protocol !== "https:" || feedUrl.username || feedUrl.password || blockedFeedHost(feedUrl.hostname)) {
    return json({ error: "只允许读取公开的 HTTPS 订阅源" }, 400);
  }
  const limit = Math.min(30, Math.max(1, Number(url.searchParams.get("limit")) || 10));
  try {
    const outbound = env.OUTBOUND?.fetch ? env.OUTBOUND.fetch.bind(env.OUTBOUND) : fetch;
    const response = await outbound(feedUrl, {
      headers: { accept: "application/atom+xml, application/rss+xml, application/xml, text/xml;q=0.9", "user-agent": "OneBenchFeedReader/1.0" },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return json({ error: `订阅源返回 HTTP ${response.status}` }, 502);
    if (Number(response.headers.get("content-length") || 0) > 2_000_000) return json({ error: "订阅源内容过大" }, 413);
    const parsed = parseFeed((await response.text()).slice(0, 2_000_000), feedUrl.href, limit);
    if (!parsed.items.length) return json({ error: "订阅源中没有可读取的文章" }, 422);
    return json({ feedUrl: feedUrl.href, ...parsed, updatedAt: new Date().toISOString(), provider: "OneBench RSS 服务" }, 200, "public, max-age=900, stale-while-revalidate=3600");
  } catch {
    return json({ error: "订阅源暂时不可用" }, 502);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      const apiResponse = await handleApi(request, env, url);
      if (apiResponse) return apiResponse;
    }
    const response = await env.ASSETS.fetch(request);
    const acceptsHtml = request.headers.get("accept")?.includes("text/html");

    if (response.status !== 404 || !acceptsHtml || !["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const indexUrl = new URL(request.url);
    indexUrl.pathname = "/index.html";
    indexUrl.search = "";
    return env.ASSETS.fetch(new Request(indexUrl, request));
  },
};
