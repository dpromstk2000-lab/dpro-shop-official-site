(()=>{
  'use strict';
  const run=()=>{
    if(document.documentElement.dataset.dproReservationEntry==='1') return;
    document.documentElement.dataset.dproReservationEntry='1';

    const css=`
.dpro-reservation-nav-link{white-space:nowrap;color:#dfffa2!important}
.dpro-reservation-entry{position:relative;overflow:hidden;padding:92px 0;background:linear-gradient(135deg,#f7fbf7 0%,#eef9ee 54%,#f7fbff 100%);color:#07110c;border-top:1px solid rgba(15,39,25,.06);border-bottom:1px solid rgba(15,39,25,.08)}
.dpro-reservation-entry:before{content:"";position:absolute;width:520px;height:520px;right:-180px;top:-220px;border-radius:50%;background:radial-gradient(circle,rgba(183,255,36,.24),rgba(183,255,36,0) 68%);pointer-events:none}
.dpro-reservation-entry__grid{position:relative;z-index:1;display:grid;grid-template-columns:minmax(0,.9fr) minmax(420px,1.1fr);gap:64px;align-items:center}
.dpro-reservation-entry__copy small{display:block;color:#2f80ed;font-size:10px;font-weight:950;letter-spacing:.16em}.dpro-reservation-entry__copy h2{margin:14px 0 0;font-size:clamp(40px,4.2vw,64px);line-height:1.08;letter-spacing:-.055em}.dpro-reservation-entry__copy h2 span{display:block}.dpro-reservation-entry__copy h2 em{display:block;color:#377e10;font-style:normal}.dpro-reservation-entry__copy>p{max-width:650px;margin:22px 0 0;color:#5d6b62;font-size:14px;line-height:1.85}
.dpro-reservation-entry__chooser{display:grid;grid-template-columns:1fr;gap:10px;margin-top:24px}.dpro-reservation-choice{position:relative;display:grid;grid-template-columns:1fr auto;gap:8px 16px;align-items:center;padding:18px 20px;border-radius:19px;background:#fff;border:1px solid #d8e4dc;color:#173222;box-shadow:0 10px 28px rgba(23,50,34,.06);transition:transform .18s ease,box-shadow .18s ease,border-color .18s ease}.dpro-reservation-choice:hover{transform:translateY(-2px);box-shadow:0 16px 36px rgba(23,50,34,.11);border-color:#b7d0bd}.dpro-reservation-choice small{grid-column:1/2;color:#2f80ed!important;font-size:8px!important;letter-spacing:.14em!important}.dpro-reservation-choice strong{grid-column:1/2;font-size:18px;line-height:1.35;letter-spacing:-.02em}.dpro-reservation-choice span{grid-column:1/2;color:#66736b;font-size:11px;line-height:1.7}.dpro-reservation-choice b{grid-column:2/3;grid-row:1/4;align-self:center;min-width:126px;padding:11px 13px;border-radius:999px;background:#b7ff24;color:#112007;font-size:10px;text-align:center;white-space:nowrap}.dpro-reservation-choice--waiting{background:linear-gradient(135deg,#f3fbff,#f5fff1);border-color:#cfe2dc}.dpro-reservation-choice--waiting small{color:#267256!important}.dpro-reservation-choice--waiting b{background:#0d1720;color:#fff}
.dpro-reservation-entry__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}.dpro-reservation-entry__actions a{min-height:43px;padding:0 16px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;font-size:11px;font-weight:950}.dpro-reservation-entry__secondary{border:1px solid #cdd9d0;background:#fff;color:#173222}
.dpro-reservation-entry__visual{position:relative;display:block;overflow:hidden;border-radius:28px;background:#fff;box-shadow:0 26px 70px rgba(25,55,35,.15);aspect-ratio:4/3}.dpro-reservation-entry__visual img{width:100%;height:100%;display:block;object-fit:cover}.dpro-reservation-entry__visual:after{content:"";position:absolute;inset:auto 0 0;height:48%;background:linear-gradient(transparent,rgba(2,10,5,.75))}.dpro-reservation-entry__caption{position:absolute;z-index:2;left:24px;right:24px;bottom:21px;color:#fff}.dpro-reservation-entry__caption small{display:block;color:#cfff75;font-size:9px;font-weight:900;letter-spacing:.14em}.dpro-reservation-entry__caption strong{display:block;margin-top:6px;font-size:21px;line-height:1.25}.dpro-reservation-entry__caption span{display:block;margin-top:5px;color:rgba(255,255,255,.72);font-size:11px}
@media(max-width:980px){.dpro-reservation-entry{padding:72px 0}.dpro-reservation-entry__grid{grid-template-columns:1fr;gap:30px}.dpro-reservation-entry__visual{max-width:720px}.dpro-reservation-entry__copy h2{font-size:clamp(36px,7vw,54px)}}
@media(max-width:560px){.dpro-reservation-entry{padding:60px 0}.dpro-reservation-entry__grid{gap:24px}.dpro-reservation-entry__copy h2{font-size:36px}.dpro-reservation-entry__copy h2 span,.dpro-reservation-entry__copy h2 em{white-space:nowrap}.dpro-reservation-entry__copy>p{font-size:13px}.dpro-reservation-choice{grid-template-columns:1fr;padding:17px}.dpro-reservation-choice small,.dpro-reservation-choice strong,.dpro-reservation-choice span,.dpro-reservation-choice b{grid-column:1;grid-row:auto}.dpro-reservation-choice strong{font-size:17px}.dpro-reservation-choice b{width:100%;margin-top:4px}.dpro-reservation-entry__visual{border-radius:22px}.dpro-reservation-entry__caption{left:17px;right:17px;bottom:15px}.dpro-reservation-entry__caption strong{font-size:17px}.dpro-reservation-entry__actions a{width:100%}}
@media(max-width:360px){.dpro-reservation-entry__copy h2{font-size:27px}}
`;
    const style=document.createElement('style'); style.id='dpro-reservation-entry-style'; style.textContent=css; document.head.appendChild(style);

    const nav=document.querySelector('#or-nav');
    if(nav && !nav.querySelector('a[href="reservation"]')){
      const systems=[...nav.querySelectorAll('a')].find(a=>a.getAttribute('href')==='systems/');
      const a=document.createElement('a'); a.href='reservation'; a.textContent='予約システム'; a.className='dpro-reservation-nav-link';
      systems ? systems.insertAdjacentElement('afterend',a) : nav.prepend(a);
    }

    const footerNav=document.querySelector('.or-footer nav');
    if(footerNav && !footerNav.querySelector('a[href="reservation"]')){
      const systems=[...footerNav.querySelectorAll('a')].find(a=>a.getAttribute('href')==='systems/');
      const a=document.createElement('a'); a.href='reservation'; a.textContent='予約システム';
      systems ? systems.insertAdjacentElement('afterend',a) : footerNav.prepend(a);
    }
    if(footerNav && !footerNav.querySelector('a[href="waiting-system"]')){
      const reservation=[...footerNav.querySelectorAll('a')].find(a=>a.getAttribute('href')==='reservation');
      const a=document.createElement('a'); a.href='waiting-system'; a.textContent='順番待ち・受付';
      reservation ? reservation.insertAdjacentElement('afterend',a) : footerNav.prepend(a);
    }

    if(!document.querySelector('.dpro-reservation-entry')){
      const section=document.createElement('section');
      section.className='dpro-reservation-entry';
      section.id='reservation-guide';
      section.innerHTML=`<div class="or-shell dpro-reservation-entry__grid"><div class="dpro-reservation-entry__copy"><small>RESERVATION / WAITING GUIDE</small><h2><span>予約のかたちは、</span><em>お店によって違う。</em></h2><p>まずは、使いたい受付方法を選んでください。日時を決める予約も、当日の順番受付も、DPROなら受付・顧客管理・履歴・再来店までつなげられます。</p><div class="dpro-reservation-entry__chooser" aria-label="予約方法を選ぶ"><a class="dpro-reservation-choice" href="reservation"><small>01 / RESERVATION SYSTEM</small><strong>日時を決めて予約したい</strong><span>美容室・サロン・スクール・訪問など。日時・担当者・メニュー・定員を事前に確保。</span><b>予約システムを見る →</b></a><a class="dpro-reservation-choice dpro-reservation-choice--waiting" href="waiting-system"><small>02 / WAITING &amp; RECEPTION</small><strong>当日の受付・待ち順を管理したい</strong><span>病院・動物病院・歯科・飲食店など。受付・待ち状況・呼び出し・到着までを管理。</span><b>順番待ち・受付を見る →</b></a></div><div class="dpro-reservation-entry__actions"><a class="dpro-reservation-entry__secondary" href="systems/">54システムから業種で探す</a></div></div><div class="dpro-reservation-entry__visual" aria-label="予約と店舗管理をつなぐDPROのイメージ"><img src="reservation-industry-hair.webp" alt="美容室の予約と店舗管理をイメージした明るいビジュアル" width="1448" height="1086" loading="lazy"><span class="dpro-reservation-entry__caption"><small>RESERVATION / WAITING / CUSTOMER FLOW</small><strong>入口を選んで、その先の業務まで。</strong><span>予約・受付 → 顧客管理 → 履歴 → 再来店へ</span></span></div></div>`;
      const anchor=document.querySelector('#systems-handoff') || document.querySelector('#services');
      if(anchor){ anchor.id==='systems-handoff' ? anchor.before(section) : anchor.after(section); }
    }
  };
  document.readyState==='loading' ? document.addEventListener('DOMContentLoaded',run,{once:true}) : run();
})();
