/**
 * DPRO ORDER #58 / V2.8.0
 * Offline-only master CSV preflight for the three admin CSV export formats.
 * Does not import, persist, transmit, authenticate, or authorize any writes.
 * Existing supplier-scoped setup MUST be provided by the authenticated caller.
 */
export const MAX_CSV_BYTES = 256 * 1024;
export const MAX_CSV_ROWS = 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEADERS = Object.freeze({
  buyers: Object.freeze(['取引先コード','会社名','支払条件']),
  products: Object.freeze(['商品コード','商品名','単位','発注ロット','現在庫','引当済み']),
  prices: Object.freeze(['取引先コード','取引先名','商品コード','商品名','契約単価（税抜円）']),
});
const safeText = (value, max, required=true) =>
  typeof value==='string' && value.length<=max && (!required||value.length>0) &&
  !/[\u0000-\u001f\u007f-\u009f]/.test(value) && !/^\s*[=+@-]/.test(value);
const positiveCode = (value, max) =>
  typeof value==='string' && value.length>0 && value.length<=max &&
  /^[a-z0-9][a-z0-9._-]*$/i.test(value);
const intString = (value,max,min=0) =>
  typeof value==='string' && /^(?:0|[1-9][0-9]*)$/.test(value) &&
  Number.isSafeInteger(Number(value)) && Number(value)>=min && Number(value)<=max;
const codeKey = x => x.toUpperCase();
const issue = (row,code) => Object.freeze({row,code});
const same = (x,y) => String(x??'')===String(y??'');

/** Strict RFC 4180-compatible parser with escaped quotes and BOM support. */
export function parseMasterCsv(csv){
  if(typeof csv!=='string' || new TextEncoder().encode(csv).byteLength>MAX_CSV_BYTES)
    throw new Error('CSV_SIZE_INVALID');
  const source=csv.replace(/^\uFEFF/,'');
  if(!source) throw new Error('EMPTY_CSV');
  const rows=[]; let fields=[],field='',quoted=false,closedQuote=false,atStart=true;
  const pushField=()=>{fields.push(field);field='';quoted=false;closedQuote=false;atStart=true;};
  const pushRow=()=>{pushField();rows.push(fields);fields=[];
    if(rows.length>MAX_CSV_ROWS+1) throw new Error('CSV_TOO_MANY_ROWS');};
  for(let i=0;i<source.length;i++){
    const ch=source[i];
    if(quoted){
      if(ch==='"' && source[i+1]==='"'){field+='"';i++;}
      else if(ch==='"'){quoted=false;closedQuote=true;}
      else field+=ch;
    }else if(ch==='"'){
      if(!atStart || closedQuote) throw new Error('CSV_QUOTE_INVALID');
      quoted=true;atStart=false;
    }else if(ch===','){pushField();}
    else if(ch==='\n' || ch==='\r'){
      if(ch==='\r' && source[i+1]==='\n')i++;
      pushRow();
    }else{
      if(closedQuote)throw new Error('CSV_QUOTE_INVALID');
      field+=ch;atStart=false;
    }
  }
  if(quoted)throw new Error('CSV_QUOTE_INVALID');
  if(fields.length||field||closedQuote||!rows.length) pushRow();
  while(rows.length>1 && rows.at(-1).every(v=>v==='')) rows.pop();
  if(rows.some(r=>r.length!==rows[0].length)) throw new Error('CSV_COLUMN_MISMATCH');
  return rows;
}

function assertScope(scope,setup){
  if(!scope || scope.role!=='seller_admin'||!UUID.test(scope.supplierId||'') ||
      !setup || !Array.isArray(setup.buyers)||!Array.isArray(setup.products)||!Array.isArray(setup.prices))
    throw new Error('ADMIN_SCOPED_SETUP_REQUIRED');
  // This module deliberately receives only one already-scoped admin setup.
  // It never merges multiple companies' records or accepts a supplier ID from CSV.
}
function uniqueIndex(items,key){
  const map=new Map();
  for(const item of items){
    if(typeof item?.[key]!=='string')throw new Error('CURRENT_SETUP_INVALID');
    const k=codeKey(item[key]);
    if(map.has(k))throw new Error('CURRENT_SETUP_DUPLICATE');
    map.set(k,item);
  }
  return map;
}

