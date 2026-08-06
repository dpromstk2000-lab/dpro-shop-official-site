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

  document.querySelectorAll('[data-or-bridge-stage]').forEach(stage => {
    const update = (event) => {
      const rect = stage.getBoundingClientRect();
      stage.style.setProperty('--mx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
      stage.style.setProperty('--my', `${((event.clientY - rect.top) / rect.height) * 100}%`);
    };
    stage.addEventListener('pointermove', update, { passive: true });
    stage.addEventListener('pointerleave', () => {
      stage.style.setProperty('--mx', '50%');
      stage.style.setProperty('--my', '50%');
    });
  });

})();

(() => {
  'use strict';
  if (window.__DPRO_SHUKYAKU_TRACKER__) return;
  window.__DPRO_SHUKYAKU_TRACKER__ = true;

  const API = 'https://dpro-shukyaku-api.dpromstk2000.workers.dev/api/public/conversion';
  const EVENT_NAMES = new Set(['line_consult_click', 'phone_click', 'inquiry_submit', 'demo_view']);
  const safeStorage = (storage, key, factory) => {
    try {
      let value = storage.getItem(key);
      if (!value) { value = factory(); storage.setItem(key, value); }
      return value;
    } catch { return factory(); }
  };
  const randomId = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const anonymousId = safeStorage(localStorage, 'dpro_shukyaku_anon_v1', randomId);
  const sessionKey = safeStorage(sessionStorage, 'dpro_shukyaku_session_v1', randomId);
  const params = new URLSearchParams(location.search);
  const attribution = (() => {
    const current = {
      source: params.get('utm_source') || '',
      medium: params.get('utm_medium') || '',
      campaign: params.get('utm_campaign') || '',
    };
    try {
      const saved = JSON.parse(sessionStorage.getItem('dpro_shukyaku_attribution_v1') || '{}');
      const merged = { source: current.source || saved.source || '', medium: current.medium || saved.medium || '', campaign: current.campaign || saved.campaign || '' };
      sessionStorage.setItem('dpro_shukyaku_attribution_v1', JSON.stringify(merged));
      return merged;
    } catch { return current; }
  })();

  const send = (eventName, detail = {}) => {
    if (!EVENT_NAMES.has(eventName)) return;
    const payload = {
      eventId: randomId(),
      eventName,
      anonymousId,
      sessionKey,
      pageUrl: location.href,
      referrerUrl: document.referrer || '',
      source: attribution.source,
      medium: attribution.medium,
      campaign: attribution.campaign,
      targetUrl: detail.targetUrl || '',
      linkText: detail.linkText || '',
      placement: detail.placement || '',
    };
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, {
        page_location: location.href,
        link_url: payload.targetUrl,
        link_text: payload.linkText,
        placement: payload.placement,
        transport_type: 'beacon',
      });
    }
    fetch(API, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  };

  const classifyLink = (anchor) => {
    const explicit = anchor.closest('[data-dpro-conversion]')?.getAttribute('data-dpro-conversion');
    if (EVENT_NAMES.has(explicit)) return explicit;
    const href = anchor.href || '';
    if (/^tel:/i.test(anchor.getAttribute('href') || '')) return 'phone_click';
    if (/https?:\/\/(lin\.ee|line\.me|liff\.line\.me)\//i.test(href)) return 'line_consult_click';
    if (/dpromstk2000-lab\.github\.io\/dpro-line-systems-site/i.test(href) || anchor.hasAttribute('data-dpro-demo')) return 'demo_view';
    return '';
  };

  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a,button,[data-dpro-conversion]');
    if (!anchor) return;
    const eventName = classifyLink(anchor);
    if (!eventName) return;
    send(eventName, {
      targetUrl: anchor.href || anchor.getAttribute('data-target-url') || '',
      linkText: (anchor.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 180),
      placement: anchor.getAttribute('data-dpro-placement') || anchor.closest('header,footer,main,nav,section')?.tagName.toLowerCase() || '',
    });
  }, true);

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('form[data-dpro-inquiry-form]');
    if (!form) return;
    send('inquiry_submit', { placement: form.id || form.getAttribute('name') || 'form' });
  }, true);

  window.DPRO_SHUKYAKU_TRACK = send;
})();
