(() => {
  'use strict';
  const menu = document.querySelector('.or-menu');
  const nav = document.querySelector('.or-nav');
  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') === 'true';
      menu.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('is-open', !open);
      document.body.classList.toggle('or-menu-open', !open);
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.classList.remove('or-menu-open');
    }));
  }
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' }) : null;
  document.querySelectorAll('.or-reveal').forEach(el => io ? io.observe(el) : el.classList.add('is-visible'));
  document.querySelectorAll('[data-sync-demo]').forEach(demo => {
    const button = demo.querySelector('[data-sync-publish]');
    if (!button) return;
    button.addEventListener('click', () => {
      button.disabled = true;
      button.textContent = '公開しています…';
      window.setTimeout(() => {
        const status = demo.querySelector('[data-sync-status]');
        const title = demo.querySelector('[data-sync-title]');
        const body = demo.querySelector('[data-sync-body]');
        if (status) status.textContent = '最新の店舗情報';
        if (title) title.textContent = '夏季休業のお知らせ';
        if (body) body.textContent = '8月13日～15日は休業いたします。';
        demo.classList.add('is-published');
        button.textContent = 'ホームページへ反映済み';
      }, 650);
    });
  });
})();
