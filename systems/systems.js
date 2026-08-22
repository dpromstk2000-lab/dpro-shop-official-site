/* DPRO SHOP OFFICIAL / DPRO MEDICAL HUB ADDON V1.2
 * Loads the current stable systems runtime from commit 8dea80228bbd7b0a2863605f0bb8425e1203f453.
 * On the systems hub only, injects DPRO MEDICAL BEFORE the stable runtime scans cards,
 * so existing category filters and counts natively include the 51st system.
 *
 * DPRO TUTORIAL BAKERY R6 additive bridge:
 * On the official bakery product page only, injects post-contract tutorial/manual links.
 */
(() => {
  "use strict";

  const CORE = "https://cdn.jsdelivr.net/gh/dpromstk2000-lab/dpro-shop-official-site@8dea80228bbd7b0a2863605f0bb8425e1203f453/systems/systems.js";

  function replaceText(root, from, to) {
    if (!root || !from) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if ((node.nodeValue || "").includes(from)) node.nodeValue = node.nodeValue.split(from).join(to);
    });
  }

  function patchStructuredData() {
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const data = JSON.parse(script.textContent || "");
        const visit = node => {
          if (!node || typeof node !== "object") return;
          if (node["@type"] === "ItemList" && Array.isArray(node.itemListElement)) {
            const exists = node.itemListElement.some(x => x && x.url === "https://dpro-shop.com/systems/medical");
            if (!exists) {
              node.itemListElement.push({
                "@type": "ListItem",
                "position": 51,
                "url": "https://dpro-shop.com/systems/medical",
                "name": "DPRO MEDICAL"
              });
            }
            node.numberOfItems = 51;
          }
          Object.values(node).forEach(value => {
            if (Array.isArray(value)) value.forEach(visit);
            else if (value && typeof value === "object") visit(value);
          });
        };
        visit(data);
        script.textContent = JSON.stringify(data);
      } catch (_) {}
    });
  }

  function prepareMedicalHub() {
    if (!document.body || !document.body.classList.contains("systems-hub-page")) return;

    const grid = document.querySelector(".sys33-grid");
    if (grid && !grid.querySelector('[data-dpro-medical-card="1"]')) {
      const card = document.createElement("a");
      card.className = "sys33-card";
      card.dataset.systemCategory = "medical";
      card.dataset.dproMedicalCard = "1";
      card.href = "medical";
      card.innerHTML =
        '<span class="sys33-card__cat">医療・ペット</span>' +
        '<h3>DPRO MEDICAL</h3>' +
        '<p>予約・WEB問診・受付・院内進行・医院管理・医院HP・6診療PRESET</p>' +
        '<span class="sys33-card__more">公式説明を見る <b>→</b></span>';

      const first = grid.firstElementChild;
      if (first) grid.insertBefore(card, first);
      else grid.appendChild(card);
    }

    [
      ["50システムから探す", "51システムから探す"],
      ["50製品・PC・スマホ・iPad・デモ操作", "51製品・PC・スマホ・iPad・デモ操作"],
      ["50 OFFICIAL GUIDES", "51 OFFICIAL GUIDES"],
      ["50の業種別システム", "51の業種別システム"],
      ["50の完成DPROシステム", "51の完成DPROシステム"],
      ["50の業種別DPROシステム", "51の業種別DPROシステム"],
      ["50システム説明", "51システム説明"],
      ["50製品を実際に触る", "51製品を実際に触る"],
      ["PRODUCT SITE / 50製品", "PRODUCT SITE / 51製品"]
    ].forEach(([from,to]) => replaceText(document.body, from, to));

    document.querySelectorAll('[data-filter-count="all"]').forEach(n => n.textContent = "51");
    document.querySelectorAll('[data-filter-count="medical"]').forEach(n => n.textContent = "5");
    document.querySelectorAll("[data-system-result-count]").forEach(n => n.textContent = "51件を表示中");

    document.querySelectorAll(".sys33-product-bridge b").forEach(n => {
      if ((n.textContent || "").trim() === "50") n.textContent = "51";
    });

    document.title = document.title.replaceAll("50システム", "51システム");
    document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]').forEach(meta => {
      meta.content = String(meta.content || "")
        .replaceAll("50業種別", "51業種別")
        .replaceAll("50システム", "51システム")
        .replaceAll("50の完成", "51の完成");
    });

    patchStructuredData();
  }

  function injectBakeryTutorial() {
    if (!document.body || !document.body.classList.contains("official-product-page")) return;
    const path = location.pathname.replace(/\/+$/, "");
    if (!/(?:\/systems\/bakery|\/systems\/bakery\.html)$/.test(path)) return;
    if (document.getElementById("dproBakeryTutorialR6")) return;

    const quickPdf = "https://dpromstk2000-lab.github.io/bakery-line-system/DPRO_BAKERY_QUICK_START_A4.pdf";
    const detailedPdf = "https://dpromstk2000-lab.github.io/bakery-line-system/DPRO_BAKERY_DETAILED_MANUAL_A4.pdf";
    const guideUrl = "https://dpromstk2000-lab.github.io/bakery-line-system/guide.html";
    const first10Url = "https://dpromstk2000-lab.github.io/bakery-line-system/owner.html?tutorial=replay";

    if (!document.getElementById("dproBakeryTutorialR6Styles")) {
      const style = document.createElement("style");
      style.id = "dproBakeryTutorialR6Styles";
      style.textContent = `
        #dproBakeryTutorialR6{position:relative;overflow:hidden;background:linear-gradient(145deg,#fff8ed,#fff);color:#29211b}
        #dproBakeryTutorialR6 .dpro-r6-inner{width:min(1180px,calc(100% - 32px));margin:auto;padding:76px 0}
        #dproBakeryTutorialR6 .dpro-r6-head{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(260px,.75fr);gap:34px;align-items:end}
        #dproBakeryTutorialR6 .dpro-r6-kicker{margin:0 0 10px;color:#9a4e16;font-size:12px;font-weight:900;letter-spacing:.12em}
        #dproBakeryTutorialR6 h2{margin:0;color:#2d211a;font-size:clamp(30px,5vw,54px);line-height:1.16;letter-spacing:-.045em}
        #dproBakeryTutorialR6 h2 em{color:#9a4e16;font-style:normal}
        #dproBakeryTutorialR6 .dpro-r6-lead{margin:0;color:#65574d;font-size:15px;line-height:1.9;font-weight:700}
        #dproBakeryTutorialR6 .dpro-r6-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:28px}
        #dproBakeryTutorialR6 .dpro-r6-card{min-width:0;display:flex;flex-direction:column;padding:21px;border:1px solid #ead8c3;border-radius:22px;background:#fff;box-shadow:0 14px 38px rgba(72,42,22,.08)}
        #dproBakeryTutorialR6 .dpro-r6-card small{color:#9a4e16;font-size:11px;font-weight:950;letter-spacing:.08em}
        #dproBakeryTutorialR6 .dpro-r6-card h3{margin:7px 0 8px;font-size:21px;line-height:1.35;color:#2d211a}
        #dproBakeryTutorialR6 .dpro-r6-card p{flex:1;margin:0;color:#6b5c52;font-size:13px;line-height:1.75;font-weight:700}
        #dproBakeryTutorialR6 .dpro-r6-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
        #dproBakeryTutorialR6 .dpro-r6-button{min-height:43px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:10px 13px;text-decoration:none;font-size:12px;font-weight:950;transition:transform .18s ease,box-shadow .18s ease}
        #dproBakeryTutorialR6 .dpro-r6-button:hover{transform:translateY(-1px)}
        #dproBakeryTutorialR6 .dpro-r6-view{background:#3b2518;color:#fff}
        #dproBakeryTutorialR6 .dpro-r6-print{background:#fff3e1;color:#8a4416;border:1px solid #e6c49e}
        #dproBakeryTutorialR6 .dpro-r6-online{background:#16704b;color:#fff}
        #dproBakeryTutorialR6 .dpro-r6-note{margin-top:15px;padding:13px 15px;border-radius:15px;background:#fff4df;border:1px solid #eed1a7;color:#6d523d;font-size:12px;line-height:1.75;font-weight:750}
        #dproBakeryTutorialR6 a:focus-visible{outline:3px solid #2563eb;outline-offset:3px}
        @media(max-width:860px){#dproBakeryTutorialR6 .dpro-r6-head{grid-template-columns:1fr}#dproBakeryTutorialR6 .dpro-r6-grid{grid-template-columns:1fr 1fr}#dproBakeryTutorialR6 .dpro-r6-grid .dpro-r6-card:last-child{grid-column:1/-1}}
        @media(max-width:560px){#dproBakeryTutorialR6 .dpro-r6-inner{width:min(100% - 18px,1180px);padding:54px 0}#dproBakeryTutorialR6 .dpro-r6-grid{grid-template-columns:1fr}#dproBakeryTutorialR6 .dpro-r6-grid .dpro-r6-card:last-child{grid-column:auto}#dproBakeryTutorialR6 .dpro-r6-actions{display:grid;grid-template-columns:1fr}#dproBakeryTutorialR6 .dpro-r6-button{width:100%}}
      `;
      document.head.appendChild(style);
    }

    const section = document.createElement("section");
    section.id = "dproBakeryTutorialR6";
    section.setAttribute("aria-labelledby", "dproBakeryTutorialR6Title");
    section.innerHTML = `
      <div class="dpro-r6-inner">
        <div class="dpro-r6-head">
          <div>
            <p class="dpro-r6-kicker">AFTER CONTRACT / TUTORIAL &amp; PRINT SUPPORT</p>
            <h2 id="dproBakeryTutorialR6Title">契約後も、<em>説明なしで始めやすい。</em></h2>
          </div>
          <p class="dpro-r6-lead">画面内の「最初の10分」、いつでも検索できる操作ガイド、印刷して渡せる2種類のPDFを用意しています。PCでも紙でも確認できます。</p>
        </div>
        <div class="dpro-r6-grid">
          <article class="dpro-r6-card">
            <small>01 / FIRST 10 + QUICK START</small>
            <h3>最初の10分から始める</h3>
            <p>オーナーが最初に確認する7章・15項目。画面内ガイドに加え、A4・5ページのクイックスタートを印刷できます。</p>
            <div class="dpro-r6-actions">
              <a class="dpro-r6-button dpro-r6-view" href="${quickPdf}" target="_blank" rel="noopener" data-dpro-r6="quick-view">PDFを見る</a>
              <a class="dpro-r6-button dpro-r6-print" href="${quickPdf}" target="_blank" rel="noopener" data-dpro-r6="quick-print" title="PDFを開き、ブラウザの印刷機能を使用します">印刷する</a>
              <a class="dpro-r6-button dpro-r6-online" href="${first10Url}" target="_blank" rel="noopener" data-dpro-r6="first10">画面ガイドを体験</a>
            </div>
          </article>
          <article class="dpro-r6-card">
            <small>02 / DETAILED MANUAL</small>
            <h3>詳しい操作も紙で確認</h3>
            <p>7カテゴリ・29記事・12FAQを収録したA4詳細マニュアル。店舗で保管し、必要な時に印刷して確認できます。</p>
            <div class="dpro-r6-actions">
              <a class="dpro-r6-button dpro-r6-view" href="${detailedPdf}" target="_blank" rel="noopener" data-dpro-r6="detail-view">PDFを見る</a>
              <a class="dpro-r6-button dpro-r6-print" href="${detailedPdf}" target="_blank" rel="noopener" data-dpro-r6="detail-print" title="PDFを開き、ブラウザの印刷機能を使用します">印刷する</a>
            </div>
          </article>
          <article class="dpro-r6-card">
            <small>03 / ONLINE GUIDE CENTER</small>
            <h3>分からない操作を検索</h3>
            <p>Guide Centerは検索・カテゴリ・FAQから確認でき、実際の機能画面へも移動できます。印刷物のQRからも同じガイドを開けます。</p>
            <div class="dpro-r6-actions">
              <a class="dpro-r6-button dpro-r6-online" href="${guideUrl}" target="_blank" rel="noopener" data-dpro-r6="guide">オンライン操作ガイド</a>
            </div>
          </article>
        </div>
        <p class="dpro-r6-note">印刷ボタンはPDFを新しいタブで開きます。開いたPDFの印刷ボタン、または Ctrl+P / Command+P で印刷できます。チュートリアルは保存・更新・送信・決済などの業務操作を自動実行しません。</p>
      </div>
    `;

    const pricing = document.getElementById("pricing");
    const main = document.getElementById("main") || document.querySelector("main");
    if (pricing && pricing.parentNode) pricing.parentNode.insertBefore(section, pricing);
    else if (main) main.appendChild(section);
  }

  prepareMedicalHub();
  injectBakeryTutorial();

  const script = document.createElement("script");
  script.src = CORE;
  script.async = false;
  script.dataset.dproOfficialSystemsCore = "pinned";
  script.onerror = () => console.error("DPRO OFFICIAL systems core could not be loaded.");
  (document.head || document.documentElement).appendChild(script);
})();
