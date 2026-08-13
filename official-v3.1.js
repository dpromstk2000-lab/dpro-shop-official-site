/* DPRO SHOP OFFICIAL TOP V3.1 */
(() => {
  'use strict';
  const cfg = window.DPRO_SITE_CONFIG || {};
  const count = Number(cfg.productCount || 50);
  document.querySelectorAll('[data-product-count]').forEach((el) => { el.textContent = String(count); });
  document.querySelectorAll('[data-line-consult]').forEach((el) => { if (cfg.urls?.lineConsult) el.href = cfg.urls.lineConsult; });
  document.querySelectorAll('[data-product-site]').forEach((el) => { if (cfg.urls?.productSite) el.href = cfg.urls.productSite; });
  document.querySelectorAll('[data-product-catalog]').forEach((el) => { if (cfg.urls?.productCatalog) el.href = cfg.urls.productCatalog; });
  document.querySelectorAll('[data-price]').forEach((el) => {
    const key = el.dataset.price;
    const value = cfg.prices?.[key];
    if (Number.isFinite(value)) el.textContent = Number(value).toLocaleString('ja-JP');
  });

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (!reduced && 'IntersectionObserver' in window) {
    const steps = [...document.querySelectorAll('.v31-step')];
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = steps.indexOf(entry.target);
        entry.target.style.setProperty('--step-delay', `${Math.max(index,0) * 90}ms`);
        entry.target.classList.add('v31-step--active');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    steps.forEach((step) => io.observe(step));
  }
})();