/** Returns code-only diagnostics, never raw values; never performs any writes. */
export function previewMasterCsv(kind,csv,scope,setup){
  assertScope(scope,setup);
  if(!Object.hasOwn(HEADERS,kind))throw new Error('CSV_KIND_INVALID');
  const rows=parseMasterCsv(csv),headers=HEADERS[kind];
  if(rows[0].length!==headers.length || rows[0].some((v,i)=>v!==headers[i]))
    throw new Error('CSV_HEADER_MISMATCH');
  const buyers=uniqueIndex(setup.buyers,'code'),products=uniqueIndex(setup.products,'sku');
  const buyerIds=new Set(setup.buyers.map(x=>x.id));
  const productIds=new Set(setup.products.map(x=>x.id));
  if(buyerIds.size!==setup.buyers.length || productIds.size!==setup.products.length)
    throw new Error('CURRENT_SETUP_DUPLICATE');
  const currentPrices=new Map();
  for(const p of setup.prices){
    if(!buyerIds.has(p.buyerId)||!productIds.has(p.productId))throw new Error('CURRENT_SETUP_INVALID');
    const k=p.buyerId+'/'+p.productId;
    if(currentPrices.has(k))throw new Error('CURRENT_SETUP_DUPLICATE');
    currentPrices.set(k,p);
  }
  let unchanged=0,proposed=0,errorsTotal=0,warningsTotal=0;
  const errors=[],warnings=[],seen=new Set();
  function add(list,row,code){
    if(list===errors)errorsTotal++;else warningsTotal++;
    if(list.length<20)list.push(issue(row,code));
  }
  for(let i=1;i<rows.length;i++){
    const rowNumber=i+1,r=rows[i];
    if(r.every(v=>v==='')){add(errors,rowNumber,'EMPTY_ROW');continue;}
    if(r.some(x=>!safeText(x,300,false))){add(errors,rowNumber,'UNSAFE_OR_OVERSIZED_CELL');continue;}
    let key,valid=true,current=null,identical=false;
    if(kind==='buyers'){
      const [code,name,terms]=r;
      if(!positiveCode(code,40)||!safeText(name,100)||!safeText(terms,120,false)){
        add(errors,rowNumber,'INVALID_BUYER_FIELDS');valid=false;
      }
      key=codeKey(code);
      current=buyers.get(key);
      identical=!!current && same(current.name,name)&&same(current.paymentTerms,terms);
    }else if(kind==='products'){
      const [sku,name,unit,lot,stock,reserved]=r;
      if(!positiveCode(sku,60)||!safeText(name,120)||!safeText(unit,20)||
         !intString(lot,999999999,1)||!intString(stock,999999999)||
         !intString(reserved,999999999)||Number(reserved)>Number(stock)){
        add(errors,rowNumber,'INVALID_PRODUCT_FIELDS');valid=false;
      }
      key=codeKey(sku);
      current=products.get(key);
      identical=!!current&&same(current.name,name)&&same(current.unit,unit)&&
        same(current.lot,lot)&&same(current.onHand,stock)&&same(current.reserved,reserved);
    }else{
      const [buyerCode,buyerName,productCode,productName,price]=r;
      if(!positiveCode(buyerCode,40)||!positiveCode(productCode,60)||
         !safeText(buyerName,100)||!safeText(productName,120)||!intString(price,1000000000)){
        add(errors,rowNumber,'INVALID_PRICE_FIELDS');valid=false;
      }
      const buyer=buyers.get(codeKey(buyerCode)),product=products.get(codeKey(productCode));
      if(!buyer||!product){add(errors,rowNumber,'REFERENCE_NOT_FOUND');valid=false;}
      if(buyer&&product){
        if(buyer.name!==buyerName||product.name!==productName){
          add(errors,rowNumber,'REFERENCE_NAME_MISMATCH');valid=false;
        }
        key=buyer.id+'/'+product.id;
        current=currentPrices.get(key);
        identical=!!current&&same(current.priceYen,price);
      }else key=codeKey(buyerCode)+'/'+codeKey(productCode);
    }
    if(seen.has(key)){add(errors,rowNumber,'CSV_DUPLICATE_KEY');valid=false;}
    seen.add(key);
    if(!valid)continue;
    if(identical)unchanged++;
    else{
      proposed++;
      if(current)add(warnings,rowNumber,'EXISTING_RECORD_DIFFERS');
      if(kind==='products' && current && !same(current.onHand,r[4]))
        add(warnings,rowNumber,'STOCK_CHANGE_REQUIRES_RECONCILIATION');
    }
  }
  return Object.freeze({kind,recordCount:rows.length-1,unchangedCount:unchanged,
    proposedCount:proposed,errorCount:errorsTotal,warningCount:warningsTotal,
    errors:Object.freeze(errors),warnings:Object.freeze(warnings),
    ok:errorsTotal===0,mode:'LOCAL_REVIEW_ONLY',uploadAllowed:false,writePerformed:false,
    supplierId:scope.supplierId});
}
