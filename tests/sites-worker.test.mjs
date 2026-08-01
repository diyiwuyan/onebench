import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import test from "node:test";
import worker from "../worker/index.js";

test("serves existing static assets without a fallback", async () => {
  const calls = [];
  const response = await worker.fetch(new Request("https://example.test/assets/app.js"), {
    ASSETS: {
      fetch: async (request) => {
        calls.push(new URL(request.url).pathname);
        return new Response("asset", { status: 200 });
      },
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/assets/app.js"]);
});

test("falls back to index.html for an unknown app route", async () => {
  const calls = [];
  const response = await worker.fetch(
    new Request("https://example.test/flow/step-two?source=share", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async (request) => {
          const url = new URL(request.url);
          calls.push(url.pathname + url.search);
          return new Response(url.pathname === "/index.html" ? "app" : "missing", {
            status: url.pathname === "/index.html" ? 200 : 404,
          });
        },
      },
    },
  );

  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["/flow/step-two?source=share", "/index.html"]);
});

test("does not turn missing API or write requests into the app shell", async () => {
  for (const request of [
    new Request("https://example.test/api/missing", { headers: { accept: "application/json" } }),
    new Request("https://example.test/flow", { method: "POST", headers: { accept: "text/html" } }),
  ]) {
    let calls = 0;
    const response = await worker.fetch(request, {
      ASSETS: {
        fetch: async () => {
          calls += 1;
          return new Response("missing", { status: 404 });
        },
      },
    });

    assert.equal(response.status, 404);
    assert.equal(calls, 1);
  }
});

test("reads a public RSS feed through the same-origin API", async () => {
  const response = await worker.fetch(new Request("https://example.test/api/rss?url=https%3A%2F%2Ffeed.example.com%2Frss.xml"), {
    ASSETS: { fetch: async () => new Response("missing", { status: 404 }) },
    OUTBOUND: { fetch: async () => new Response('<?xml version="1.0"?><rss><channel><title>示例源</title><item><title>第一篇</title><link>https://feed.example.com/a</link><pubDate>Fri, 01 Aug 2025 08:00:00 GMT</pubDate></item></channel></rss>', { headers: { "content-type": "application/rss+xml" } }) },
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.provider, "OneBench RSS 服务");
  assert.equal(body.items[0].title, "第一篇");
});

test("RSS API rejects local and non-HTTPS targets", async () => {
  for (const target of ["http://example.com/feed", "https://127.0.0.1/feed", "https://service.local/feed"]) {
    const response = await worker.fetch(new Request(`https://example.test/api/rss?url=${encodeURIComponent(target)}`), {
      ASSETS: { fetch: async () => new Response("missing", { status: 404 }) },
    });
    assert.equal(response.status, 400);
  }
});

test("emits the files required by Sites packaging", async () => {
  await access(new URL("../dist/client/index.html", import.meta.url));
  await access(new URL("../dist/server/index.js", import.meta.url));
  await access(new URL("../dist/.openai/hosting.json", import.meta.url));
});
