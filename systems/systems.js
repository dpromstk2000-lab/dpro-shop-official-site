/* DPRO SHOP OFFICIAL / SYSTEM HUB PRODUCT 52 ADDON
 * Preserves the complete 51-product hub runtime at 4e1685f6a859f424a2326656152faee1b1e55984
 * and adds DPRO 訪問マッサージ・鍼灸 as product #52.
 */
(() => {
  "use strict";
  const CORE = "https://cdn.jsdelivr.net/gh/dpromstk2000-lab/dpro-shop-official-site@4e1685f6a859f424a2326656152faee1b1e55984/systems/systems.js";

  function patch52() {
    const grid = document.querySelector(".sys33-grid");
    if (grid && !grid.querySelector('[data-dpro-visit-ahaki-card="1"]')) {
      const card = document.createElement("a");
      card.className = "sys33-card";
      card.dataset.systemCategory = "medical";
      card.dataset.dproVisitAhakiCard = "1";
      card.href = "visit-ahaki";
      card.innerHTML = '<span class="sys33-card__cat">医療・ペット</span><h3>訪問マッサージ・鍼灸</h3><p>問い合わせ・患者・訪問予定・施術者割当・施術記録・家族連絡・継続管理</p><span class="sys33-card__more">公式説明を見る <b>→</b></span>';
      const osteo = grid.querySelector('a[href="osteopathic"]');
      osteo ? osteo.insertAdjacentElement("afterend", card) : grid.appendChild(card);
    }

    const replacements = [
      ["51システムから探す", "52システムから探す"],
      ["51製品・PC・スマホ・iPad・デモ操作", "52製品・PC・スマホ・iPad・デモ操作"],
      ["51 OFFICIAL GUIDES", "52 OFFICIAL GUIDES"],
      ["51の業種別システム", "52の業種別システム"],
      ["51の完成DPROシステム", "52の完成DPROシステム"],
      ["51の業種別DPROシステム", "52の業種別DPROシステム"],
      ["51システム説明", "52システム説明"],
      ["51製品を実際に触る", "52製品を実際に触る"],
      ["PRODUCT SITE / 51製品", "PRODUCT SITE / 52製品"]
    ];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      let value = node.nodeValue || "";
      replacements.forEach(([a,b]) => { value = value.split(a).join(b); });
      if (value !== node.nodeValue) node.nodeValue = value;
    });

    document.querySelectorAll('[data-filter-count="all"]').forEach(n => n.textContent = "52");
    document.querySelectorAll('[data-filter-count="medical"]').forEach(n => n.textContent = "6");
    document.querySelectorAll('[data-system-result-count]').forEach(n => n.textContent = "52件を表示中");
    document.querySelectorAll('.sys33-product-bridge b').forEach(n => {
      if (["50","51"].includes((n.textContent || "").trim())) n.textContent = "52";
    });

    document.title = String(document.title || "").replaceAll("51システム", "52システム");
    document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]').forEach(meta => {
      meta.content = String(meta.content || "")
        .replaceAll("51業種別", "52業種別")
        .replaceAll("51システム", "52システム")
        .replaceAll("51の完成", "52の完成");
    });

    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const data = JSON.parse(script.textContent || "{}");
        const visit = node => {
          if (!node || typeof node !== "object") return;
          if (node["@type"] === "ItemList" && Array.isArray(node.itemListElement)) {
            const url = "https://dpro-shop.com/systems/visit-ahaki";
            if (!node.itemListElement.some(x => x && x.url === url)) {
              node.itemListElement.push({"@type":"ListItem","position":52,"url":url,"name":"DPRO 訪問マッサージ・鍼灸"});
            }
            node.numberOfItems = 52;
          }
          Object.values(node).forEach(v => {
            if (Array.isArray(v)) v.forEach(visit);
            else if (v && typeof v === "object") visit(v);
          });
        };
        visit(data);
        script.textContent = JSON.stringify(data);
      } catch (_) {}
    });
  }

  function observeAndPatch() {
    patch52();
    const observer = new MutationObserver(patch52);
    observer.observe(document.documentElement, {subtree:true,childList:true});
    setTimeout(() => { patch52(); observer.disconnect(); }, 5000);
  }

  const s = document.createElement("script");
  s.src = CORE;
  s.async = false;
  s.onload = observeAndPatch;
  s.onerror = observeAndPatch;
  document.head.appendChild(s);
})();
