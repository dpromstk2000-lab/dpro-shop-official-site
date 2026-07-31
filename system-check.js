(() => {
  "use strict";

  const root = document.querySelector("[data-system-check]");
  if (!root) return;

  const EXPECTED_ORIGIN = "https://dpro-shop.com";
  const LINE_URL = "https://lin.ee/YxJGXV6D";
  const MEASUREMENT_ID = "G-YPN3998BHG";
  const SYSTEM_SLUGS = ["vet", "pet-salon", "dental", "osteopathic", "dayservice", "home-nursing", "homecare", "careplan", "senior-meal-delivery", "houkago-dayservice", "btype", "sodan", "welfare-equipment", "shuttle", "caretaxi", "hair", "salon", "nail", "eye-salon", "esthe", "gym", "yoga", "bakery", "cake", "takeout", "izakaya", "yakiniku", "buyback", "cosmetics", "flower-shop", "photo-studio", "repair", "car-service", "used-car", "estate", "reform", "disposal", "school", "stay", "cleaning", "housekeep", "gyosei", "shiho", "sharoushi", "tax-accounting", "chosashi", "funeral"];
  const SYSTEM_NAMES = {"vet": "動物病院", "pet-salon": "ペットサロン", "dental": "歯科医院", "osteopathic": "整骨院・整体", "dayservice": "デイサービス", "home-nursing": "訪問看護", "homecare": "訪問介護・家族連絡", "careplan": "居宅介護支援・ケアマネ", "senior-meal-delivery": "高齢者配食サービス", "houkago-dayservice": "放課後等デイ", "btype": "就労継続支援B型", "sodan": "相談支援事業所", "welfare-equipment": "福祉用具", "shuttle": "福祉施設送迎", "caretaxi": "介護タクシー", "hair": "美容室", "salon": "美容サロン", "nail": "ネイルサロン", "eye-salon": "まつげ・眉サロン", "esthe": "エステ・リラク", "gym": "パーソナルジム", "yoga": "プライベートヨガ", "bakery": "ベーカリー", "cake": "ケーキ・洋菓子", "takeout": "テイクアウト", "izakaya": "居酒屋", "yakiniku": "焼肉店", "buyback": "買取・査定", "cosmetics": "化粧品店", "flower-shop": "フラワーショップ", "photo-studio": "写真館", "repair": "修理受付", "car-service": "車検・整備工場", "used-car": "中古車買取・販売", "estate": "不動産・賃貸内見", "reform": "リフォーム・工務店", "disposal": "不用品回収・遺品整理", "school": "学習塾・習い事", "stay": "宿泊・民泊", "cleaning": "クリーニング", "housekeep": "家事代行", "gyosei": "行政書士", "shiho": "司法書士・相続登記", "sharoushi": "社労士", "tax-accounting": "税理士・会計", "chosashi": "土地家屋調査士", "funeral": "葬儀・法要"};

  const corePages = [
    { name: "トップ", path: "/", canonical: `${EXPECTED_ORIGIN}/` },
    { name: "LINE構築", path: "/line-build", canonical: `${EXPECTED_ORIGIN}/line-build` },
    { name: "LINE運用", path: "/line-operation", canonical: `${EXPECTED_ORIGIN}/line-operation` },
    { name: "HP制作", path: "/website", canonical: `${EXPECTED_ORIGIN}/website` },
    { name: "料金", path: "/pricing", canonical: `${EXPECTED_ORIGIN}/pricing` },
    { name: "システム一覧", path: "/systems/", canonical: `${EXPECTED_ORIGIN}/systems/` },
    { name: "DPRO SHOPについて", path: "/about", canonical: `${EXPECTED_ORIGIN}/about` },
    { name: "プライバシー", path: "/privacy", canonical: `${EXPECTED_ORIGIN}/privacy` },
    { name: "利用上の注意", path: "/terms", canonical: `${EXPECTED_ORIGIN}/terms` },
    { name: "お問い合わせ", path: "/contact", canonical: `${EXPECTED_ORIGIN}/contact` }
  ];

  const systemPages = SYSTEM_SLUGS.map((slug) => ({
    name: `システム：${SYSTEM_NAMES[slug] || slug}`,
    path: `/systems/${slug}`,
    canonical: `${EXPECTED_ORIGIN}/systems/${slug}`,
    isSystem: true
  }));
  const pages = [...corePages, ...systemPages];

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

  const prohibited = [
    /localhost/i, /127\.0\.0\.1/, /example\.com/i, /javascript:void\(0\)/i,
    /href\s*=\s*["']\s*["']/i, /未設定URL/i, /仮URL/i
  ];

  const results = [];
  let expectedChecks = 0;
  let finishedChecks = 0;
  let running = false;

  const escapeHtml = (value) => String(value)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  const formatTime = (date = new Date()) => new Intl.DateTimeFormat("ja-JP", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  }).format(date);

  const updateCounts = () => {
    const counts = { pass: 0, warning: 0, fail: 0 };
    results.forEach((item) => { counts[item.status] += 1; });
    elements.pass.textContent = String(counts.pass);
    elements.warning.textContent = String(counts.warning);
    elements.fail.textContent = String(counts.fail);
    elements.pending.textContent = String(Math.max(0, expectedChecks - finishedChecks));
  };

  const setProgress = (title, detail = "") => {
    elements.title.textContent = title;
    elements.detail.textContent = detail;
    const ratio = expectedChecks ? Math.min(100, (finishedChecks / expectedChecks) * 100) : 0;
    elements.bar.style.width = `${ratio}%`;
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
        <td><div class="result-detail">${escapeHtml(item.detail)}</div></td>
      </tr>`).join("");
  };

  const addResult = (category, name, status, detail) => {
    results.push({ category, name, status, detail });
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

  const fetchText = async (path) => {
    const response = await fetch(withCacheBuster(path), {
      cache: "no-store", credentials: "same-origin"
    });
    return { response, text: await response.text() };
  };

  const parseHtml = (text) => new DOMParser().parseFromString(text, "text/html");

  const inspectPage = async (page) => {
    try {
      const { response, text } = await fetchText(page.path);
      if (!response.ok) {
        addResult("公開ページ", page.name, "fail", `HTTP ${response.status} / ${response.url}`);
        return;
      }

      const doc = parseHtml(text);
      const failures = [];
      const warnings = [];

      const title = doc.querySelector("title")?.textContent.trim() || "";
      if (!title) failures.push("titleなし");

      const description = doc.querySelector('meta[name="description"]')?.content.trim() || "";
      if (!description) failures.push("descriptionなし");
      else if (description.length < 40) warnings.push(`description ${description.length}文字`);

      const canonical = doc.querySelector('link[rel="canonical"]')?.href || "";
      if (canonical !== page.canonical) failures.push(`canonical不一致: ${canonical || "なし"}`);

      const h1Count = doc.querySelectorAll("h1").length;
      if (h1Count !== 1) failures.push(`H1 ${h1Count}個`);

      const robots = (doc.querySelector('meta[name="robots"]')?.content || "").toLowerCase();
      if (robots.includes("noindex")) failures.push("noindex");

      const ogUrl = doc.querySelector('meta[property="og:url"]')?.content || "";
      if (ogUrl && ogUrl !== page.canonical) failures.push(`OG URL不一致: ${ogUrl}`);
      if (!ogUrl) warnings.push("OG URLなし");

      const twitterCard = doc.querySelector('meta[name="twitter:card"]');
      const twitterTitle = doc.querySelector('meta[name="twitter:title"]');
      const twitterDescription = doc.querySelector('meta[name="twitter:description"]');
      const twitterImage = doc.querySelector('meta[name="twitter:image"]');
      if (!twitterCard) failures.push("Twitter Cardなし");
      if (page.isSystem && (!twitterTitle || !twitterDescription || !twitterImage)) {
        warnings.push("Twitter詳細タグ不足");
      }

      const jsonLdScripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
      if (!jsonLdScripts.length) failures.push("JSON-LDなし");
      for (const script of jsonLdScripts) {
        try { JSON.parse(script.textContent); }
        catch (error) { failures.push(`JSON-LD不正: ${error.message}`); break; }
      }

      const gaScript = [...doc.scripts].find((script) => (script.src || "").includes(`gtag/js?id=${MEASUREMENT_ID}`));
      if (!gaScript) warnings.push("GA4タグなし");

      const sourceText = text;
      prohibited.forEach((pattern) => {
        if (pattern.test(sourceText)) failures.push(`禁止値: ${pattern}`);
      });

      const lineLinks = [...doc.querySelectorAll('a[href*="lin.ee/"]')];
      const wrongLine = lineLinks.some((link) => link.href !== LINE_URL);
      if (!lineLinks.length) warnings.push("LINE相談リンクなし");
      if (wrongLine) failures.push("異なるLINE URL");

      if (page.isSystem) {
        const styles = [...doc.querySelectorAll('link[rel="stylesheet"]')].map((link) => link.getAttribute("href") || "");
        const scripts = [...doc.querySelectorAll("script[src]")].map((script) => script.getAttribute("src") || "");
        if (!styles.some((href) => href.startsWith("../styles.css"))) failures.push("../styles.css未接続");
        if (!styles.some((href) => href.startsWith("systems.css"))) failures.push("systems.css未接続");
        if (!scripts.some((src) => src.startsWith("../script.js"))) warnings.push("../script.js未接続");
        if (!scripts.some((src) => src.startsWith("systems.js"))) warnings.push("systems.js未接続");
      }

      const status = failures.length ? "fail" : (warnings.length ? "warning" : "pass");
      const detail = [
        `HTTP ${response.status}`,
        failures.length ? `不合格: ${[...new Set(failures)].join(" / ")}` : "",
        warnings.length ? `要確認: ${[...new Set(warnings)].join(" / ")}` : "",
        !failures.length && !warnings.length ? "主要HTML・SEO・共通資産正常" : ""
      ].filter(Boolean).join("｜");
      addResult(page.isSystem ? "個別システム" : "主要ページ", page.name, status, detail);
    } catch (error) {
      addResult(page.isSystem ? "個別システム" : "主要ページ", page.name, "fail", `取得失敗: ${error.message}`);
    }
  };

  const inspectCatalog = async () => {
    try {
      const { response, text } = await fetchText("/systems/");
      const doc = parseHtml(text);
      const cards = [...doc.querySelectorAll(".sys-product-card[data-system-category]")];
      const hrefs = cards.map((card) => card.getAttribute("href") || "");
      const unique = new Set(hrefs);
      const missing = SYSTEM_SLUGS.filter((slug) => !unique.has(slug));
      const extra = [...unique].filter((slug) => !SYSTEM_SLUGS.includes(slug));
      const filters = [...doc.querySelectorAll("[data-system-filter]")];
      const listScripts = [...doc.querySelectorAll('script[type="application/ld+json"]')];
      let itemList = null;
      for (const script of listScripts) {
        try {
          const data = JSON.parse(script.textContent);
          const graph = Array.isArray(data?.["@graph"]) ? data["@graph"] : [];
          itemList = graph.find((item) => item?.["@type"] === "ItemList") || itemList;
        } catch {}
      }
      const positions = Array.isArray(itemList?.itemListElement)
        ? itemList.itemListElement.map((item) => Number(item.position))
        : [];
      const sequential = positions.length === 47 && positions.every((value, index) => value === index + 1);
      const ok = response.ok && cards.length === 47 && unique.size === 47 && !missing.length &&
        !extra.length && filters.length === 12 && itemList?.numberOfItems === 47 && sequential;
      addResult(
        "一覧統合",
        "47カード・11カテゴリ・ItemList",
        ok ? "pass" : "fail",
        `HTTP ${response.status} / カード ${cards.length} / 重複 ${cards.length - unique.size} / 不足 ${missing.length} / 余分 ${extra.length} / フィルター ${Math.max(0, filters.length - 1)} / numberOfItems ${itemList?.numberOfItems ?? "なし"} / 連番 ${sequential ? "正常" : "不正"}`
      );
    } catch (error) {
      addResult("一覧統合", "47カード・11カテゴリ・ItemList", "fail", error.message);
    }
  };

  const inspectSitemap = async () => {
    try {
      const { response, text } = await fetchText("/sitemap.xml");
      const xml = new DOMParser().parseFromString(text, "application/xml");
      const parserError = xml.querySelector("parsererror");
      const locs = [...xml.querySelectorAll("loc")].map((node) => node.textContent.trim());
      const unique = new Set(locs);
      const expected = pages.map((page) => page.canonical);
      const missing = expected.filter((url) => !unique.has(url));
      const unexpectedHtml = locs.filter((url) => url.endsWith(".html"));
      const includesCheck = locs.some((url) => url.includes("system-check"));
      const ok = response.ok && !parserError && locs.length === 57 && unique.size === 57 &&
        !missing.length && !unexpectedHtml.length && !includesCheck;
      addResult(
        "検索エンジン",
        "sitemap.xml 57URL",
        ok ? "pass" : "fail",
        `HTTP ${response.status} / URL ${locs.length} / 重複 ${locs.length - unique.size} / 不足 ${missing.length} / .html ${unexpectedHtml.length} / 検査ページ ${includesCheck ? "混入" : "除外"}`
      );
    } catch (error) {
      addResult("検索エンジン", "sitemap.xml 57URL", "fail", error.message);
    }
  };

  const inspectRobots = async () => {
    try {
      const { response, text } = await fetchText("/robots.txt");
      const ok = response.ok &&
        text.includes("https://dpro-shop.com/sitemap.xml") &&
        /Disallow:\s*\/system-check/i.test(text);
      addResult("検索エンジン", "robots.txt", ok ? "pass" : "fail",
        `HTTP ${response.status} / Sitemap ${text.includes("https://dpro-shop.com/sitemap.xml") ? "あり" : "なし"} / system-check ${/Disallow:\s*\/system-check/i.test(text) ? "除外" : "未除外"}`);
    } catch (error) {
      addResult("検索エンジン", "robots.txt", "fail", error.message);
    }
  };

  const inspectAssets = async () => {
    const assets = [
      "/favicon.svg", "/og-image.png", "/site.webmanifest", "/styles.css?v=17r2",
      "/script.js?v=17r1", "/systems/systems.css?v=17", "/systems/systems.js?v=17"
    ];
    const failed = [];
    for (const asset of assets) {
      try {
        const response = await fetch(withCacheBuster(asset), { cache: "no-store" });
        if (!response.ok) failed.push(`${asset}(${response.status})`);
      } catch (error) {
        failed.push(`${asset}(${error.message})`);
      }
    }
    addResult("共通資産", "CSS・JavaScript・画像", failed.length ? "fail" : "pass",
      failed.length ? failed.join(" / ") : `${assets.length}件すべて取得成功`);
  };

  const inspectHeaders = async () => {
    try {
      const response = await fetch(withCacheBuster("/"), { cache: "no-store" });
      const headers = response.headers;
      const checks = {
        csp: headers.get("content-security-policy") || "",
        nosniff: (headers.get("x-content-type-options") || "").toLowerCase(),
        referrer: headers.get("referrer-policy") || ""
      };
      const ok = checks.csp && checks.nosniff === "nosniff" && checks.referrer;
      addResult("セキュリティ", "配信ヘッダー", ok ? "pass" : "warning",
        `CSP ${checks.csp ? "あり" : "なし"} / nosniff ${checks.nosniff || "なし"} / Referrer ${checks.referrer || "なし"}`);
    } catch (error) {
      addResult("セキュリティ", "配信ヘッダー", "fail", error.message);
    }
  };

  const runChecks = async () => {
    if (running) return;
    running = true;
    results.length = 0;
    finishedChecks = 0;
    expectedChecks = pages.length + 5;
    elements.run.disabled = true;
    elements.copy.disabled = true;
    elements.save.disabled = true;
    elements.body.innerHTML = "";
    updateCounts();
    setProgress("検査を開始します", `主要10ページ＋システム47ページ`);

    for (const page of pages) await inspectPage(page);
    await inspectCatalog();
    await inspectSitemap();
    await inspectRobots();
    await inspectAssets();
    await inspectHeaders();

    elements.lastRun.textContent = formatTime();
    const failures = results.filter((item) => item.status === "fail").length;
    const warnings = results.filter((item) => item.status === "warning").length;
    setProgress(failures ? "不合格があります" : (warnings ? "要確認があります" : "全自動検査に合格"),
      `正常 ${results.filter((item) => item.status === "pass").length} / 要確認 ${warnings} / 不合格 ${failures}`);
    elements.bar.style.width = "100%";
    elements.run.disabled = false;
    elements.copy.disabled = false;
    elements.save.disabled = false;
    running = false;
  };

  const exportText = () => {
    const lines = [
      "DPRO SHOP 全57ページ公開後検査",
      `対象: ${window.location.origin}`,
      `実行: ${elements.lastRun.textContent}`,
      ""
    ];
    results.forEach((item) => lines.push(`[${item.status.toUpperCase()}] ${item.category} / ${item.name} / ${item.detail}`));
    return lines.join("\n");
  };

  elements.run.addEventListener("click", runChecks);
  elements.filter.addEventListener("change", renderResults);
  elements.copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(exportText());
      elements.copy.textContent = "コピーしました";
      setTimeout(() => { elements.copy.textContent = "結果をコピー"; }, 1600);
    } catch {
      alert("コピーできませんでした。TXT保存を使用してください。");
    }
  });
  elements.save.addEventListener("click", () => {
    const blob = new Blob([exportText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dpro-shop-system-check-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  });
  elements.resetManual.addEventListener("click", () => {
    document.querySelectorAll("[data-manual-check]").forEach((input) => { input.checked = false; });
  });

  elements.origin.textContent = window.location.origin;
})();
