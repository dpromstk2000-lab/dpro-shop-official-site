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

  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  };

  ready(() => {
    if (!document.body.classList.contains('website-refresh')) return;

    const section = document.querySelector('#case');
    const shell = section?.querySelector('.or-shell');
    const greenCard = section?.querySelector('.or-case-card');
    if (!section || !shell || !greenCard) return;
    if (section.querySelector('[data-wangan-site-samples]')) return;

    const heading = section.querySelector('.or-section__head');
    if (heading) {
      const eyebrow = heading.querySelector('.or-eyebrow');
      const title = heading.querySelector('h2');
      const lead = heading.querySelector('p:last-child');
      if (eyebrow) eyebrow.textContent = 'WEBSITE PRODUCTION SAMPLES';
      if (title) title.innerHTML = '実際の制作例で、<br>プランの違いを比較できます。';
      if (lead) {
        lead.textContent =
          'GREENのビジネスサイトに加え、同じ自動車整備店を題材にした3つの制作サンプルを公開しています。価格だけでなく、サイトの役割とDPRO連携の違いをご覧ください。';
      }
    }

    const style = document.createElement('style');
    style.id = 'dpro-official-wangan-samples-style';
    style.textContent = `
      #case .or-case-card{margin-bottom:34px}
      .or-green-case-number{display:flex;align-items:center;gap:10px;margin:0 0 12px;color:#0b1621;font-size:11px;font-weight:1000;letter-spacing:.11em}
      .or-green-case-number span{display:inline-flex;padding:6px 9px;background:#0d1713;color:#7cff95;border:1px solid #21382b}
      .or-green-case-number b{font-size:11px;letter-spacing:.08em}
      .or-wangan-samples{margin-top:32px}
      .or-wangan-samples__head{display:flex;justify-content:space-between;gap:24px;align-items:end;margin-bottom:20px}
      .or-wangan-samples__head small{display:block;color:#8b6200;font-size:11px;font-weight:900;letter-spacing:.14em}
      .or-wangan-samples__head h3{margin:7px 0 0;color:#0b1621;font-size:clamp(25px,3vw,38px);line-height:1.18;letter-spacing:-.035em}
      .or-wangan-samples__head p{max-width:560px;margin:0;color:#67727d;font-size:13px;line-height:1.8}
      .or-wangan-samples__grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
      .or-wangan-sample{position:relative;min-width:0;background:#fff;border:1px solid #dfe4e8;box-shadow:0 18px 46px rgba(8,20,30,.08);overflow:hidden}
      .or-wangan-sample.is-business{background:#0c131b;color:#fff;border-color:#24313e}
      .or-wangan-sample__preview{height:235px;position:relative;overflow:hidden;background:#090e13}
      .or-wangan-sample__preview iframe{width:1440px;height:980px;border:0;transform:scale(.285);transform-origin:0 0;pointer-events:none;background:#fff}
      .or-wangan-sample__preview:after{content:"";position:absolute;inset:0;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08);pointer-events:none}
      .or-wangan-sample__copy{padding:22px}
      .or-wangan-sample__copy>small{color:#8b6200;font-size:10px;font-weight:1000;letter-spacing:.13em}
      .or-wangan-sample.is-business .or-wangan-sample__copy>small{color:#ffd633}
      .or-wangan-sample h4{margin:8px 0 0;font-size:21px;line-height:1.35}
      .or-wangan-sample__price{display:block;margin-top:12px;font-size:25px;font-weight:1000}
      .or-wangan-sample__price small{font-size:12px}
      .or-wangan-sample p{margin:12px 0 0;color:#64707a;font-size:12px;line-height:1.75}
      .or-wangan-sample.is-business p{color:#b8c1cb}
      .or-wangan-sample ul{display:grid;gap:7px;margin:16px 0 20px;padding:0;list-style:none}
      .or-wangan-sample li{position:relative;padding-left:16px;font-size:12px;line-height:1.55}
      .or-wangan-sample li:before{content:"✓";position:absolute;left:0;color:#a77b00;font-weight:1000}
      .or-wangan-sample.is-business li:before{color:#ffd633}
      .or-wangan-sample .or-button{width:100%;justify-content:center}
      .or-wangan-sample__badge{position:absolute;z-index:2;left:12px;top:12px;padding:7px 9px;background:#ffd633;color:#111;font-size:9px;font-weight:1000;letter-spacing:.08em}
      .or-wangan-samples__note{margin:18px 0 0;padding:13px 15px;border-left:3px solid #c79600;background:#f7f3e8;color:#666f76;font-size:11px;line-height:1.7}
      @media(max-width:980px){
        .or-wangan-samples__head{display:block}
        .or-wangan-samples__head p{margin-top:12px}
        .or-wangan-samples__grid{grid-template-columns:1fr}
        .or-wangan-sample{display:grid;grid-template-columns:minmax(280px,42%) 1fr}
        .or-wangan-sample__preview{height:100%;min-height:310px}
        .or-wangan-sample__preview iframe{transform:scale(.31)}
      }
      @media(max-width:680px){
        .or-wangan-sample{display:block}
        .or-wangan-sample__preview{height:210px;min-height:0}
        .or-wangan-sample__preview iframe{transform:scale(.24)}
        .or-wangan-sample__copy{padding:19px}
      }
    `;
    document.head.appendChild(style);

    if (!section.querySelector('[data-green-case-number]')) {
      const greenNumber = document.createElement('div');
      greenNumber.className = 'or-green-case-number';
      greenNumber.dataset.greenCaseNumber = '';
      greenNumber.innerHTML = '<span>01 / BUSINESS WEBSITE SAMPLE</span><b>DPRO GREEN</b>';
      greenCard.insertAdjacentElement('beforebegin', greenNumber);
    }

    const wrap = document.createElement('div');
    wrap.className = 'or-wangan-samples or-reveal';
    wrap.dataset.wanganSiteSamples = '';
    wrap.innerHTML = `
      <div class="or-wangan-samples__head">
        <div>
          <small>WANGAN / SAME BUSINESS, THREE WEBSITE LEVELS</small>
          <h3>同じ業種で見る、3つのサイトクラス。</h3>
        </div>
        <p>同じ自動車整備店を題材にすることで、デザインの違いではなく「ホームページに何を任せるか」の違いを比較できます。</p>
      </div>

      <div class="or-wangan-samples__grid">
        <article class="or-wangan-sample">
          <div class="or-wangan-sample__preview" aria-hidden="true">
            <iframe loading="lazy" src="https://dpromstk2000-lab.github.io/street-house-wangan-standard-sample/" title="DPROオリジナルLP制作サンプル"></iframe>
          </div>
          <div class="or-wangan-sample__copy">
            <small>02 / ORIGINAL LP</small>
            <h4>DPROオリジナルLP</h4>
            <strong class="or-wangan-sample__price">88,000<small>円</small></strong>
            <p>1ページにサービス・強み・料金・問い合わせ導線をまとめ、短時間で内容が伝わる構成。</p>
            <ul>
              <li>縦長1ページ</li>
              <li>オリジナルデザイン</li>
              <li>広告・LINEからの誘導向け</li>
            </ul>
            <a class="or-button or-button--dark" href="https://dpromstk2000-lab.github.io/street-house-wangan-standard-sample/" rel="noopener" target="_blank">制作サンプルを見る</a>
          </div>
        </article>

        <article class="or-wangan-sample">
          <div class="or-wangan-sample__preview" aria-hidden="true">
            <iframe loading="lazy" src="https://dpromstk2000-lab.github.io/street-house-wangan-original-sample/" title="DPROオリジナルホームページ制作サンプル"></iframe>
          </div>
          <div class="or-wangan-sample__copy">
            <small>03 / ORIGINAL WEBSITE</small>
            <h4>DPROオリジナルホームページ</h4>
            <strong class="or-wangan-sample__price">165,000<small>円</small></strong>
            <p>動画・サービス案内・料金・店舗情報・FAQまで揃えた、本格的な店舗・企業ホームページ。</p>
            <ul>
              <li>動画・アニメーション</li>
              <li>ブランド表現を強化</li>
              <li>基本は独立型サイト</li>
            </ul>
            <a class="or-button or-button--dark" href="https://dpromstk2000-lab.github.io/street-house-wangan-original-sample/" rel="noopener" target="_blank">制作サンプルを見る</a>
          </div>
        </article>

        <article class="or-wangan-sample is-business">
          <span class="or-wangan-sample__badge">LINE × DPRO × WEBSITE</span>
          <div class="or-wangan-sample__preview" aria-hidden="true">
            <iframe loading="lazy" src="https://dpromstk2000-lab.github.io/street-house-wangan/" title="DPROビジネスホームページ制作サンプル"></iframe>
          </div>
          <div class="or-wangan-sample__copy">
            <small>04 / BUSINESS WEBSITE</small>
            <h4>DPROビジネスホームページ</h4>
            <strong class="or-wangan-sample__price">275,000<small>円〜</small></strong>
            <p>WEB受付・予約・写真相談をLINE公式とDPRO管理へつなげ、ホームページを店舗運営の入口にします。</p>
            <ul>
              <li>WEB受付・予約・写真相談</li>
              <li>LINE公式との運用連携</li>
              <li>DPRO管理画面へ情報を集約</li>
            </ul>
            <a class="or-button or-button--line" href="https://dpromstk2000-lab.github.io/street-house-wangan/" rel="noopener" target="_blank">制作サンプルを見る</a>
          </div>
        </article>
      </div>

      <p class="or-wangan-samples__note">※ STREET HOUSE湾岸通りを題材にした提案用制作サンプルです。契約店舗の導入実績を示す掲載ではありません。</p>
    `;

    greenCard.insertAdjacentElement('afterend', wrap);

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, io) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08 });
      observer.observe(wrap);
    } else {
      wrap.classList.add('is-visible');
    }
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
