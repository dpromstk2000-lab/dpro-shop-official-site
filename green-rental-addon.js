(() => {
  "use strict";

  const PRODUCT_COUNT = 49;
  const GREEN_CATEGORY = "lodging-life";
  const GREEN_HREF = "green-rental.html";

  const ready = (callback) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
    } else {
      callback();
    }
  };

  const replaceVisibleCounts = () => {
    const patterns = [
      [/48(?=\s*(?:業種|システム|製品|件|OFFICIAL|SYSTEMS|個別ページ))/g, String(PRODUCT_COUNT)],
      [/47(?=\s*システムを見る)/g, String(PRODUCT_COUNT)]
    ];

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      let value = node.nodeValue || "";
      patterns.forEach(([pattern, replacement]) => {
        value = value.replace(pattern, replacement);
      });
      node.nodeValue = value;
    });

    document.querySelectorAll(
      'meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]'
    ).forEach((meta) => {
      meta.content = meta.content
        .replace(/48/g, String(PRODUCT_COUNT))
        .replace(/47システム/g, `${PRODUCT_COUNT}システム`);
    });

    document.title = document.title
      .replace(/48/g, String(PRODUCT_COUNT))
      .replace(/47システム/g, `${PRODUCT_COUNT}システム`);
  };

  const createGreenCard = () => {
    const grid = document.querySelector(".sys-catalog-grid");
    if (!grid) return null;

    const existing = grid.querySelector(
      'a[href="green-rental"],a[href="green-rental.html"],a[href="./green-rental"],a[href="./green-rental.html"]'
    );
    if (existing) return existing;

    const card = document.createElement("a");
    card.className = "sys-product-card is-green-rental reveal is-visible";
    card.dataset.systemCategory = GREEN_CATEGORY;
    card.href = GREEN_HREF;
    card.innerHTML = `
      <div class="sys-product-visual">
        <span class="sys-product-status">公式紹介ページ公開中</span>
        <div class="sys-product-monitor">
          <div class="sys-product-monitor-grid">
            <span>写真相談</span>
            <span>植物台帳</span>
            <span>定期巡回</span>
            <span>作業写真</span>
            <span>交換提案</span>
            <span>養生・再利用</span>
          </div>
        </div>
        <div class="sys-product-phone">
          <div class="sys-product-phone-inner">
            <b>グリーンレンタル</b>
            <span>LINE・スマホ</span>
            <span>PC・iPad</span>
            <span>実画面デモ</span>
          </div>
        </div>
      </div>
      <div class="sys-product-card-copy">
        <small>GREEN RENTAL &amp; MAINTENANCE</small>
        <h3>DPRO グリーンレンタル LINE<br>観葉植物レンタル</h3>
        <p>写真相談、顧客・拠点、植物・鉢、設置、定期巡回、作業写真、交換、回収・養生・再利用、お客様報告をつなぎます。</p>
        <span class="sys-product-card-link">詳しい機能と実画面を見る <b>→</b></span>
      </div>
    `;

    const empty = grid.querySelector("[data-system-empty]");
    if (empty) {
      grid.insertBefore(card, empty);
    } else {
      grid.appendChild(card);
    }
    return card;
  };

  const applyFilter = (filter) => {
    const cards = [...document.querySelectorAll(".sys-product-card[data-system-category]")];
    if (!cards.length) return;

    let visible = 0;
    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.systemCategory === filter;
      card.hidden = !show;
      card.classList.toggle("is-hidden", !show);
      if (show) visible += 1;
    });

    const empty = document.querySelector("[data-system-empty]");
    if (empty) empty.hidden = visible !== 0;

    const result = document.querySelector("[data-system-result-count]");
    if (result) result.textContent = `${visible}件を表示中`;

    document.querySelectorAll("[data-filter-count]").forEach((node) => {
      const category = node.dataset.filterCount || "all";
      node.textContent = String(
        category === "all"
          ? cards.length
          : cards.filter((card) => card.dataset.systemCategory === category).length
      );
    });
  };

  const bindFilters = () => {
    const buttons = [...document.querySelectorAll("[data-system-filter]")];
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        window.setTimeout(() => {
          applyFilter(button.dataset.systemFilter || "all");
        }, 0);
      });
    });

    const requested = new URLSearchParams(window.location.search).get("category");
    const initial =
      requested && buttons.some((button) => button.dataset.systemFilter === requested)
        ? requested
        : "all";

    applyFilter(initial);
  };

  const updateHomeCount = () => {
    const metric = document.querySelector(".hero-metrics > div:first-child strong");
    if (metric) metric.textContent = String(PRODUCT_COUNT);
  };

  ready(() => {
    replaceVisibleCounts();
    updateHomeCount();
    createGreenCard();
    bindFilters();
  });
})();
