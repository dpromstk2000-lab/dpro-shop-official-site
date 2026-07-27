(() => {
  "use strict";

  const root = document.querySelector("[data-system-check]");
  if (!root) return;

  const EXPECTED_ORIGIN = "https://dpro-shop.com";
  const LINE_URL = "https://lin.ee/YxJGXV6D";
  const MEASUREMENT_ID = "G-YPN3998BHG";

  const pages = [
    { name: "トップ", path: "/", canonical: `${EXPECTED_ORIGIN}/` },
    { name: "LINE構築", path: "/line-build", canonical: `${EXPECTED_ORIGIN}/line-build` },
    { name: "LINE運用", path: "/line-operation", canonical: `${EXPECTED_ORIGIN}/line-operation` },
    { name: "HP制作", path: "/website", canonical: `${EXPECTED_ORIGIN}/website` },
    { name: "料金", path: "/pricing", canonical: `${EXPECTED_ORIGIN}/pricing` },
    { name: "DPRO SHOPについて", path: "/about", canonical: `${EXPECTED_ORIGIN}/about` },
    { name: "プライバシー", path: "/privacy", canonical: `${EXPECTED_ORIGIN}/privacy` },
    { name: "利用上の注意", path: "/terms", canonical: `${EXPECTED_ORIGIN}/terms` },
    { name: "お問い合わせ", path: "/contact", canonical: `${EXPECTED_ORIGIN}/contact` }
  ];

  const redirectPaths = pages
    .filter((page) => page.path !== "/")
    .map((page) => ({ from: `${page.path}.html`, to: page.path }));

  const requiredAssets = [
    "/favicon.svg",
    "/og-image.png",
    "/apple-touch-icon.png",
    "/icon-192.png",
    "/icon-512.png",
    "/site.webmanifest",
    "/styles.css?v=17r2",
    "/script.js?v=17r1",
    "/preview-pc.svg",
    "/preview-phone.svg",
    "/preview-ipad.svg",
    "/website-case-dpro-shop.webp"
  ];

  const elements = {
    run: document.querySelector("#run-checks"),
    copy: document.querySelector("#copy-results"),
    save: document.querySelector("#save-results"),
    resetManual: document.querySelector("#reset-manual"),
    origin: document.querySelector("#check-origin"),
    lastRun: document.querySelector("#last-run"),
    title: document.querySelector("#progress-title"),
    detail: document.querySelector("#progress-detail"),
    bar: document.querySelector("#progress-bar"),
    body: document.querySelector("#result-body"),
    filter: document.querySelector("#result-filter"),
    pass: document.querySelector("#count-pass"),
    warning: document.querySelector("#count-warning"),
    fail: document.querySelector("#count-fail"),
    pending: document.querySelector("#count-pending")
  };

  const results = [];
  let expectedChecks = 0;
  let finishedChecks = 0;
  let running = false;

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const formatTime = (date = new Date()) => new Intl.DateTimeFormat("ja-JP", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  }).format(date);

  const setProgress = (title, detail = "") => {
    elements.title.textContent = title;
    elements.detail.textContent = detail;
    const ratio = expectedChecks ? Math.min(100, (finishedChecks / expectedChecks) * 100) : 0;
    elements.bar.style.width = `${ratio}%`;
  };

  const updateCounts = () => {
    const counts = { pass: 0, warning: 0, fail: 0 };
    results.forEach((item) => { counts[item.status] += 1; });
    elements.pass.textContent = String(counts.pass);
    elements.warning.textContent = String(counts.warning);
    elements.fail.textContent = String(counts.fail);
    elements.pending.textContent = String(Math.max(0, expectedChecks - finishedChecks));
  };

  const renderResults = () => {
    const filter = elements.filter.value;
    const visible = results.filter((item) => filter === "all" || item.status === filter);

    if (!visible.length) {
      elements.body.innerHTML = '<tr class="empty-row"><td colspan="4">該当する結果はありません。</td></tr>';
      return;
    }

    const labels = { pass: "正常", warning: "要確認", fail: "不合格" };
    elements.body.innerHTML = visible.map((item) => `
      <tr data-status="${escapeHtml(item.status)}">
        <td><span class="result-status status-${escapeHtml(item.status)}">${labels[item.status]}</span></td>
        <td><span class="result-category">${escapeHtml(item.category)}</span></td>
        <td><span class="result-name">${escapeHtml(item.name)}</span></td>
        <td><div class="result-detail">${item.htmlDetail || escapeHtml(item.detail)}</div></td>
      </tr>
    `).join("");
  };

  const addResult = (category, name, status, detail, htmlDetail = "") => {
    results.push({ category, name, status, detail, htmlDetail });
    finishedChecks += 1;
    updateCounts();
    renderResults();
    setProgress(`検査中 ${finishedChecks}/${expectedChecks}`, name);
  };

  const withCacheBuster = (path) => {
    const url = new URL(path, window.location.origin);
    url.searchParams.set("_dpro_check", String(Date.now()));
    return url.toString();
  };

  const fetchResponse = async (path, options = {}) => {
    const response = await fetch(withCacheBuster(path), {
      cache: "no-store",
      credentials: "same-origin",
      ...options
    });
    return response;
  };

  const fetchText = async (path, options = {}) => {
    const response = await fetchResponse(path, options);
    return { response, text: await response.text() };
  };

  const parseHtml = (text) => new DOMParser().parseFromString(text, "text/html");

  const runPageChecks = async (page) => {
    let response;
    let text;
    try {
      ({ response, text } = await fetchText(page.path));
    } catch (error) {
      addResult("公開ページ", page.name, "fail", `取得できませんでした: ${error.message}`);
      for (let i = 0; i < 8; i += 1) {
        addResult("公開ページ", `${page.name} 追加検査`, "fail", "ページを取得できないため検査できませんでした。");
      }
      return;
    }

    addResult(
      "公開ページ",
      `${page.name} HTTP`,
      response.ok ? "pass" : "fail",
      `HTTP ${response.status} / ${response.url}`
    );

    const doc = parseHtml(text);
    const title = doc.querySelector("title")?.textContent.trim() || "";
    addResult(
      "SEO・文書",
      `${page.name} title`,
      title ? "pass" : "fail",
      title || "titleがありません。"
    );

    const description = doc.querySelector('meta[name="description"]')?.content.trim() || "";
    addResult(
      "SEO・文書",
      `${page.name} description`,
      description.length >= 40 ? "pass" : (description ? "warning" : "fail"),
      description ? `${description.length}文字` : "descriptionがありません。"
    );

    const canonical = doc.querySelector('link[rel="canonical"]')?.href || "";
    addResult(
      "SEO・文書",
      `${page.name} canonical`,
      canonical === page.canonical ? "pass" : "fail",
      canonical || "canonicalがありません。"
    );

    const h1Count = doc.querySelectorAll("h1").length;
    addResult(
      "アクセシビリティ",
      `${page.name} H1`,
      h1Count === 1 ? "pass" : "fail",
      `${h1Count}個`
    );

    const robots = (doc.querySelector('meta[name="robots"]')?.content || "").toLowerCase();
    addResult(
      "インデックス",
      `${page.name} robots`,
      robots.includes("noindex") ? "fail" : "pass",
      robots || "index許可（robots指定なし）"
    );

    const jsonLdScripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
    let jsonLdValid = jsonLdScripts.length > 0;
    let jsonLdDetail = `${jsonLdScripts.length}ブロック`;
    try {
      jsonLdScripts.forEach((script) => JSON.parse(script.textContent));
    } catch (error) {
      jsonLdValid = false;
      jsonLdDetail = error.message;
    }
    addResult(
      "構造化データ",
      `${page.name} JSON-LD`,
      jsonLdValid ? "pass" : "fail",
      jsonLdDetail
    );

    const gaScript = [...doc.scripts].find((script) => (script.src || "").includes(`gtag/js?id=${MEASUREMENT_ID}`));
    addResult(
      "アクセス計測",
      `${page.name} GA4`,
      gaScript ? "pass" : "fail",
      gaScript ? MEASUREMENT_ID : "Googleタグがありません。"
    );

    const lineLinks = [...doc.querySelectorAll(`a[href="${LINE_URL}"]`)];
    const wrongLineLinks = [...doc.querySelectorAll('a[href*="lin.ee/"]')]
      .filter((link) => link.href !== LINE_URL);
    addResult(
      "LINE導線",
      `${page.name} LINEリンク`,
      lineLinks.length > 0 && wrongLineLinks.length === 0 ? "pass" : (lineLinks.length ? "warning" : "fail"),
      `正規リンク ${lineLinks.length}件 / 別URL ${wrongLineLinks.length}件`
    );
  };

  const runGlobalChecks = async () => {
    const titles = new Set();
    const canonicals = new Set();

    for (const page of pages) {
      try {
        const { text } = await fetchText(page.path);
        const doc = parseHtml(text);
        const title = doc.querySelector("title")?.textContent.trim();
        const canonical = doc.querySelector('link[rel="canonical"]')?.href;
        if (title) titles.add(title);
        if (canonical) canonicals.add(canonical);
      } catch {}
    }

    addResult(
      "SEO・文書",
      "タイトル重複",
      titles.size === pages.length ? "pass" : "warning",
      `${titles.size}/${pages.length}種類`
    );

    addResult(
      "SEO・文書",
      "canonical重複",
      canonicals.size === pages.length ? "pass" : "fail",
      `${canonicals.size}/${pages.length}種類`
    );

    try {
      const { response, text } = await fetchText("/sitemap.xml");
      const xml = new DOMParser().parseFromString(text, "application/xml");
      const locs = [...xml.querySelectorAll("loc")].map((node) => node.textContent.trim());
      const expected = pages.map((page) => page.canonical);
      const missing = expected.filter((url) => !locs.includes(url));
      const includesCheck = locs.some((url) => url.includes("system-check"));

      addResult("検索エンジン", "sitemap.xml HTTP", response.ok ? "pass" : "fail", `HTTP ${response.status}`);
      addResult(
        "検索エンジン",
        "サイトマップ主要9ページ",
        missing.length === 0 && locs.length === 9 ? "pass" : "fail",
        `登録 ${locs.length}件 / 不足 ${missing.length}件`
      );
      addResult(
        "検索エンジン",
        "検査ページをサイトマップから除外",
        includesCheck ? "fail" : "pass",
        includesCheck ? "system-checkが登録されています。" : "除外済み"
      );
    } catch (error) {
      addResult("検索エンジン", "sitemap.xml HTTP", "fail", error.message);
      addResult("検索エンジン", "サイトマップ主要9ページ", "fail", "取得できませんでした。");
      addResult("検索エンジン", "検査ページをサイトマップから除外", "fail", "確認できませんでした。");
    }

    try {
      const { response, text } = await fetchText("/robots.txt");
      addResult("検索エンジン", "robots.txt HTTP", response.ok ? "pass" : "fail", `HTTP ${response.status}`);
      addResult(
        "検索エンジン",
        "robots.txt サイトマップ",
        text.includes("https://dpro-shop.com/sitemap.xml") ? "pass" : "fail",
        text.includes("https://dpro-shop.com/sitemap.xml") ? "記載あり" : "記載なし"
      );
      addResult(
        "検索エンジン",
        "system-checkをクロール対象外",
        /Disallow:\s*\/system-check/i.test(text) ? "pass" : "fail",
        /Disallow:\s*\/system-check/i.test(text) ? "設定済み" : "設定なし"
      );
    } catch (error) {
      addResult("検索エンジン", "robots.txt HTTP", "fail", error.message);
      addResult("検索エンジン", "robots.txt サイトマップ", "fail", "確認できませんでした。");
      addResult("検索エンジン", "system-checkをクロール対象外", "fail", "確認できませんでした。");
    }

    try {
      const response = await fetchResponse("/");
      const headers = response.headers;
      const csp = headers.get("content-security-policy") || "";
      addResult(
        "セキュリティ",
        "Content-Security-Policy",
        csp.includes("googletagmanager.com") && csp.includes("static.cloudflareinsights.com") ? "pass" : "fail",
        csp ? "Google・Cloudflare許可を確認" : "CSPがありません。"
      );
      addResult(
        "セキュリティ",
        "X-Content-Type-Options",
        (headers.get("x-content-type-options") || "").toLowerCase() === "nosniff" ? "pass" : "fail",
        headers.get("x-content-type-options") || "未設定"
      );
      addResult(
        "セキュリティ",
        "Referrer-Policy",
        headers.get("referrer-policy") ? "pass" : "warning",
        headers.get("referrer-policy") || "未設定"
      );
      addResult(
        "セキュリティ",
        "X-Frame-Options",
        (headers.get("x-frame-options") || "").toUpperCase() === "DENY" ? "pass" : "warning",
        headers.get("x-frame-options") || "未設定"
      );
    } catch (error) {
      for (const name of ["Content-Security-Policy", "X-Content-Type-Options", "Referrer-Policy", "X-Frame-Options"]) {
        addResult("セキュリティ", name, "fail", error.message);
      }
    }

    try {
      const { response, text } = await fetchText("/site.webmanifest");
      const manifest = JSON.parse(text);
      const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
      addResult("PWA・アイコン", "site.webmanifest", response.ok ? "pass" : "fail", `HTTP ${response.status}`);
      addResult(
        "PWA・アイコン",
        "manifest start_url",
        manifest.start_url === "/" ? "pass" : "warning",
        manifest.start_url || "未設定"
      );
      addResult(
        "PWA・アイコン",
        "manifest icons",
        icons.length >= 2 ? "pass" : "fail",
        `${icons.length}件`
      );
    } catch (error) {
      addResult("PWA・アイコン", "site.webmanifest", "fail", error.message);
      addResult("PWA・アイコン", "manifest start_url", "fail", "確認できませんでした。");
      addResult("PWA・アイコン", "manifest icons", "fail", "確認できませんでした。");
    }

    for (const asset of requiredAssets) {
      try {
        const response = await fetchResponse(asset);
        addResult(
          "静的ファイル",
          asset.split("?")[0],
          response.ok ? "pass" : "fail",
          `HTTP ${response.status}`
        );
      } catch (error) {
        addResult("静的ファイル", asset.split("?")[0], "fail", error.message);
      }
    }

    for (const item of redirectPaths) {
      try {
        const response = await fetchResponse(item.from);
        const finalPath = new URL(response.url).pathname;
        addResult(
          "リダイレクト",
          item.from,
          response.ok && finalPath === item.to ? "pass" : "fail",
          `${response.status} → ${finalPath}`
        );
      } catch (error) {
        addResult("リダイレクト", item.from, "fail", error.message);
      }
    }

    try {
      const randomPath = `/dpro-not-found-${Date.now()}`;
      const { response, text } = await fetchText(randomPath);
      addResult(
        "404",
        "存在しないURLのHTTP",
        response.status === 404 ? "pass" : "fail",
        `HTTP ${response.status}`
      );
      addResult(
        "404",
        "独自404ページ",
        text.includes("見つかりませんでした") ? "pass" : "fail",
        text.includes("見つかりませんでした") ? "表示内容を確認" : "独自文言がありません。"
      );
    } catch (error) {
      addResult("404", "存在しないURLのHTTP", "fail", error.message);
      addResult("404", "独自404ページ", "fail", "確認できませんでした。");
    }

    try {
      const { text } = await fetchText("/script.js?v=17r1");
      addResult(
        "アクセス計測",
        "generate_lead実装",
        text.includes('sendAnalyticsEvent("generate_lead"') && text.includes(LINE_URL) ? "pass" : "fail",
        text.includes('sendAnalyticsEvent("generate_lead"') ? "実装あり" : "実装なし"
      );
    } catch (error) {
      addResult("アクセス計測", "generate_lead実装", "fail", error.message);
    }
  };

  const buildReport = () => {
    const counts = { pass: 0, warning: 0, fail: 0 };
    results.forEach((item) => { counts[item.status] += 1; });
    const lines = [
      "DPRO SHOP 公開後最終動作検査",
      `対象: ${window.location.origin}`,
      `実行: ${elements.lastRun.textContent}`,
      "",
      `正常: ${counts.pass}`,
      `要確認: ${counts.warning}`,
      `不合格: ${counts.fail}`,
      "",
      ...results.map((item) => `[${item.status.toUpperCase()}] ${item.category} / ${item.name} / ${item.detail}`)
    ];
    return lines.join("\n");
  };

  const runChecks = async () => {
    if (running) return;
    running = true;
    results.length = 0;
    finishedChecks = 0;

    expectedChecks =
      pages.length * 9 +
      2 +
      3 +
      3 +
      4 +
      3 +
      requiredAssets.length +
      redirectPaths.length +
      2 +
      1;

    elements.run.disabled = true;
    elements.copy.disabled = true;
    elements.save.disabled = true;
    elements.filter.value = "all";
    elements.body.innerHTML = "";
    elements.bar.style.width = "0%";
    updateCounts();
    setProgress("検査を開始しました", "本番ページを順番に確認しています。");

    const isProductionOrigin = window.location.origin === EXPECTED_ORIGIN;
    addResult(
      "実行環境",
      "本番ドメイン",
      isProductionOrigin ? "pass" : "warning",
      window.location.origin
    );
    expectedChecks += 1;

    for (const page of pages) {
      await runPageChecks(page);
    }

    await runGlobalChecks();

    elements.lastRun.textContent = formatTime();
    elements.bar.style.width = "100%";

    const failures = results.filter((item) => item.status === "fail").length;
    const warnings = results.filter((item) => item.status === "warning").length;

    if (failures > 0) {
      setProgress("検査完了：修正が必要です", `不合格 ${failures}件、要確認 ${warnings}件`);
    } else if (warnings > 0) {
      setProgress("検査完了：重大な不合格はありません", `要確認 ${warnings}件`);
    } else {
      setProgress("検査完了：すべて正常です", `${results.length}項目を確認しました。`);
    }

    elements.copy.disabled = false;
    elements.save.disabled = false;
    elements.run.disabled = false;
    running = false;
  };

  const setupManualChecks = () => {
    document.querySelectorAll("[data-manual-check]").forEach((input) => {
      const key = `dpro-web18-${input.dataset.manualCheck}`;
      input.checked = localStorage.getItem(key) === "1";
      input.addEventListener("change", () => {
        localStorage.setItem(key, input.checked ? "1" : "0");
      });
    });
  };

  elements.origin.textContent = window.location.origin;
  elements.run.addEventListener("click", runChecks);
  elements.filter.addEventListener("change", renderResults);
  elements.copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(buildReport());
      elements.copy.textContent = "コピーしました";
      window.setTimeout(() => { elements.copy.textContent = "結果をコピー"; }, 1600);
    } catch {
      elements.copy.textContent = "コピーできませんでした";
    }
  });
  elements.save.addEventListener("click", () => {
    const blob = new Blob([buildReport()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `DPRO-SHOP-WEB18-CHECK-${new Date().toISOString().slice(0, 10)}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  });
  elements.resetManual.addEventListener("click", () => {
    document.querySelectorAll("[data-manual-check]").forEach((input) => {
      input.checked = false;
      localStorage.removeItem(`dpro-web18-${input.dataset.manualCheck}`);
    });
  });

  setupManualChecks();
})();
