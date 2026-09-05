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
.dpro-reservation-entry__types{display:flex;flex-wrap:wrap;gap:7px;margin-top:22px}.dpro-reservation-entry__types span{padding:8px 11px;border:1px solid #d7e6d8;border-radius:999px;background:rgba(255,255,255,.82);color:#31513b;font-size:10px;font-weight:850}
.dpro-reservation-entry__actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:27px}.dpro-reservation-entry__actions a{min-height:47px;padding:0 19px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;font-size:12px;font-weight:950}.dpro-reservation-entry__primary{background:#b7ff24;color:#112007;box-shadow:0 12px 30px rgba(108,170,16,.16)}.dpro-reservation-entry__secondary{border:1px solid #cdd9d0;background:#fff;color:#173222}
.dpro-reservation-entry__visual{position:relative;display:block;overflow:hidden;border-radius:28px;background:#fff;box-shadow:0 26px 70px rgba(25,55,35,.15);aspect-ratio:4/3}.dpro-reservation-entry__visual img{width:100%;height:100%;display:block;object-fit:cover}.dpro-reservation-entry__visual:after{content:"";position:absolute;inset:auto 0 0;height:48%;background:linear-gradient(transparent,rgba(2,10,5,.75))}.dpro-reservation-entry__caption{position:absolute;z-index:2;left:24px;right:24px;bottom:21px;color:#fff}.dpro-reservation-entry__caption small{display:block;color:#cfff75;font-size:9px;font-weight:900;letter-spacing:.14em}.dpro-reservation-entry__caption strong{display:block;margin-top:6px;font-size:21px;line-height:1.25}.dpro-reservation-entry__caption span{display:block;margin-top:5px;color:rgba(255,255,255,.72);font-size:11px}
@media(max-width:980px){.dpro-reservation-entry{padding:72px 0}.dpro-reservation-entry__grid{grid-template-columns:1fr;gap:30px}.dpro-reservation-entry__visual{max-width:720px}.dpro-reservation-entry__copy h2{font-size:clamp(36px,7vw,54px)}}
@media(max-width:560px){.dpro-reservation-entry{padding:60px 0}.dpro-reservation-entry__grid{gap:24px}.dpro-reservation-entry__copy h2{font-size:36px}.dpro-reservation-entry__copy h2 span,.dpro-reservation-entry__copy h2 em{white-space:nowrap}.dpro-reservation-entry__copy>p{font-size:13px}.dpro-reservation-entry__visual{border-radius:22px}.dpro-reservation-entry__caption{left:17px;right:17px;bottom:15px}.dpro-reservation-entry__caption strong{font-size:17px}.dpro-reservation-entry__actions a{width:100%}}
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

    if(!document.querySelector('.dpro-reservation-entry')){
      const section=document.createElement('section');
      section.className='dpro-reservation-entry';
      section.id='reservation-guide';
      section.innerHTML=`<div class="or-shell dpro-reservation-entry__grid"><div class="dpro-reservation-entry__copy or-reveal"><small>RESERVATION SYSTEM GUIDE</small><h2><span>予約のかたちは、</span><em>お店によって違う。</em></h2><p>日時予約、順番受付、レッスン・体験、訪問・出張、相談・面談、受取時間、宿泊・預かり。DPROは、業種の仕事に合わせて予約方法を選び、受付・顧客管理・履歴・再来店までつなぎます。</p><div class="dpro-reservation-entry__types"><span>日時予約</span><span>順番受付</span><span>レッスン</span><span>訪問</span><span>相談・面談</span><span>受取時間</span><span>宿泊・預かり</span></div><div class="dpro-reservation-entry__actions"><a class="dpro-reservation-entry__primary" href="reservation">自分に合う予約システムを見る</a><a class="dpro-reservation-entry__secondary" href="systems/">54システムから探す</a></div></div><a class="dpro-reservation-entry__visual or-reveal" href="reservation" aria-label="業種に合わせて選べる予約システムを見る"><img src="reservation-industry-hair.webp" alt="美容室の予約と店舗管理をイメージした明るいビジュアル" width="1448" height="1086" loading="lazy"><span class="dpro-reservation-entry__caption"><small>DATE / QUEUE / LESSON / VISIT / CONSULT</small><strong>予約だけで終わらない。</strong><span>予約 → 受付 → 顧客管理 → 履歴 → 再来店へ</span></span></a></div>`;
      const anchor=document.querySelector('#systems-handoff') || document.querySelector('#services');
      if(anchor){ anchor.id==='systems-handoff' ? anchor.before(section) : anchor.after(section); }
    }
  };
  document.readyState==='loading' ? document.addEventListener('DOMContentLoaded',run,{once:true}) : run();
})();
