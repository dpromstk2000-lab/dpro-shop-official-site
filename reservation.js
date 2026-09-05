(() => {
 const cards=[...document.querySelectorAll('.product-card')];
 const buttons=[...document.querySelectorAll('.type-card')];
 const labels={datetime:'日時予約',queue:'順番・当日受付',lesson:'レッスン・体験',visit:'訪問・出張',consult:'相談・面談・見学',pickup:'受取・注文時間',stay:'宿泊・預かり'};
 function filter(type){
   buttons.forEach(b=>b.classList.toggle('is-active', b.dataset.filter===type));
   cards.forEach(c=>{c.hidden=type!=='all'&&c.dataset.type!==type});
 }
 buttons.forEach(b=>b.addEventListener('click',()=>{filter(b.dataset.filter);document.querySelector('#industries').scrollIntoView({behavior:'smooth',block:'start'})}));
 document.querySelector('#diagnose').addEventListener('click',()=>{
   const type=document.querySelector('#q1').value;
   filter(type);
   const count=cards.filter(c=>c.dataset.type===type).length;
   document.querySelector('#diag-result').innerHTML=`<b>${labels[type]}</b> が近いタイプです。代表DPRO製品を ${count} 件に絞り込みました。担当者選択や顧客履歴は、製品ごとに組み合わせます。`;
   setTimeout(()=>document.querySelector('#industries').scrollIntoView({behavior:'smooth',block:'start'}),160);
 });
})();

// V1.1 - LIVE DEMO lazy loader. No iframe exists until explicit user action.
(() => {
  const stage = document.getElementById('demo-stage');
  const buttons = [...document.querySelectorAll('[data-demo-url]')];
  if (!stage || !buttons.length) return;
  buttons.forEach((button) => button.addEventListener('click', () => {
    buttons.forEach((b) => b.classList.toggle('is-active', b === button));
    const url = button.dataset.demoUrl || '';
    const name = button.dataset.demoName || 'DPRO';
    if (!url) return;
    stage.innerHTML = `<div class="demo-frame-head"><strong>${name} / LIVE DEMO</strong><a href="${url}" target="_blank" rel="noopener">別タブで開く ↗</a></div><iframe title="${name} DPRO LIVE DEMO" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" src="${url}"></iframe>`;
  }));
})();


// Production navigation + lightweight analytics hooks
(() => {
  const btn=document.querySelector('.or-menu');
  const nav=document.getElementById('or-nav');
  if(btn&&nav){
    btn.addEventListener('click',()=>{
      const open=btn.getAttribute('aria-expanded')==='true';
      btn.setAttribute('aria-expanded',String(!open));
      nav.classList.toggle('is-open',!open);
    });
    nav.addEventListener('click',(e)=>{if(e.target.closest('a')){btn.setAttribute('aria-expanded','false');nav.classList.remove('is-open')}});
  }
  document.addEventListener('click',(e)=>{
    const type=e.target.closest('[data-filter]');
    const demo=e.target.closest('[data-demo-url]');
    const product=e.target.closest('.product-card a');
    if(typeof gtag==='function'){
      if(type) gtag('event','select_content',{content_type:'reservation_type',item_id:type.dataset.filter||'unknown'});
      if(demo) gtag('event','select_content',{content_type:'reservation_live_demo',item_id:demo.dataset.demoName||'unknown'});
      if(product) gtag('event','select_content',{content_type:'reservation_product',item_id:product.href||'unknown'});
    }
  });
})();
