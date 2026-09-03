/* DPRO SHOP OFFICIAL / PRODUCT 52 ADDON
 * Product #52: DPRO 訪問マッサージ・鍼灸
 * Preserve the OFFICIAL SITE runtime locked at 4e1685f6a859f424a2326656152faee1b1e55984.
 */
(() => {
  "use strict";
  const CORE = "https://cdn.jsdelivr.net/gh/dpromstk2000-lab/dpro-shop-official-site@4e1685f6a859f424a2326656152faee1b1e55984/site-config.js";

  function patch52() {
    const old = window.DPRO_SITE_CONFIG || {};
    try { window.DPRO_SITE_CONFIG = Object.freeze({ ...old, productCount: 52 }); } catch (_) {}
    document.querySelectorAll("[data-product-count]").forEach(el => { el.textContent = "52"; });

    const replacements = [
      ["51の業種別システム", "52の業種別システム"],
      ["51の完成DPROシステム", "52の完成DPROシステム"],
      ["51の完成システム", "52の完成システム"],
      ["51製品", "52製品"],
      ["51システム", "52システム"]
    ];
    const applyText = root => {
      if (!root) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(node => {
        let value = node.nodeValue || "";
        replacements.forEach(([a,b]) => { value = value.split(a).join(b); });
        if (value !== node.nodeValue) node.nodeValue = value;
      });
    };
    applyText(document.body);
    let title = document.title || "";
    replacements.forEach(([a,b]) => { title = title.split(a).join(b); });
    document.title = title;
    document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"]').forEach(meta => {
      let value = meta.content || "";
      replacements.forEach(([a,b]) => { value = value.split(a).join(b); });
      meta.content = value;
    });
    document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const data = JSON.parse(script.textContent || "{}");
        const visit = node => {
          if (!node || typeof node !== "object") return;
          Object.keys(node).forEach(key => {
            const value = node[key];
            if (typeof value === "string") {
              let v = value;
              replacements.forEach(([a,b]) => { v = v.split(a).join(b); });
              node[key] = v;
            } else if (Array.isArray(value)) value.forEach(visit);
            else if (value && typeof value === "object") visit(value);
          });
        };
        visit(data);
        script.textContent = JSON.stringify(data);
      } catch (_) {}
    });
  }

  window.__DPRO_OFFICIAL_52_BOOT__ = () => {
    patch52();
    const rerun = () => { patch52(); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", rerun, { once:true });
    setTimeout(rerun, 0); setTimeout(rerun, 400); setTimeout(rerun, 1200);
  };

  if (document.readyState === "loading") {
    document.write('<script src="' + CORE + '"><\\/script><script>window.__DPRO_OFFICIAL_52_BOOT__();<\\/script>');
  } else {
    const s = document.createElement("script");
    s.src = CORE;
    s.onload = () => window.__DPRO_OFFICIAL_52_BOOT__();
    s.onerror = () => window.__DPRO_OFFICIAL_52_BOOT__();
    document.head.appendChild(s);
  }
})();
