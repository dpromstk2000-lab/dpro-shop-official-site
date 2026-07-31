(() => {
  "use strict";

  const filters = [...document.querySelectorAll("[data-system-filter]")];
  const cards = [...document.querySelectorAll("[data-system-category]")];
  const empty = document.querySelector("[data-system-empty]");
  const resultCount = document.querySelector("[data-system-result-count]");

  const updateCounts = () => {
    document.querySelectorAll("[data-filter-count]").forEach((node) => {
      const category = node.dataset.filterCount || "all";
      const count = category === "all"
        ? cards.length
        : cards.filter((card) => card.dataset.systemCategory === category).length;
      node.textContent = String(count);
    });
  };

  const applyFilter = (filter, updateUrl = true) => {
    let visible = 0;

    filters.forEach((button) => {
      const active = button.dataset.systemFilter === filter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    cards.forEach((card) => {
      const show = filter === "all" || card.dataset.systemCategory === filter;
      card.hidden = !show;
      if (show) visible += 1;
    });

    if (empty) empty.hidden = visible !== 0;
    if (resultCount) resultCount.textContent = `${visible}件を表示中`;

    if (updateUrl) {
      const url = new URL(window.location.href);
      if (filter === "all") url.searchParams.delete("category");
      else url.searchParams.set("category", filter);
      history.replaceState(null, "", url);
    }
  };

  updateCounts();

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      applyFilter(button.dataset.systemFilter || "all");
    });
  });

  const requested = new URLSearchParams(window.location.search).get("category");
  const initial = requested && filters.some((button) => button.dataset.systemFilter === requested)
    ? requested
    : "all";
  applyFilter(initial, false);

  const progress = document.querySelector(".sys-progress");
  const updateProgress = () => {
    if (!progress) return;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
  };
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  const localLinks = [...document.querySelectorAll(".product-local-nav a[href^='#']")];
  const localSections = localLinks
    .map((link) => {
      const id = link.getAttribute("href")?.slice(1);
      return id ? { link, section: document.getElementById(id) } : null;
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
      { rootMargin: "-25% 0px -62% 0px", threshold: [0, 0.05, 0.2] }
    );
    localSections.forEach(({ section }) => activeObserver.observe(section));
  }

  document.addEventListener("click", (event) => {
    const systemCard = event.target.closest(".sys-product-card");
    if (systemCard && typeof window.gtag === "function") {
      window.gtag("event", "select_content", {
        content_type: "dpro_official_system",
        item_id: systemCard.getAttribute("href") || "unknown",
        page_location: window.location.href
      });
    }

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
