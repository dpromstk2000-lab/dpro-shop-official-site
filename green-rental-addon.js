(() => {
  "use strict";

  const PRODUCT_COUNT = 49;
  const GREEN_CATEGORY = "lodging-life";

  const replaceCount = (node) => {
    if (!node) return;
    node.textContent = node.textContent
      .replace(/48(?=\s*(?:業種|システム|製品|件|OFFICIAL|SYSTEMS))/g, String(PRODUCT_COUNT))
      .replace(/47(?=\s*システムを見る)/g, String(PRODUCT_COUNT));
  };

  const updateMeta = () => {
    document.querySelectorAll('meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[name="twitter:title"],meta[name="twitter:description"]').forEach((meta) => {
      meta.content = meta.content.replace(/48/g, String(PRODUCT_COUNT));
    });
    document.title = document.title.replace(/48/g, String(PRODUCT_COUNT));
  };

  const updateHome = () => {
    const metric = document.querySelector(".hero-metrics > div:first-child strong");
    if (metric) metric.textContent = String(PRODUCT_COUNT);
    document.querySelectorAll(".hero-metrics,.proof-strip,.systems-preview,.site-footer").forEach(replaceCount);
  };

  const createGreenCard = () => {
    const grid = document.querySelector(".sys-catalog-grid");
    if (!grid || grid.querySelector('a[href="green-rental"]')) return null;

    const card = document.createElement("a");
    card.className = "sys-product-card is-green-rental reveal visible";
    card.dataset.systemCategory = GREEN_CATEGORY;
    card.href = "green-rental";
    card.innerHTML = `
      <div class="sys-product-visual">
        <span class="sys-product-status">公式紹介ページ公開中</span>
        <div class="sys-product-monitor"><div class="sys-product-monitor-grid">
          <span>写真相談</span><span>植物台帳</span><span>定期巡回</span>
          <span>作業写真</span><span>交換提案</span><span>養生・再利用</span>
        </div></div>
        <div class="sys-product-phone"><div class="sys-product-phone-inner">
          <b>グリーンレンタル</b><span>LINE・スマホ</span><span>PC・iPad</span><span>実画面デモ</span>
        </div></div>
      </div>
      <div class="sys-product-card-copy">
        <small>GREEN RENTAL &amp; MAINTENANCE</small>
        <h3>DPRO グリーンレンタル LINE<br>観葉植物レンタル</h3>
        <p>写真相談、顧客・拠点、植物・鉢、設置、定期巡回、作業写真、交換、回収・養生・再利用、お客様報告をつなぎます。</p>
        <span class="sys-product-card-link">詳しい機能と実画面を見る <b>→</b></span>
      </div>`;
    grid.appendChild(card);
    return card;
  };

  const applyFilter = (filter) => {
    const cards = [...document.querySelectorAll("[data-system-category]")];
    let visible = 0;
    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.systemCategory === filter;
      card.hidden = !show;
      if (show) visible += 1;
    });
    const empty = document.querySelector("[data-system-empty]");
    if (empty) empty.hidden = visible !== 0;
    const result = document.querySelector("[data-system-result-count]");
    if (result) result.textContent = `${visible}件を表示中`;
    document.querySelectorAll("[data-filter-count]").forEach((node) => {
      const category = node.dataset.filterCount || "all";
      node.textContent = String(category === "all"
        ? cards.length
        : cards.filter((card) => card.dataset.systemCategory === category).length);
    });
  };

  const updateHub = () => {
    const green = createGreenCard();
    document.querySelectorAll(".sys-hero,.sys-catalog-head,.sys-publish-note,.sys-final-cta,.mobile-cta").forEach(replaceCount);

    const heroEyebrow = document.querySelector(".sys-hero-copy > .eyebrow");
    if (heroEyebrow) heroEyebrow.textContent = `${PRODUCT_COUNT} INDUSTRY-SPECIFIC DPRO SYSTEMS`;
    const catalogEyebrow = document.querySelector(".sys-catalog-head .eyebrow");
    if (catalogEyebrow) catalogEyebrow.textContent = `${PRODUCT_COUNT} OFFICIAL SYSTEM PAGES`;
    const badge = document.querySelector(".sys-hero-actions .line-badge");
    if (badge) badge.textContent = String(PRODUCT_COUNT);
    const boardSmall = document.querySelector(".sys-board-brand small");
    if (boardSmall) boardSmall.textContent = `${PRODUCT_COUNT} OFFICIAL PAGES`;
    const floatCount = document.querySelector(".sys-float-a strong");
    if (floatCount) floatCount.textContent = `${PRODUCT_COUNT} SYSTEMS`;

    const buttons = [...document.querySelectorAll("[data-system-filter]")];
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        setTimeout(() => applyFilter(button.dataset.systemFilter || "all"), 0);
      });
    });

    const requested = new URLSearchParams(location.search).get("category");
    const initial = requested && buttons.some((button) => button.dataset.systemFilter === requested)
      ? requested
      : "all";
    applyFilter(initial);

    if (green && "IntersectionObserver" in window) green.classList.add("visible");
  };

  updateMeta();
  updateHome();
  updateHub();
})();