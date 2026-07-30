(() => {
  "use strict";

  const injectHomeNursingCard = () => {
    if (!document.body.classList.contains("systems-hub-page")) return;
    const grid = document.querySelector(".sys-catalog-grid");
    if (!grid || grid.querySelector('a[href="home-nursing"]')) return;

    const card = document.createElement("a");
    card.className = "sys-product-card is-home-nursing";
    card.href = "home-nursing";
    card.dataset.systemCategory = "welfare-care";
    card.innerHTML = `
      <div class="sys-product-visual">
        <span class="sys-product-status">公式紹介ページ公開中</span>
        <div class="sys-product-monitor"><div class="sys-product-monitor-grid">
          <span>本日の訪問<br>4件</span><span>訪問中<br>1件</span><span>家族連絡<br>1件</span>
          <span>訪問予定・配置</span><span>家族報告承認</span><span>管理者iPad</span>
        </div></div>
        <div class="sys-product-phone"><div class="sys-product-phone-inner">
          <b>本人・家族LINE</b><span>次回訪問予定</span><span>完了報告</span><span>変更・相談</span>
        </div></div>
      </div>
      <div class="sys-product-card-copy">
        <small>HOME NURSING &amp; FAMILY</small>
        <h3>DPRO 訪問看護ステーション LINE<br>訪問看護・家族連携</h3>
        <p>LINE相談、本人・家族連携、訪問予定・スタッフ配置、訪問開始・終了、家族報告、非緊急連絡、管理PC・iPadまでを一つにつなぎます。</p>
        <span class="sys-product-card-link">詳しい機能と実画面を見る <b>→</b></span>
      </div>`;

    const dayservice = grid.querySelector('a[href="dayservice"]');
    const emptyState = grid.querySelector("[data-system-empty]");
    if (dayservice) {
      dayservice.insertAdjacentElement("afterend", card);
    } else if (emptyState) {
      grid.insertBefore(card, emptyState);
    } else {
      grid.append(card);
    }

    const jsonLdScripts = [
      ...document.querySelectorAll('script[type="application/ld+json"]')
    ];
    jsonLdScripts.forEach((script) => {
      try {
        const data = JSON.parse(script.textContent || "{}");
        const graph = Array.isArray(data?.["@graph"]) ? data["@graph"] : [];
        const list = graph.find(
          (item) => item?.["@type"] === "ItemList" &&
            item?.["@id"] === "https://dpro-shop.com/systems/#list"
        );
        if (!list || !Array.isArray(list.itemListElement)) return;
        if (
          list.itemListElement.some(
            (item) => item?.url === "https://dpro-shop.com/systems/home-nursing"
          )
        ) return;

        list.itemListElement.forEach((item) => {
          if (Number(item.position) >= 8) item.position += 1;
        });
        list.itemListElement.push({
          "@type": "ListItem",
          position: 8,
          url: "https://dpro-shop.com/systems/home-nursing",
          name: "DPRO 訪問看護ステーション LINE"
        });
        list.itemListElement.sort(
          (a, b) => Number(a.position) - Number(b.position)
        );
        list.numberOfItems = list.itemListElement.length;
        script.textContent = JSON.stringify(data);
      } catch (_error) {
        // 構造化データの解析失敗は、画面のカード表示を妨げない。
      }
    });
  };

  injectHomeNursingCard();

  const filters = [...document.querySelectorAll("[data-system-filter]")];
  const cards = [...document.querySelectorAll("[data-system-category]")];
  const empty = document.querySelector("[data-system-empty]");

  const applyFilter = (filter) => {
    let visible = 0;
    filters.forEach((button) => {
      const active = button.dataset.systemFilter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    cards.forEach((card) => {
      const show =
        filter === "all" ||
        card.dataset.systemCategory === filter;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (empty) empty.hidden = visible !== 0;

    const url = new URL(window.location.href);
    if (filter === "all") {
      url.searchParams.delete("category");
    } else {
      url.searchParams.set("category", filter);
    }
    history.replaceState(null, "", url);
  };

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.systemFilter || "all");
    });
  });

  const requested = new URLSearchParams(window.location.search).get("category");
  if (
    requested &&
    filters.some((button) => button.dataset.systemFilter === requested)
  ) {
    applyFilter(requested);
  }

  const progress = document.querySelector(".sys-progress");
  const updateProgress = () => {
    if (!progress) return;
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  const localLinks = [
    ...document.querySelectorAll(".product-local-nav a[href^='#']")
  ];
  const localSections = localLinks
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      return id
        ? { link, section: document.getElementById(id) }
        : null;
    })
    .filter((item) => item?.section);

  if (localSections.length && "IntersectionObserver" in window) {
    const activeObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        localSections.forEach(({ link, section }) => {
          link.classList.toggle("is-active", section === visible.target);
        });
      },
      {
        rootMargin: "-25% 0px -62% 0px",
        threshold: [0, 0.05, 0.2]
      }
    );
    localSections.forEach(({ section }) => activeObserver.observe(section));
  }

  document.addEventListener("click", (event) => {
    const demoLink = event.target.closest("[data-demo-link]");
    if (!demoLink || typeof window.gtag !== "function") return;
    window.gtag("event", "select_content", {
      content_type: "dpro_external_demo",
      item_id: demoLink.dataset.demoLink || "unknown",
      link_url: demoLink.href,
      page_location: window.location.href
    });
  });
})();