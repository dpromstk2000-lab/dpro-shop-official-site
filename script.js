/* DPRO SHOP OFFICIAL / REVEAL FAILSAFE R1 / 20260808
   Site-wide safety net: sections must never remain invisible when legacy CDN loading fails. */
(() => {
  "use strict";

  const installRevealFailsafe = () => {
    const reveals = [...document.querySelectorAll(".reveal")];
    if (!reveals.length) return;

    if (!("IntersectionObserver" in window)) {
      reveals.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.06, rootMargin: "0px 0px -20px 0px" });

    reveals.forEach((el) => observer.observe(el));

    // First-view safety: anything already in/near the viewport is shown immediately.
    requestAnimationFrame(() => {
      reveals.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 120 && rect.bottom > -120) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installRevealFailsafe, { once: true });
  } else {
    installRevealFailsafe();
  }
})();

(() => {
  "use strict";
  const legacySources = [
    "https://cdn.jsdelivr.net/gh/dpromstk2000-lab/dpro-shop-official-site@648871083f6b96bf0678441b683140d2edfc514b/script.js",
    "https://raw.githack.com/dpromstk2000-lab/dpro-shop-official-site/648871083f6b96bf0678441b683140d2edfc514b/script.js"
  ];
  const systemSite = "https://dpromstk2000-lab.github.io/dpro-line-systems-site/";
  const load = (src) => new Promise((resolve,reject) => {
    const s=document.createElement("script"); s.src=src; s.async=false;
    s.onload=resolve; s.onerror=()=>reject(new Error(`読み込み失敗: ${src}`)); document.head.appendChild(s);
  });
  const inject = () => {
    if (!document.getElementById("dpro-cross-site-style")) {
      const style=document.createElement("style"); style.id="dpro-cross-site-style";
      style.textContent=`.dpro-system-site-link{padding:9px 14px!important;border:1px solid rgba(168,255,42,.34)!important;border-radius:999px!important;color:#b6ff3b!important;background:rgba(168,255,42,.06)!important;font-weight:900!important;white-space:nowrap}.dpro-system-site-link:hover{background:rgba(168,255,42,.14)!important}@media(max-width:960px){.dpro-system-site-link{display:block!important;margin-top:8px!important;text-align:center!important;border-radius:12px!important}}`;
      document.head.appendChild(style);
    }
    const nav=document.querySelector(".global-nav,.or-nav");
    if(nav && !nav.querySelector("[data-system-site-link]")){
      const a=document.createElement("a"); a.href=systemSite; a.target="_blank"; a.rel="noopener"; a.className="dpro-system-site-link"; a.dataset.systemSiteLink=""; a.textContent="実画面・49製品 ↗";
      const cta=nav.querySelector(".nav-cta,.or-nav__cta"); cta?nav.insertBefore(a,cta):nav.appendChild(a);
    }
    document.querySelectorAll(".site-footer nav,.or-footer nav").forEach(nav=>{
      if(nav.querySelector("[data-system-site-link]")) return;
      const a=document.createElement("a"); a.href=systemSite; a.target="_blank"; a.rel="noopener"; a.dataset.systemSiteLink=""; a.textContent="実際に動く49製品 ↗"; nav.appendChild(a);
    });
  };
  const run=async()=>{
    let last;
    for(const src of legacySources){try{await load(src);last=null;break;}catch(e){last=e;}}
    if(last)console.warn("[DPRO SHOP] 既存処理の読込確認",last);
    inject();
  };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",run,{once:true}); else run();
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
