/* DPRO SHOP OFFICIAL / DPRO MEDICAL HUB ADDON V1.2
 * Loads the current stable systems runtime from commit 8dea80228bbd7b0a2863605f0bb8425e1203f453.
 * On the systems hub only, injects DPRO MEDICAL BEFORE the stable runtime scans cards,
 * so existing category filters and counts natively include the 51st system.
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

  prepareMedicalHub();

  const script = document.createElement("script");
  script.src = CORE;
  script.async = false;
  script.dataset.dproOfficialSystemsCore = "pinned";
  script.onerror = () => console.error("DPRO OFFICIAL systems core could not be loaded.");
  (document.head || document.documentElement).appendChild(script);
})();
