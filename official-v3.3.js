(() => {
  const cfg = window.DPRO_SITE_CONFIG || {};
  document.querySelectorAll('[data-product-count]').forEach(el => { el.textContent = cfg.productCount || 50; });
  document.querySelectorAll('[data-product-site]').forEach(el => { if (cfg.urls?.productSite) el.href = cfg.urls.productSite; });
  document.querySelectorAll('[data-line-consult]').forEach(el => { if (cfg.urls?.lineConsult) el.href = cfg.urls.lineConsult; });

  const menu = document.querySelector('.v33-menu');
  const nav = document.querySelector('.v33-nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menu.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('is-open'); menu.setAttribute('aria-expanded','false');
    }));
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.v33-reveal');
  if (!reduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }), {threshold:.12});
    reveals.forEach(el => io.observe(el));
  } else reveals.forEach(el => el.classList.add('is-visible'));

  const states = [
    'LINE予約をDPROへ受信',
    'WEB予約をDPROへ受信',
    'LINE・WEBの予約情報をDPROで一元管理',
    '店舗PC / iPadへ共有し、LINEフォローへ'
  ];
  document.querySelectorAll('[data-v33-flow]').forEach(flow => {
    const status = flow.querySelector('[data-v33-status]');
    let stage = 0;
    const apply = () => { flow.dataset.stage = String(stage); if (status) status.textContent = states[stage]; };
    apply();
    if (!reduced) setInterval(() => { stage = (stage + 1) % states.length; apply(); }, 3200);
  });

  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
