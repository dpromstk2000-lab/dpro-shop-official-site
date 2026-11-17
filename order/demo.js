'use strict';
// DPRO ORDER PUBLIC DEMO. Entirely local, no fetch, credentials, storage or real DB access.
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const yen = value => '¥' + Number(value).toLocaleString('ja-JP');
const statuses = {submitted:'承認待ち', confirmed:'承認済み', partially_shipped:'分納中', shipped:'出荷完了',cancelled:'取消済み'};
const roles = {
  buyer_a:{name:'購入者A（架空販売店A）',type:'buyer',buyer:'a'},
  buyer_b:{name:'購入者B（架空販売店B）',type:'buyer',buyer:'b'},
  seller_sales:{name:'営業担当',type:'seller_sales'},
  seller_shipper:{name:'出荷担当',type:'seller_shipper'},
  seller_admin:{name:'卸売管理者',type:'seller_admin'},
};
function initialData(){const seed = {
  buyers:[{id:'a',name:'架空販売店A'},{id:'b',name:'架空販売店B'}],
  products:[{id:'p1',sku:'DP-101',name:'A4コピー用紙（500枚）',unit:'箱',lot:1,stock:42},
    {id:'p2',sku:'DP-202',name:'梱包テープ',unit:'巻',lot:2,stock:120},
    {id:'p3',sku:'DP-303',name:'角2封筒',unit:'束',lot:1,stock:26}],
  prices:{a:{p1:1200,p2:320,p3:980},b:{p1:1350,p2:300,p3:1050}},
  orders:[
    {id:'DEMO-1001',buyer:'a',status:'submitted',created:'11/17 09:20',lines:[{product:'p1',qty:3,shipped:0},{product:'p2',qty:6,shipped:0}],note:'午前の納品希望'},
    {id:'DEMO-1002',buyer:'b',status:'confirmed',created:'11/17 10:00',lines:[{product:'p3',qty:4,shipped:0}],note:''},
    {id:'DEMO-1003',buyer:'a',status:'partially_shipped',created:'11/17 10:30',lines:[{product:'p1',qty:5,shipped:2}],note:'分納サンプル'}
  ],nextOrder:1004
};for(const o of seed.orders)for(const line of o.lines)line.unitPrice=seed.prices[o.buyer][line.product];return seed;}
let data=initialData(), entered=false, roleKey='buyer_a', page='dashboard', focusedOrder=null, flash='';
const current = ()=>roles[roleKey];
const isBuyer=()=>current().type==='buyer';
const isAdmin=()=>current().type==='seller_admin';
const canApprove=()=>['seller_admin','seller_sales'].includes(current().type);
const canShip=()=>['seller_admin','seller_shipper'].includes(current().type);
const canPrice=()=>current().type!=='seller_shipper';
const product=id=>data.products.find(p=>p.id===id);
const buyer=id=>data.buyers.find(b=>b.id===id);
const visibleOrders=()=>data.orders.filter(o=>!isBuyer()||o.buyer===current().buyer);
const availableProducts=()=>data.products;
const price=(b,p)=>data.prices[b]?.[p];
const orderTotal=o=>o.lines.reduce((sum,line)=>sum+line.qty*Number(line.unitPrice||0),0);
const remaining=o=>o.lines.some(line=>line.qty>line.shipped);
const statusHTML=s=>`<span class="tag ${esc(s)}">${esc(statuses[s]||s)}</span>`;
function notify(msg,issue=false){flash=(issue?'⚠ ':'✓ ')+msg;render();}
function reset(){data=initialData();roleKey='buyer_a';page='dashboard';focusedOrder=null;flash='';render();}
function loginHTML(){return `<section class="panel login"><p class="eyebrow">DPRO ORDER / PUBLIC DEMO</p><h1>受発注システムを体験</h1><p class="lead">メールアドレス・個人情報は不要です。共通コードを入力して、架空の注文を操作できます。</p><div class="note"><b>公開DEMO共通コード：1234</b><br>このコードは本番ログインには利用できません。</div><form id="loginForm"><p><label class="field">DEMOコード<input name="code" type="password" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="1234" required></label></p><button class="btn" type="submit">DEMOを開始する</button></form><div id="feedback" role="status">${esc(flash)}</div><p class="muted">データはこの画面の中だけ。画面を更新すると元に戻ります。</p></section>`;}
const menuEntries=[['dashboard','今日の状況'],['orders','注文一覧'],['catalog','商品・単価'],['new','新規発注'],['shipping','出荷処理'],['settings','管理台帳']];
function render(){
  $('#menu').hidden=!entered;
  $('#breadcrumb').textContent=entered?'DPRO ORDER｜公開体験DEMO':'公開DEMO';
  if(!entered){$('#topcontrols').innerHTML='';$('#main').innerHTML=loginHTML();return;}
  $('#topcontrols').innerHTML=`<label class="muted" for="roleSelect">画面切替</label><select class="roleSelect" id="roleSelect">${Object.entries(roles).map(([k,r])=>`<option value="${k}" ${roleKey===k?'selected':''}>${esc(r.name)}</option>`).join('')}</select><button class="btn small alt" data-action="reset">最初から</button><button class="btn small alt" data-action="logout">終了</button>`;
  const allowed=entry=>!((entry==='new'&&!isBuyer())||(entry==='shipping'&&!canShip())||(entry==='settings'&&!isAdmin()));
  if(!allowed(page))page='dashboard';
  $('#menu').innerHTML=menuEntries.filter(([k])=>allowed(k)).map(([k,title])=>`<button data-page="${k}" class="${page===k?'active':''}">${esc(title)}</button>`).join('');
  const intro=`<div class="ribbon"><strong>架空データを使った公開DEMO</strong>　｜　現在の画面：${esc(current().name)}<br>発注・承認・出荷は画面内だけで反映されます。実際の注文、外部通知、保存は一切行いません。</div>`;
  const pages={dashboard:dashboardHTML,orders:ordersHTML,catalog:catalogHTML,new:newHTML,shipping:shippingHTML,settings:settingsHTML};
  $('#main').innerHTML=intro+`<div id="feedback" role="status" aria-live="polite" class="${flash.startsWith('⚠')?'issue':'ok'}">${esc(flash)}</div>`+pages[page]()+`<p class="foot">DPRO ORDER 公開DEMO｜架空データ・本番システム非接続・ブラウザ再読込で初期化</p>`;
}
function dashboardHTML(){const o=visibleOrders();let pending=o.filter(x=>x.status==='submitted').length,shipping=o.filter(x=>['confirmed','partially_shipped'].includes(x.status)).length,done=o.filter(x=>x.status==='shipped').length;return `<div class="between"><div><p class="eyebrow">TODAY</p><h1>今日の状況</h1><p class="lead">${esc(current().name)} の体験画面です。</p></div><div class="row">${isBuyer()?'<button class="btn" data-page="new">＋ 新規発注</button>':''}${canShip()?'<button class="btn alt" data-page="shipping">出荷処理</button>':''}<button class="btn alt" data-page="orders">注文一覧</button></div></div><div class="stats"><div class="stat"><span class="muted">表示中の注文</span><strong>${o.length}件</strong></div><div class="stat"><span class="muted">承認待ち</span><strong>${pending}件</strong></div><div class="stat"><span class="muted">出荷対応中</span><strong>${shipping}件</strong></div><div class="stat"><span class="muted">出荷完了</span><strong>${done}件</strong></div></div><section class="panel"><h2>最近の注文</h2>${orderTable(o.slice(-5).reverse())}</section><div class="note">画面右上の「画面切替」で購入者・営業・出荷担当・管理者を切り替えると、注文が同じ架空データのまま連動します。</div>`;}
function orderTable(orders){if(!orders.length)return '<div class="empty">該当する注文がありません。</div>';
  return `<div class="tablewrap"><table class="table"><thead><tr><th>注文</th><th>取引先</th><th>商品・数量</th><th>状態</th>${canPrice()?'<th>参考金額（税抜）</th>':''}<th>操作</th></tr></thead><tbody>${orders.map(o=>`<tr><td><strong>${esc(o.id)}</strong><br><small>${esc(o.created)}</small></td><td>${esc(buyer(o.buyer).name)}</td><td>${o.lines.map(l=>`${esc(product(l.product).name)} ×${l.qty}<small>（出荷済 ${l.shipped}）</small>`).join('<br>')}</td><td>${statusHTML(o.status)}</td>${canPrice()?`<td>${yen(orderTotal(o))}</td>`:''}<td><div class="actions"><button class="btn small alt" data-action="detail" data-id="${esc(o.id)}">詳細</button>${canApprove()&&o.status==='submitted'?`<button class="btn small" data-action="confirm" data-id="${esc(o.id)}">承認</button>`:''}${(canApprove()||(isBuyer()&&o.buyer===current().buyer))&&o.status==='submitted'?`<button class="btn small bad" data-action="cancel" data-id="${esc(o.id)}">取消</button>`:''}</div></td></tr>`).join('')}</tbody></table></div>`;
}
function ordersHTML(){const orders=visibleOrders().slice().reverse();const o=orders.find(x=>x.id===focusedOrder);return `<p class="eyebrow">ORDERS</p><h1>注文一覧</h1><p class="lead">他の購入者の注文は、購入者画面には表示されません。</p>${o?`<section class="panel"><div class="between"><h2>注文詳細 ${esc(o.id)}</h2><button class="btn alt small" data-action="close-detail">閉じる</button></div><p>${statusHTML(o.status)}｜${esc(buyer(o.buyer).name)}</p><div class="tablewrap"><table class="table"><thead><tr><th>商品</th><th>発注数</th><th>出荷済み</th><th>残数</th>${canPrice()?'<th>参考単価</th>':''}</tr></thead><tbody>${o.lines.map(l=>`<tr><td>${esc(product(l.product).name)}</td><td>${l.qty}</td><td>${l.shipped}</td><td>${l.qty-l.shipped}</td>${canPrice()?`<td>${yen(l.unitPrice)}</td>`:''}</tr>`).join('')}</tbody></table></div><p class="muted">備考：${esc(o.note||'なし')}</p></section>`:''}<section class="panel">${orderTable(orders)}</section>`;}
function catalogHTML(){let b=isBuyer()?current().buyer:'a';return `<p class="eyebrow">PRODUCTS</p><h1>商品・契約単価</h1><p class="lead">架空の卸売商品を表示しています。${canPrice()?'表示価格は体験用の税抜価格です。':'出荷担当には契約単価を表示しません。'}</p><section class="panel"><div class="tablewrap"><table class="table"><thead><tr><th>商品コード</th><th>商品名</th><th>発注単位</th>${!isBuyer()?'<th>在庫</th>':''}${canPrice()?'<th>参考単価</th>':''}</tr></thead><tbody>${availableProducts().map(p=>`<tr><td>${esc(p.sku)}</td><td>${esc(p.name)}</td><td>${p.lot}${esc(p.unit)}単位</td>${!isBuyer()?`<td>${p.stock}${esc(p.unit)}</td>`:''}${canPrice()?`<td>${yen(price(b,p.id))}</td>`:''}</tr>`).join('')}</tbody></table></div></section>`;}
function newHTML(){if(!isBuyer())return '<p>購入者画面でのみ発注できます。</p>';return `<p class="eyebrow">NEW ORDER</p><h1>新規発注</h1><p class="lead">数量を入力し「架空注文を発行」を押してください。実際の注文は送信されません。</p><section class="panel"><form id="newOrderForm"><p class="subhead">発注先：架空DPRO卸売　｜　取引先：${esc(buyer(current().buyer).name)}</p><div class="tablewrap"><table class="table"><thead><tr><th>商品</th><th>参考単価</th><th>発注単位</th><th>数量</th></tr></thead><tbody>${availableProducts().map(p=>`<tr><td>${esc(p.name)}<br><small>${esc(p.sku)}</small></td><td>${yen(price(current().buyer,p.id))}</td><td>${p.lot}${esc(p.unit)}ずつ</td><td><input class="num" aria-label="${esc(p.name)}の数量" type="number" min="0" max="1000" step="${p.lot}" value="0" name="q_${p.id}"></td></tr>`).join('')}</tbody></table></div><p class="field">備考（任意）<textarea maxlength="150" name="note" rows="2" placeholder="例：希望納品日など"></textarea></p><button class="btn" type="submit">架空注文を発行</button></form></section>`;}
function shippingHTML(){if(!canShip())return '<p>出荷担当画面でのみ操作できます。</p>';const o=data.orders.filter(x=>['confirmed','partially_shipped'].includes(x.status)&&remaining(x));return `<p class="eyebrow">SHIPPING</p><h1>出荷・分納</h1><p class="lead">承認済みの架空注文を分納できます。在庫の変化もデモ画面に反映されます。</p>${!o.length?'<section class="panel empty">出荷対応中の注文はありません。営業担当画面で注文を承認してください。</section>':o.map(order=>`<section class="panel"><div class="between"><h2>${esc(order.id)}｜${esc(buyer(order.buyer).name)}</h2>${statusHTML(order.status)}</div><form class="shipForm" data-id="${esc(order.id)}"><div class="tablewrap"><table class="table"><thead><tr><th>商品</th><th>発注残数</th><th>架空在庫</th><th>今回出荷</th></tr></thead><tbody>${order.lines.map(l=>`<tr><td>${esc(product(l.product).name)}</td><td>${l.qty-l.shipped}</td><td>${product(l.product).stock}</td><td><input class="num" type="number" aria-label="${esc(product(l.product).name)}の出荷数量" min="0" max="${l.qty-l.shipped}" value="0" name="ship_${l.product}"></td></tr>`).join('')}</tbody></table></div><p><button class="btn" type="submit">架空の出荷を登録</button></p></form></section>`).join('')}`;}
function settingsHTML(){if(!isAdmin())return '<p>管理者だけが確認できます。</p>';return `<p class="eyebrow">MASTER</p><h1>管理台帳（DEMO）</h1><p class="lead">架空商品の在庫・契約単価を変更して、各画面への反映を体験できます。</p><section class="panel"><h2>在庫数の変更</h2>${data.products.map(p=>`<form class="stockForm row" data-id="${p.id}"><label class="field">${esc(p.name)}<input name="stock" type="number" min="0" max="99999" class="num" value="${p.stock}" required></label><button class="btn small alt" type="submit">在庫を変更</button></form><hr class="divider">`).join('')}</section><section class="panel"><h2>契約単価の変更</h2><form id="priceForm" class="formgrid"><label class="field">取引先<select name="buyer">${data.buyers.map(b=>`<option value="${b.id}">${esc(b.name)}</option>`).join('')}</select></label><label class="field">商品<select name="product">${data.products.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select></label><label class="field">参考単価（税抜・円）<input type="number" name="price" min="0" max="1000000" value="1200" required></label><div class="row"><button class="btn" type="submit">単価を変更</button></div></form></section>`;}
function requireOrder(id){const o=data.orders.find(x=>x.id===id);if(!o||!visibleOrders().includes(o))throw Error('この注文を操作できません。');return o;}
function move(pageName){if(!menuEntries.some(e=>e[0]===pageName))return;page=pageName;flash='';focusedOrder=null;render();$('#main').focus();window.scrollTo(0,0);}
function act(action,id){
 if(action==='logout'){entered=false;roleKey='buyer_a';page='dashboard';data=initialData();flash='';render();return;}
 if(action==='reset'){if(confirm('架空データを最初の状態に戻しますか？'))reset();return;}
 if(action==='close-detail'){focusedOrder=null;render();return;}
 const o=requireOrder(id);
 if(action==='detail'){focusedOrder=id;page='orders';render();return;}
 if(action==='confirm'){
   if(!canApprove()||o.status!=='submitted')throw Error('承認できる注文ではありません。');
   o.status='confirmed';notify('架空注文を承認しました。出荷担当画面で出荷できます。');return;
 }
 if(action==='cancel'){
   if(o.status!=='submitted'||!(canApprove()||(isBuyer()&&o.buyer===current().buyer)))throw Error('取消可能な注文ではありません。');
   o.status='cancelled';notify('架空注文を取り消しました。');return;
 }
}
function onSubmit(e){
 const form=e.target;if(!(form instanceof HTMLFormElement))return;e.preventDefault();
 try{
  if(form.id==='loginForm'){
    if(new FormData(form).get('code')!=='1234')throw Error('DEMOコードが違います。1234を入力してください。');
    entered=true;roleKey='buyer_a';page='dashboard';flash='DEMOを開始しました。右上で担当画面を切り替えられます。';render();return;
  }
  if(!entered)throw Error('まずDEMOに入ってください。');
  const fd=new FormData(form);
  if(form.id==='newOrderForm'){
    if(!isBuyer())throw Error('購入者のみ発注できます。');
    let lines=[];
    for(const p of data.products){const v=fd.get('q_'+p.id);const qty=Number(v);if(!Number.isSafeInteger(qty)||qty<0||qty>1000||qty%p.lot!==0)throw Error(p.name+'の数量は'+p.lot+'単位で入力してください。');if(qty)lines.push({product:p.id,qty,shipped:0,unitPrice:price(current().buyer,p.id)});}
    if(!lines.length)throw Error('1商品以上の数量を入力してください。');
    const id='DEMO-'+data.nextOrder++;
    data.orders.push({id,buyer:current().buyer,status:'submitted',created:new Date().toLocaleString('ja-JP',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}),lines,note:String(fd.get('note')||'').slice(0,150)});
    page='orders';notify('架空注文 '+id+' を発行しました。営業担当画面に切り替えて承認を体験できます。');return;
  }
  if(form.classList.contains('shipForm')){
    if(!canShip())throw Error('出荷権限がありません。');
    const o=requireOrder(form.dataset.id);
    if(!['confirmed','partially_shipped'].includes(o.status))throw Error('承認済み注文ではありません。');
    let shipping=[];
    for(const l of o.lines){const qty=Number(fd.get('ship_'+l.product));const p=product(l.product);if(!Number.isSafeInteger(qty)||qty<0||qty>l.qty-l.shipped||qty>p.stock)throw Error(p.name+'の出荷数または在庫を確認してください。');if(qty>0)shipping.push({line:l,product:p,qty});}
    if(!shipping.length)throw Error('出荷数量を入力してください。');
    for(const s of shipping){s.line.shipped+=s.qty;s.product.stock-=s.qty;}
    o.status=o.lines.every(l=>l.qty===l.shipped)?'shipped':'partially_shipped';
    notify(o.status==='shipped'?'架空注文を出荷完了にしました。':'架空注文を分納として記録しました。');return;
  }
  if(form.classList.contains('stockForm')){
    if(!isAdmin())throw Error('管理者のみ操作できます。');
    const p=product(form.dataset.id),v=Number(fd.get('stock'));
    if(!p||!Number.isSafeInteger(v)||v<0||v>99999)throw Error('在庫数が不正です。');p.stock=v;notify('架空在庫を更新しました。');return;
  }
  if(form.id==='priceForm'){
    if(!isAdmin())throw Error('管理者のみ操作できます。');
    const b=String(fd.get('buyer')),pid=String(fd.get('product')),v=Number(fd.get('price'));
    if(!data.prices[b]||!product(pid)||!Number.isSafeInteger(v)||v<0||v>1000000)throw Error('単価の入力を確認してください。');
    data.prices[b][pid]=v;notify('架空の契約単価を更新しました。');return;
  }
 }catch(error){notify(error.message,true);}
}
document.addEventListener('submit',onSubmit);
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.page&&entered){move(b.dataset.page);return;}
 if(b.dataset.action){try{act(b.dataset.action,b.dataset.id);}catch(error){notify(error.message,true);}}
});
document.addEventListener('change',e=>{
 if(e.target.id==='roleSelect'&&entered&&Object.hasOwn(roles,e.target.value)){roleKey=e.target.value;page='dashboard';focusedOrder=null;flash='担当画面を切り替えました。';render();}
});
render();
