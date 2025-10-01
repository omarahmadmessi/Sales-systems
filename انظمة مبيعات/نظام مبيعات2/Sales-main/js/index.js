/* =================
   نظام مبيعات DOM-only — نسخة فاتحة
   - كل الأقسام المطلوبة مذكورة كمكونات وظيفية
   - كل البيانات في الذاكرة فقط (لا حفظ)
   - عند إضافة عنصر يتحدث تلقائياً في الأقسام الأخرى
   ================= */

/* ===== البيانات (ذاكرة) ===== */
const db = {
  categories: [], products: [], stores: [], suppliers: [], customers: [],
  purchases: [], sales: [], stockMoves: [], journals: []
};

/* ===== أدوات مساعدة ===== */
const uid = (p='id')=> p + '_' + Math.random().toString(36).slice(2,9);
const q = (s, r=document)=> r.querySelector(s);
const qa = (s, r=document)=> Array.from((r||document).querySelectorAll(s));
const money = n => Number(n||0).toFixed(2);

/* ===== قائمة الأقسام المطلوبة ===== */
const SECTIONS = [
  {id:'dashboard', title:'لوحة التحكم'},
  {id:'inventory', title:'إدارة المخزون'},
  {id:'categories', title:'الأصناف والمنتجات'},
  {id:'stores', title:'المخازن والفروع'},
  {id:'stock-moves', title:'حركات المخزون'},
  {id:'purchases', title:'إدارة المشتريات'},
  {id:'purchase-orders', title:'طلبات الشراء'},
  {id:'purchase-invoices', title:'فواتير الموردين'},
  {id:'purchase-returns', title:'مرتجعات المشتريات'},
  {id:'suppliers', title:'حسابات الموردين'},
  {id:'sales', title:'إدارة المبيعات'},
  {id:'quotes', title:'عروض الأسعار'},
  {id:'sales-orders', title:'أوامر المبيعات'},
  {id:'sales-invoices', title:'فواتير البيع'},
  {id:'sales-returns', title:'مرتجعات المبيعات'},
  {id:'customers', title:'إدارة العملاء'},
  {id:'shipping', title:'متابعة الشحن'},
  {id:'reports', title:'التقارير والتحليلات'},
  {id:'sales-report', title:'تقارير المبيعات'},
  {id:'profit-analytics', title:'تحليل الأرباح'},
  {id:'inventory-report', title:'تقارير المخزون'},
  {id:'purchases-report', title:'تقارير المشتريات'},
  {id:'pos', title:'نقاط البيع (POS)'}
];

const navEl = q('#mainNav');
const content = q('#contentArea');
const pageTitle = q('#pageTitle');

/* ===== بناء الشريط الجانبي ===== */
function buildNav(){
  navEl.innerHTML = '';
  SECTIONS.forEach(s=>{
    const btn = document.createElement('button');
    btn.textContent = s.title;
    btn.dataset.section = s.id;
    btn.addEventListener('click', ()=> showSection(s.id));
    navEl.appendChild(btn);
  });
  navEl.querySelector('button').classList.add('active');
}

/* ===== عرض قسم ===== */
function showSection(id){
  qa('#mainNav button').forEach(b=> b.classList.toggle('active', b.dataset.section===id));
  const sec = SECTIONS.find(x=> x.id===id);
  if(sec) pageTitle.textContent = sec.title;
  renderSection(id);
}

/* ===== تحديث اختيارات (selects) في الواجهة ===== */
function mkOpt(v,t){ const o=document.createElement('option'); o.value=v; o.textContent=t; return o; }

function populateSelects(root=document){
  // products
  qa('select.sel-product', root).forEach(sel=>{
    sel.innerHTML = ''; sel.appendChild(mkOpt('','اختر منتج'));
    db.products.forEach(p=> sel.appendChild(mkOpt(p.id, `${p.name} (${p.sku||''}) - ${money(p.price)}`)));
  });
  // stores
  qa('select.sel-store', root).forEach(sel=>{
    sel.innerHTML = ''; sel.appendChild(mkOpt('','اختر مخزن'));
    db.stores.forEach(s=> sel.appendChild(mkOpt(s.id, s.name)));
  });
  // suppliers
  qa('select.sel-supplier', root).forEach(sel=>{
    sel.innerHTML=''; sel.appendChild(mkOpt('','اختر مورد'));
    db.suppliers.forEach(s=> sel.appendChild(mkOpt(s.id, s.name)));
  });
  // customers
  qa('select.sel-customer', root).forEach(sel=>{
    sel.innerHTML=''; sel.appendChild(mkOpt('','اختر عميل'));
    db.customers.forEach(c=> sel.appendChild(mkOpt(c.id, c.name)));
  });
  // categories
  qa('select.sel-category', root).forEach(sel=>{
    sel.innerHTML=''; sel.appendChild(mkOpt('','اختر صنف'));
    db.categories.forEach(c=> sel.appendChild(mkOpt(c.id, c.name)));
  });
}

/* ===== تحديث KPIs ===== */
function updateKPIs(){
  const totalStock = db.products.reduce((s,p)=> s + (p.stocks||[]).reduce((a,b)=> a + (b.qty||0), 0), 0);
  q('#kpiStock').textContent = totalStock;
  q('#kpiCustomers').textContent = db.customers.length;
}

/* ===== Render لكل قسم (مبسط وعملي) ===== */

function renderSection(id){
  content.innerHTML = '';
  switch(id){
    case 'dashboard': return renderDashboard();
    case 'categories': return renderCategories();
    case 'inventory': return renderInventory();
    case 'stores': return renderStores();
    case 'stock-moves': return renderStockMoves();
    case 'purchases': return renderPurchasesMenu();
    case 'purchase-orders': return renderPurchaseOrders();
    case 'purchase-invoices': return renderPurchaseInvoices();
    case 'purchase-returns': return renderPurchaseReturns();
    case 'suppliers': return renderSuppliers();
    case 'sales': return renderSalesMenu();
    case 'sales-invoices': return renderSalesInvoices();
    case 'sales-returns': return renderSalesReturns();
    case 'customers': return renderCustomers();
    case 'pos': return renderPOS();
    case 'accounting': return renderAccounting();
    case 'journal': return renderJournal();
    case 'reports': return renderReports();
    case 'sales-report': return renderSalesReport();
    case 'inventory-report': return renderInventoryReport();
    case 'purchases-report': return renderPurchasesReport();
    default:
      content.innerHTML = `<div class="col-12 card"><h3>قسم ${id}</h3><p class="muted">قيد التطوير البسيط — لكنه موجود كمكان وإطار عمل</p></div>`;
  }
}

/* ---------- Dashboard ---------- */
function renderDashboard(){
  content.innerHTML = `
    <div class="col-6 card">
      <h3>ملخص سريع</h3>
      <div style="display:flex;gap:12px;margin-top:8px">
        <div style="flex:1"><div class="muted">منتجات</div><div style="font-weight:800">${db.products.length}</div></div>
        <div style="flex:1"><div class="muted">المخازن</div><div style="font-weight:800">${db.stores.length}</div></div>
        <div style="flex:1"><div class="muted">مبيعات</div><div style="font-weight:800">${db.sales.length}</div></div>
      </div>
    </div>
    <div class="col-6 card">
      <h3>عمليات حديثة</h3>
      <div id="recentOps" class="muted">لا توجد عمليات بعد.</div>
    </div>

    <div class="col-12 card">
      <h3>أدوات سريعة</h3>
      <div class="row">
        <div style="flex:1"><label class="small">أضف صنف</label><div class="row"><input id="catName" placeholder="اسم الصنف"/><button class="btn" id="addCatBtn">أضف</button></div></div>
        <div style="flex:1"><label class="small">أضف مخزن</label><div class="row"><input id="storeName" placeholder="اسم المخزن"/><button class="btn" id="addStoreBtn">أضف</button></div></div>
        <div style="flex:2"><label class="small">أضف منتج</label>
          <div class="row">
            <input id="pSku" placeholder="SKU"/><input id="pName" placeholder="اسم المنتج"/>
            <select id="pCat" class="sel-category"></select><input id="pPrice" placeholder="سعر البيع" type="number"/>
            <input id="pCost" placeholder="التكلفة" type="number"/><button class="btn" id="addProdBtn">أضف منتج</button>
          </div>
        </div>
      </div>
    </div>
  `;
  populateSelects(content);
  q('#addCatBtn').addEventListener('click', ()=> {
    const name = q('#catName').value.trim(); if(!name) return alert('اكتب اسم صنف'); db.categories.push({id:uid('cat'), name}); q('#catName').value=''; populateSelects(); updateKPIs(); toast('تم إضافة صنف');
  });
  q('#addStoreBtn').addEventListener('click', ()=> {
    const name = q('#storeName').value.trim(); if(!name) return alert('اكتب اسم مخزن'); db.stores.push({id:uid('st'), name, location:''}); q('#storeName').value=''; populateSelects(); updateKPIs(); toast('تم إضافة مخزن');
  });
  q('#addProdBtn').addEventListener('click', ()=> {
    const sku=q('#pSku').value.trim(), name=q('#pName').value.trim(), cat=q('#pCat').value, price=Number(q('#pPrice').value)||0, cost=Number(q('#pCost').value)||0;
    if(!name) return alert('اكتب اسم المنتج'); db.products.push({id:uid('pr'), sku, name, categoryId:cat, price, cost, stocks:[]}); q('#pSku').value=''; q('#pName').value=''; q('#pPrice').value=''; q('#pCost').value=''; populateSelects(); updateKPIs(); toast('تم إضافة منتج');
  });
  renderRecentOps();
}

/* ---------- Categories & Products ---------- */
function renderCategories(){
  content.innerHTML = `
    <div class="col-6 card">
      <h3>الأصناف</h3>
      <div><input id="newCat" placeholder="اسم الصنف"/> <button class="btn" id="addCat2">إضافة</button></div>
      <table style="margin-top:12px"><thead><tr><th>الاسم</th><th>إجراء</th></tr></thead><tbody id="catsBody"></tbody></table>
    </div>
    <div class="col-6 card">
      <h3>المنتجات</h3>
      <div style="display:flex;gap:8px;align-items:center">
        <input id="searchProd" placeholder="بحث باسم أو SKU" />
        <button class="btn ghost" id="btnRefreshProds">تحديث</button>
      </div>
      <table style="margin-top:12px"><thead><tr><th>SKU</th><th>الاسم</th><th>الصنف</th><th>السعر</th><th>المخزون</th><th>إجراءات</th></tr></thead><tbody id="prodsBody"></tbody></table>
    </div>
  `;
  q('#addCat2').addEventListener('click', ()=> {
    const name = q('#newCat').value.trim(); if(!name) return alert('اسم'); db.categories.push({id:uid('cat'), name}); q('#newCat').value=''; populateSelects(); renderCategories();
  });
  q('#btnRefreshProds').addEventListener('click', ()=> renderCategories());
  q('#searchProd').addEventListener('input', ()=> renderCategories());
  // list
  const cb=q('#catsBody'); cb.innerHTML=''; db.categories.forEach(c=> {
    const tr=document.createElement('tr'); tr.innerHTML=`<td>${c.name}</td><td><button class="btn ghost" data-id="${c.id}">حذف</button></td>`; cb.appendChild(tr);
    tr.querySelector('button').addEventListener('click', ()=> { if(confirm('هل تريد حذف الصنف؟')) db.categories = db.categories.filter(x=> x.id!==c.id); populateSelects(); renderCategories(); updateKPIs(); });
  });
  const pb=q('#prodsBody'); pb.innerHTML=''; const qtxt=q('#searchProd').value.trim().toLowerCase();
  db.products.filter(p=> !qtxt || (p.name + p.sku).toLowerCase().includes(qtxt)).forEach(p=>{
    const total = (p.stocks||[]).reduce((s,x)=> s + (x.qty||0),0);
    const cat = db.categories.find(cc=> cc.id===p.categoryId) || {};
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${p.sku||''}</td><td>${p.name}</td><td>${cat.name||'-'}</td><td>${money(p.price)}</td><td>${total}</td><td><button class="btn ghost" data-id="${p.id}">تفاصيل</button></td>`;
    pb.appendChild(tr);
    tr.querySelector('button').addEventListener('click', ()=> alert(`المنتج: ${p.name}\nSKU: ${p.sku}\nسعر: ${money(p.price)}\nتكلفة: ${money(p.cost)}\nالمخزون: ${total}`));
  });
  populateSelects();
}

/* ---------- Inventory ---------- */
function renderInventory(){
  content.innerHTML = `
    <div class="col-12 card">
      <h3>إدارة المخزون</h3>
      <div class="row" style="margin-bottom:8px">
        <select class="sel-product sel-product-inv"></select>
        <select class="sel-store sel-store-inv"></select>
        <input id="invQty" type="number" placeholder="كمية" value="1"/>
        <button class="btn" id="addStockBtn">إضافة للمخزن</button>
      </div>
      <table><thead><tr><th>المنتج</th><th>مخزن</th><th>الكمية</th></tr></thead><tbody id="invTable"></tbody></table>
    </div>
  `;
  populateSelects(content);
  q('#addStockBtn').addEventListener('click', ()=> {
    const pid=q('.sel-product-inv').value, store=q('.sel-store-inv').value, qty=Number(q('#invQty').value)||0;
    if(!pid || !store || qty<=0) return alert('اختر منتج/مخزن وكمية صحيحة');
    const p = db.products.find(x=> x.id===pid);
    if(!p.stocks) p.stocks=[];
    let s = p.stocks.find(x=> x.storeId===store);
    if(!s) p.stocks.push({storeId:store, qty}); else s.qty += qty;
    db.stockMoves.push({id:uid('mv'), productId:pid, fromStoreId:null, toStoreId:store, qty, reason:'إضافة مخزون', date:new Date().toISOString()});
    toast('تمت إضافة كمية'); renderInventory(); updateKPIs(); renderRecentOps();
  });
  const tb=q('#invTable'); tb.innerHTML='';
  db.products.forEach(p=>{
    (p.stocks||[]).forEach(s=>{
      const store = db.stores.find(st=> st.id===s.storeId) || {};
      const tr=document.createElement('tr'); tr.innerHTML=`<td>${p.name}</td><td>${store.name||'-'}</td><td>${s.qty}</td>`; tb.appendChild(tr);
    });
  });
}

/* ---------- Stores ---------- */
function renderStores(){
  content.innerHTML = `
    <div class="col-12 card">
      <h3>المخازن والفروع</h3>
      <div class="row"><input id="newStore" placeholder="اسم المخزن"/><button class="btn" id="addStoreBtn2">إضافة</button></div>
      <table style="margin-top:10px"><thead><tr><th>الاسم</th><th>مجموع المخزون</th></tr></thead><tbody id="storesBody"></tbody></table>
    </div>
  `;
  q('#addStoreBtn2').addEventListener('click', ()=> {
    const n=q('#newStore').value.trim(); if(!n) return alert('اكتب اسم'); db.stores.push({id:uid('st'), name:n, location:''}); q('#newStore').value=''; populateSelects(); updateKPIs(); toast('تم إضافة مخزن');
    renderStores();
  });
  const sb=q('#storesBody'); sb.innerHTML='';
  db.stores.forEach(s=>{
    const total = db.products.reduce((sum,p)=> sum + (p.stocks.find(x=> x.storeId===s.id)?.qty||0),0);
    const tr=document.createElement('tr'); tr.innerHTML=`<td>${s.name}</td><td>${total}</td>`; sb.appendChild(tr);
  });
  populateSelects();
}

/* ---------- Stock Moves ---------- */
function renderStockMoves(){
  content.innerHTML = `
    <div class="col-6 card">
      <h3>نقل / تعديل</h3>
      <div><select class="sel-product sel-product-single"></select><select class="sel-store sel-store-from"></select><select class="sel-store sel-store-to"></select><input id="moveQty" type="number" value="1"/><input id="moveReason" placeholder="سبب"/><button class="btn" id="doMove">تنفيذ</button></div>
    </div>
    <div class="col-6 card">
      <h3>سجل الحركات</h3>
      <table><thead><tr><th>المنتج</th><th>من</th><th>إلى</th><th>كمية</th><th>الوقت</th></tr></thead><tbody id="movesTable"></tbody></table>
    </div>
  `;
  populateSelects(content);
  q('#doMove').addEventListener('click', ()=> {
    const pid=q('.sel-product-single').value, from=q('.sel-store-from').value, to=q('.sel-store-to').value, qty=Number(q('#moveQty').value)||0, reason=q('#moveReason').value||'';
    if(!pid || qty<=0) return alert('اختر منتج وكمية صحيحة');
    const p = db.products.find(x=> x.id===pid);
    if(from){
      let s = p.stocks.find(x=> x.storeId===from);
      if(!s || s.qty < qty) return alert('كمية غير كافية في المخزن المصدر');
      s.qty -= qty;
    }
    if(to){
      let s2 = p.stocks.find(x=> x.storeId===to);
      if(!s2) p.stocks.push({storeId:to, qty}); else s2.qty += qty;
    }
    db.stockMoves.push({id:uid('mv'), productId:pid, fromStoreId:from||null, toStoreId:to||null, qty, reason, date:new Date().toISOString()});
    toast('تمت الحركة'); renderStockMoves(); updateKPIs(); renderRecentOps();
  });
  const tb=q('#movesTable'); tb.innerHTML='';
  db.stockMoves.slice().reverse().forEach(m=>{
    const p=db.products.find(x=>x.id===m.productId)||{}; const fr=db.stores.find(x=>x.id===m.fromStoreId)||{}; const to=db.stores.find(x=>x.id===m.toStoreId)||{};
    const tr=document.createElement('tr'); tr.innerHTML=`<td>${p.name||'-'}</td><td>${fr.name||'—'}</td><td>${to.name||'—'}</td><td>${m.qty}</td><td>${(new Date(m.date)).toLocaleString()}</td>`; tb.appendChild(tr);
  });
}

/* ---------- Purchases ---------- */
function renderPurchasesMenu(){
  content.innerHTML = `<div class="col-12 card"><h3>المشتريات</h3><div class="row"><button class="btn" id="toPO">طلبات الشراء</button><button class="btn" id="toPI">فواتير الموردين</button><button class="btn" id="toPR">مرتجعات</button></div></div>`;
  q('#toPO').addEventListener('click', ()=> showSection('purchase-orders'));
  q('#toPI').addEventListener('click', ()=> showSection('purchase-invoices'));
  q('#toPR').addEventListener('click', ()=> showSection('purchase-returns'));
}

function renderPurchaseOrders(){
  content.innerHTML = `
    <div class="col-12 card">
      <h3>طلبات الشراء (إنشاء)</h3>
      <div class="row">
        <select class="sel-supplier"></select><select class="sel-product sel-product-purchase"></select><input id="poQty" type="number" value="1"/><input id="poPrice" type="number" placeholder="سعر"/><select class="sel-store sel-store-purchase"></select>
        <button class="btn" id="addPOItem">أضف</button><button class="btn ghost" id="createPO">إنشاء طلب</button>
      </div>
      <table style="margin-top:10px"><thead><tr><th>منتج</th><th>كمية</th><th>سعر</th><th>مخزن</th></tr></thead><tbody id="poItems"></tbody></table>
    </div>
  `;
  populateSelects(content);
  const items=[];
  q('#addPOItem').addEventListener('click', ()=> {
    const pid=q('.sel-product-purchase').value, qty=Number(q('#poQty').value)||0, price=Number(q('#poPrice').value)||0, store=q('.sel-store-purchase').value;
    if(!pid||qty<=0) return alert('اختر منتج وكمية'); items.push({productId:pid,qty,price,storeId:store}); renderPOItems();
  });
  function renderPOItems(){ const tb=q('#poItems'); tb.innerHTML=''; items.forEach(it=>{ const p=db.products.find(x=>x.id===it.productId)||{}; const s=db.stores.find(x=>x.id===it.storeId)||{}; const tr=document.createElement('tr'); tr.innerHTML=`<td>${p.name||''}</td><td>${it.qty}</td><td>${money(it.price)}</td><td>${s.name||''}</td>`; tb.appendChild(tr); }); }
  q('#createPO').addEventListener('click', ()=> {
    const sup=q('.sel-supplier').value; if(!sup) return alert('اختر مورد'); if(!items.length) return alert('أضف عناصر');
    db.purchases.push({id:uid('po'), supplierId:sup, items:items.slice(), total: items.reduce((s,i)=> s + i.qty*i.price,0), date:new Date().toISOString(), type:'order'}); items.length=0; renderPOItems(); toast('تم إنشاء طلب'); renderRecentOps();
  });
}

/* Purchase Invoices */
function renderPurchaseInvoices(){
  content.innerHTML = `
    <div class="col-12 card">
      <h3>فواتير الموردين (استلام)</h3>
      <div class="row">
        <select class="sel-supplier"></select><select class="sel-product sel-product-purchase-inv"></select><input id="piQty" type="number" value="1"/><input id="piPrice" type="number" placeholder="سعر"/><select class="sel-store sel-store-purchase-inv"></select>
        <button class="btn" id="addPIItem">أضف</button><button class="btn ghost" id="createPI">تسجيل الفاتورة</button>
      </div>
      <table style="margin-top:10px"><thead><tr><th>منتج</th><th>كمية</th><th>سعر</th><th>مخزن</th></tr></thead><tbody id="piItems"></tbody></table>
    </div>
  `;
  populateSelects(content);
  const items=[];
  q('#addPIItem').addEventListener('click', ()=> {
    const pid=q('.sel-product-purchase-inv').value, qty=Number(q('#piQty').value)||0, price=Number(q('#piPrice').value)||0, store=q('.sel-store-purchase-inv').value;
    if(!pid||qty<=0||!store) return alert('اختر'); items.push({productId:pid,qty,price,storeId:store}); renderPIItems();
  });
  function renderPIItems(){ const tb=q('#piItems'); tb.innerHTML=''; items.forEach(it=>{ const p=db.products.find(x=>x.id===it.productId)||{}; const s=db.stores.find(x=>x.id===it.storeId)||{}; const tr=document.createElement('tr'); tr.innerHTML=`<td>${p.name||''}</td><td>${it.qty}</td><td>${money(it.price)}</td><td>${s.name||''}</td>`; tb.appendChild(tr); }); }
  q('#createPI').addEventListener('click', ()=> {
    const sup=q('.sel-supplier').value; if(!sup) return alert('اختر مورد'); if(!items.length) return alert('أضف عناصر');
    const inv={id:uid('pi'), supplierId:sup, items:items.slice(), total: items.reduce((s,i)=> s + i.qty*i.price,0), date:new Date().toISOString(), type:'invoice'};
    // add stock
    inv.items.forEach(it=> {
      const p=db.products.find(x=> x.id===it.productId);
      if(!p.stocks) p.stocks=[];
      let s = p.stocks.find(x=> x.storeId===it.storeId);
      if(!s) p.stocks.push({storeId: it.storeId, qty: it.qty}); else s.qty += it.qty;
    });
    db.purchases.push(inv); items.length=0; renderPurchaseInvoices(); toast('تمت الفاتورة وإضافة المخزون'); updateKPIs(); renderRecentOps();
  });
}

/* Purchase Returns */
function renderPurchaseReturns(){
  content.innerHTML = `
    <div class="col-12 card">
      <h3>مرتجعات المشتريات</h3>
      <select class="sel-product sel-product-return"></select><select class="sel-store sel-store-return"></select><input id="prQty" type="number" value="1"/><button class="btn" id="doPR">سجل المرتجع</button>
    </div>
  `;
  populateSelects(content);
  q('#doPR').addEventListener('click', ()=> {
    const pid=q('.sel-product-return').value, store=q('.sel-store-return').value, qty=Number(q('#prQty').value)||0;
    if(!pid||!store||qty<=0) return alert('اختر'); const p=db.products.find(x=> x.id===pid); const s = p.stocks.find(x=> x.storeId===store);
    if(!s || s.qty < qty) return alert('لا توجد كمية كافية'); s.qty -= qty;
    db.purchases.push({id:uid('pr'), supplierId:null, items:[{productId:pid,qty}], total:0, date:new Date().toISOString(), type:'return'});
    toast('تم تسجيل المرتجع'); renderPurchaseReturns(); updateKPIs(); renderRecentOps();
  });
}

/* ---------- Suppliers ---------- */
function renderSuppliers(){
  content.innerHTML = `
    <div class="col-6 card">
      <h3>الموردين</h3>
      <div class="row"><input id="supName" placeholder="اسم المورد"/><input id="supPhone" placeholder="هاتف"/><button class="btn" id="addSup">أضف مورد</button></div>
      <table style="margin-top:10px"><thead><tr><th>الاسم</th><th>هاتف</th><th>الرصيد</th></tr></thead><tbody id="supBody"></tbody></table>
    </div>
    <div class="col-6 card">
      <h3>تفاصيل مورد</h3>
      <select class="sel-supplier"></select>
      <div id="supplierDetail" class="muted" style="margin-top:8px">اختر مورد لعرض التفاصيل</div>
    </div>
  `;
  q('#addSup').addEventListener('click', ()=> {
    const n=q('#supName').value.trim(), ph=q('#supPhone').value.trim(); if(!n) return alert('اكتب اسم'); db.suppliers.push({id:uid('sup'), name:n, phone:ph, balance:0}); q('#supName').value=''; q('#supPhone').value=''; renderSuppliers(); populateSelects(); renderRecentOps();
  });
  const sb=q('#supBody'); sb.innerHTML=''; db.suppliers.forEach(s=> { const tr=document.createElement('tr'); tr.innerHTML=`<td>${s.name}</td><td>${s.phone||''}</td><td>${money(s.balance)}</td>`; sb.appendChild(tr); });
  q('.sel-supplier').addEventListener('change', ()=> {
    const id=q('.sel-supplier').value; const s=db.suppliers.find(x=>x.id===id);
    q('#supplierDetail').textContent = s ? `${s.name} — هاتف: ${s.phone||'-'} — رصيد: ${money(s.balance)}` : 'اختر مورد';
  });
  populateSelects();
}

/* ---------- Sales ---------- */
function renderSalesMenu(){
  content.innerHTML = `<div class="col-12 card"><h3>المبيعات</h3><div class="row"><button class="btn" id="toSI">فواتير البيع</button><button class="btn" id="toSR">مرتجعات المبيعات</button><button class="btn" id="toPOS">نقطة البيع</button></div></div>`;
  q('#toSI').addEventListener('click', ()=> showSection('sales-invoices'));
  q('#toSR').addEventListener('click', ()=> showSection('sales-returns'));
  q('#toPOS').addEventListener('click', ()=> showSection('pos'));
}

function renderSalesInvoices(){
  content.innerHTML = `
    <div class="col-12 card">
      <h3>فواتير البيع</h3>
      <div class="row">
        <select class="sel-customer"></select><select class="sel-product sel-product-sale"></select><input id="siQty" type="number" value="1"/><input id="siPrice" type="number" placeholder="سعر"/><select class="sel-store sel-store-sale"></select>
        <button class="btn" id="addSIItem">أضف</button><button class="btn ghost" id="createSI">تسجيل الفاتورة</button>
      </div>
      <table style="margin-top:10px"><thead><tr><th>منتج</th><th>كمية</th><th>سعر</th><th>مخزن</th></tr></thead><tbody id="siItems"></tbody></table>
    </div>
  `;
  populateSelects(content);
  const items=[];
  q('#addSIItem').addEventListener('click', ()=> {
    const pid=q('.sel-product-sale').value, qty=Number(q('#siQty').value)||0, price=Number(q('#siPrice').value)||0, store=q('.sel-store-sale').value;
    if(!pid||qty<=0||!store) return alert('اختر منتج وكمية ومخزن'); const p=db.products.find(x=> x.id===pid); const stock=(p.stocks.find(x=> x.storeId===store)?.qty||0);
    if(stock < qty) return alert('كمية غير كافية'); items.push({productId:pid, qty, price, storeId:store}); renderSIItems();
  });
  function renderSIItems(){ const tb=q('#siItems'); tb.innerHTML=''; items.forEach(it=>{ const p=db.products.find(x=>x.id===it.productId)||{}; const s=db.stores.find(x=>x.id===it.storeId)||{}; const tr=document.createElement('tr'); tr.innerHTML=`<td>${p.name||''}</td><td>${it.qty}</td><td>${money(it.price)}</td><td>${s.name||''}</td>`; tb.appendChild(tr); }); }
  q('#createSI').addEventListener('click', ()=> {
    const cust=q('.sel-customer').value; if(!cust) return alert('اختر عميل'); if(!items.length) return alert('أضف عناصر');
    items.forEach(it=> { const p=db.products.find(x=> x.id===it.productId); const s=p.stocks.find(x=> x.storeId===it.storeId); if(s) s.qty -= it.qty; });
    const inv={id:uid('si'), customerId:cust, items: items.slice(), total: items.reduce((a,b)=> a + b.qty*b.price,0), date:new Date().toISOString(), type:'invoice'};
    db.sales.push(inv); items.length=0; renderSalesInvoices(); toast('تم تسجيل الفاتورة'); updateKPIs(); renderRecentOps();
  });
}

/* Sales Returns */
function renderSalesReturns(){
  content.innerHTML = `<div class="col-12 card"><h3>مرتجعات المبيعات</h3><select class="sel-product sel-product-return-sales"></select><select class="sel-store sel-store-return-sales"></select><input id="srQty" type="number" value="1"/><button class="btn" id="doSR">سجل المرتجع</button></div>`;
  populateSelects(content);
  q('#doSR').addEventListener('click', ()=> {
    const pid=q('.sel-product-return-sales').value, store=q('.sel-store-return-sales').value, qty=Number(q('#srQty').value)||0;
    if(!pid||!store||qty<=0) return alert('اختر'); const p=db.products.find(x=> x.id===pid); let s=p.stocks.find(x=> x.storeId===store); if(!s) p.stocks.push({storeId:store, qty}); else s.qty += qty;
    db.sales.push({id:uid('sr'), customerId:null, items:[{productId:pid,qty}], total:0, date:new Date().toISOString(), type:'return'}); toast('تم تسجيل المرتجع'); updateKPIs(); renderRecentOps();
  });
}

/* ---------- Customers ---------- */
function renderCustomers(){
  content.innerHTML = `
    <div class="col-6 card">
      <h3>إدارة العملاء</h3>
      <div class="row"><input id="custName" placeholder="اسم العميل"/><input id="custPhone" placeholder="هاتف"/><button class="btn" id="addCust">أضف</button></div>
      <table style="margin-top:10px"><thead><tr><th>الاسم</th><th>هاتف</th><th>الرصيد</th></tr></thead><tbody id="custBody"></tbody></table>
    </div>
    <div class="col-6 card">
      <h3>تفاصيل عميل</h3>
      <select class="sel-customer"></select>
      <div id="custDetail" class="muted" style="margin-top:8px">اختر عميل لعرض التفاصيل</div>
    </div>
  `;
  q('#addCust').addEventListener('click', ()=> {
    const n=q('#custName').value.trim(), ph=q('#custPhone').value.trim(); if(!n) return alert('اكتب اسم'); db.customers.push({id:uid('cus'), name:n, phone:ph, balance:0}); q('#custName').value=''; q('#custPhone').value=''; renderCustomers(); populateSelects(); renderRecentOps();
  });
  const tb=q('#custBody'); tb.innerHTML=''; db.customers.forEach(c=> { const tr=document.createElement('tr'); tr.innerHTML=`<td>${c.name}</td><td>${c.phone||''}</td><td>${money(c.balance)}</td>`; tb.appendChild(tr); });
  q('.sel-customer').addEventListener('change', ()=> { const id=q('.sel-customer').value; const c=db.customers.find(x=>x.id===id); q('#custDetail').textContent = c ? `${c.name} — هاتف: ${c.phone||'-'} — رصيد: ${money(c.balance)}` : 'اختر عميل'; });
  populateSelects();
}

/* ---------- POS ---------- */
function renderPOS(){
  content.innerHTML = `
    <div class="col-6 card">
      <h3>نقطة البيع (POS)</h3>
      <div class="row">
        <select class="sel-product sel-product-pos"></select><input id="posQty" type="number" value="1" style="width:80px"/><select class="sel-store sel-store-pos"></select><button class="btn" id="posAdd">أضف للسلة</button>
      </div>
      <table style="margin-top:10px"><thead><tr><th>المنتج</th><th>كمية</th><th>سعر</th><th>إجراءات</th></tr></thead><tbody id="posCart"></tbody></table>
      <div style="margin-top:8px"><strong>الإجمالي:</strong> <span id="posTotal">0.00</span></div>
      <div style="margin-top:8px"><select class="sel-customer"></select><button class="btn" id="posPay">إنهاء البيع</button></div>
    </div>
    <div class="col-6 card">
      <h3>سجل المبيعات</h3>
      <div id="posRecent" class="muted">لا توجد مبيعات بعد.</div>
    </div>
  `;
  populateSelects(content);
  const cart=[];
  q('#posAdd').addEventListener('click', ()=> {
    const pid=q('.sel-product-pos').value, qty=Number(q('#posQty').value)||0, store=q('.sel-store-pos').value;
    if(!pid||qty<=0||!store) return alert('اختر منتج وكمية ومخزن');
    const p=db.products.find(x=> x.id===pid); const stock=p.stocks.find(x=> x.storeId===store)?.qty||0;
    if(stock < qty) return alert('كمية غير كافية بالمخزن');
    cart.push({productId:pid, qty, price:p.price, storeId:store}); renderCart();
  });
  function renderCart(){ const tb=q('#posCart'); tb.innerHTML=''; cart.forEach((it,i)=>{ const p=db.products.find(x=> x.id===it.productId)||{}; const tr=document.createElement('tr'); tr.innerHTML=`<td>${p.name}</td><td>${it.qty}</td><td>${money(it.price)}</td><td><button class="btn ghost" data-i="${i}">حذف</button></td>`; tb.appendChild(tr); tr.querySelector('button').addEventListener('click', ()=> { cart.splice(i,1); renderCart(); }); }); q('#posTotal').textContent = money(cart.reduce((s,x)=> s + x.qty*x.price,0)); }
  q('#posPay').addEventListener('click', ()=> {
    const cust=q('.sel-customer').value || null; if(!cart.length) return alert('السلة فارغة');
    cart.forEach(it=> { const p=db.products.find(x=> x.id===it.productId); const s=p.stocks.find(x=> x.storeId===it.storeId); if(s) s.qty -= it.qty; });
    const sale={id:uid('si'), customerId:cust, items: cart.slice(), total: cart.reduce((s,x)=> s + x.qty*x.price,0), date:new Date().toISOString(), type:'invoice'};
    db.sales.push(sale); cart.length=0; renderPOS(); toast('تمت عملية البيع'); updateKPIs(); renderRecentOps();
  });
}

/* ---------- Accounting (مبسط) ---------- */
function renderAccounting(){
  content.innerHTML = `
    <div class="col-6 card"><h3>قيود سريعة</h3><input id="jeDesc" placeholder="بيان"/><input id="jeDebit" type="number" placeholder="مدين"/><input id="jeCredit" type="number" placeholder="دائن"/><button class="btn" id="addJE">أضف قيد</button></div>
    <div class="col-6 card"><h3>قائمة القيود</h3><table><thead><tr><th>البيان</th><th>مدين</th><th>دائن</th><th>الوقت</th></tr></thead><tbody id="jeBody"></tbody></table></div>
  `;
  q('#addJE').addEventListener('click', ()=> {
    const desc=q('#jeDesc').value.trim(), d=Number(q('#jeDebit').value)||0, c=Number(q('#jeCredit').value)||0;
    if(!desc) return alert('اكتب البيان'); db.journals.push({id:uid('je'), desc, debits:d, credits:c, date:new Date().toISOString()}); q('#jeDesc').value=''; q('#jeDebit').value=''; q('#jeCredit').value=''; renderAccounting();
  });
  const jb=q('#jeBody'); jb.innerHTML=''; db.journals.slice().reverse().forEach(j=> { const tr=document.createElement('tr'); tr.innerHTML=`<td>${j.desc}</td><td>${money(j.debits)}</td><td>${money(j.credits)}</td><td>${(new Date(j.date)).toLocaleString()}</td>`; jb.appendChild(tr); });
}

/* Journal placeholder */
function renderJournal(){ content.innerHTML = `<div class="col-12 card"><h3>قيود اليومية (تفصيل لاحق)</h3></div>`; }

/* Reports */
function renderReports(){ content.innerHTML = `<div class="col-12 card"><h3>التقارير</h3><div class="row"><button class="btn" id="rSales">تقارير المبيعات</button><button class="btn" id="rInv">تقارير المخزون</button><button class="btn" id="rProfit">تحليل الأرباح</button></div></div>`; q('#rSales').addEventListener('click', ()=> showSection('sales-report')); q('#rInv').addEventListener('click', ()=> showSection('inventory-report')); q('#rProfit').addEventListener('click', ()=> showSection('profit-analytics')); }

function renderSalesReport(){
  const rows = db.sales.map(s=> `<tr><td>${s.id}</td><td>${s.type}</td><td>${(new Date(s.date)).toLocaleString()}</td><td>${money(s.total)}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">لا توجد فواتير</td></tr>';
  content.innerHTML = `<div class="col-12 card"><h3>تقارير المبيعات</h3><table><thead><tr><th>مرجع</th><th>النوع</th><th>الوقت</th><th>المجموع</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderInventoryReport(){
  const rows = db.products.map(p=> { const tot = (p.stocks||[]).reduce((s,x)=> s + (x.qty||0),0); return `<tr><td>${p.sku||''}</td><td>${p.name}</td><td>${tot}</td><td>${money(p.cost)}</td></tr>`; }).join('') || '<tr><td colspan="4" class="muted">لا توجد منتجات</td></tr>';
  content.innerHTML = `<div class="col-12 card"><h3>تقارير المخزون</h3><table><thead><tr><th>SKU</th><th>اسم</th><th>المخزون</th><th>تكلفة</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderPurchasesReport(){
  const rows = db.purchases.map(p=> `<tr><td>${p.id}</td><td>${p.type}</td><td>${(new Date(p.date)).toLocaleString()}</td><td>${money(p.total)}</td></tr>`).join('') || '<tr><td colspan="4" class="muted">لا توجد</td></tr>';
  content.innerHTML = `<div class="col-12 card"><h3>تقارير المشتريات</h3><table><thead><tr><th>مرجع</th><th>النوع</th><th>الوقت</th><th>المجموع</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* ---------- واجهات مساعدة ---------- */
function toast(msg, t=1600){
  let el = document.getElementById('__toast__'); if(!el){ el=document.createElement('div'); el.id='__toast__'; el.style.position='fixed'; el.style.left='18px'; el.style.bottom='18px'; el.style.padding='10px 14px'; el.style.borderRadius='10px'; el.style.background='rgba(3,105,110,0.95)'; el.style.color='#fff'; el.style.zIndex=99999; document.body.appendChild(el); }
  el.textContent = msg; el.style.opacity='1'; setTimeout(()=> el.style.opacity='0', t);
}
function renderRecentOps(){
  const el=q('#recentOps'); if(!el) return;
  const ops = [].concat(db.purchases.slice(-5), db.sales.slice(-5), db.stockMoves.slice(-5)).slice(-8).reverse();
  if(!ops.length){ el.textContent='لا توجد عمليات بعد.'; return; }
  el.innerHTML = ops.map(o=> `<div style="margin-bottom:6px">${o.type || 'حركة'} — ${(new Date(o.date)).toLocaleString()} — ${money(o.total || 0)}</div>`).join('');
}

/* ---------- Utilities: reset/export/search ---------- */
q('#btnReset').addEventListener('click', ()=> {
  if(confirm('إعادة ضبط كل بيانات الجلسة؟ (سيتم مسح كل شيء في الذاكرة)')){ for(const k in db) if(Array.isArray(db[k])) db[k].length=0; buildNav(); showSection('dashboard'); populateSelects(); updateKPIs(); toast('تمت إعادة الضبط'); }
});
q('#btnExport').addEventListener('click', ()=> {
  const blob = new Blob([JSON.stringify(db, null, 2)], {type:'application/json'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='session_export.json'; a.click(); URL.revokeObjectURL(url);
});
q('#btnToggleDir').addEventListener('click', ()=> { document.documentElement.dir = document.documentElement.dir === 'rtl' ? 'ltr' : 'rtl'; });
q('#quickSearch').addEventListener('input', (e)=> {
  const v = e.target.value.trim().toLowerCase(); if(!v) return;
  const p = db.products.find(x=> (x.name + ' ' + (x.sku||'')).toLowerCase().includes(v));
  if(p){ showSection('categories'); setTimeout(()=> alert('نتيجة: ' + p.name), 200); return; }
  const c = db.customers.find(x=> x.name.toLowerCase().includes(v)); if(c){ showSection('customers'); setTimeout(()=> alert('نتيجة: ' + c.name), 200); return; }
});
const invoices = [];
const invoiceBody = document.getElementById('invoiceBody');
document.getElementById('addInvoice').addEventListener('click', ()=>{
  const c = invoiceCustomer.value;
  const p = invoiceProduct.value;
  const q = Number(invoiceQty.value)||0;
  const pr = Number(invoicePrice.value)||0;
  if(!c||!p||q<=0||pr<=0){ alert("أدخل بيانات صحيحة"); return; }
  const total = q*pr;
  const invoice = {id:Date.now(), c,p,q,pr,total};
  invoices.push(invoice);
  renderInvoices();
});

function renderInvoices(){
  invoiceBody.innerHTML = '';
  invoices.forEach(inv=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${inv.c}</td>
      <td>${inv.p}</td>
      <td>${inv.q}</td>
      <td>${inv.pr}</td>
      <td>${inv.total}</td>
      <td>
        <button onclick="printInvoice(${inv.id})" class="btn">🖨️ طباعة</button>
      </td>
    `;
    invoiceBody.appendChild(tr);
  });
}

function printInvoice(id){
  const inv = invoices.find(x=>x.id===id);
  if(!inv) return;
  const win = window.open('', 'PRINT', 'height=600,width=800');
  win.document.write(`
    <html><head><title>فاتورة</title>
    <style>
      body{font-family:Tahoma;margin:20px;}
      h2{text-align:center;}
      table{width:100%;border-collapse:collapse;margin-top:20px;}
      td,th{border:1px solid #ccc;padding:8px;text-align:center;}
    </style>
    </head><body>
      <h2>فاتورة بيع</h2>
      <table>
        <tr><th>العميل</th><td>${inv.c}</td></tr>
        <tr><th>المنتج</th><td>${inv.p}</td></tr>
        <tr><th>الكمية</th><td>${inv.q}</td></tr>
        <tr><th>السعر</th><td>${inv.pr}</td></tr>
        <tr><th>الإجمالي</th><td>${inv.total}</td></tr>
      </table>
      <p style="margin-top:40px;text-align:center">شكراً لتعاملكم معنا 🌸</p>
    </body></html>
  `);
  win.document.close();
  win.print();
}


/* ---------- Profit Analytics ---------- */
function renderProfitAnalytics(){
  // حساب الأرباح: لكل فاتورة بيع نحسب (الكمية * (سعر البيع - التكلفة))
  let totalRevenue = 0, totalCost = 0, totalProfit = 0;
  const rows = [];

  db.sales.forEach(sale=>{
    sale.items.forEach(it=>{
      const p = db.products.find(x=> x.id===it.productId) || {};
      const revenue = it.qty * it.price;
      const cost = it.qty * (p.cost || 0);
      const profit = revenue - cost;
      totalRevenue += revenue;
      totalCost += cost;
      totalProfit += profit;
      rows.push(`
        <tr>
          <td>${p.name || '—'}</td>
          <td>${it.qty}</td>
          <td>${money(it.price)}</td>
          <td>${money(p.cost || 0)}</td>
          <td>${money(revenue)}</td>
          <td>${money(cost)}</td>
          <td>${money(profit)}</td>
        </tr>
      `);
    });
  });

  content.innerHTML = `
    <div class="col-12 card">
      <h3>تحليل الأرباح</h3>
      <table>
        <thead>
          <tr>
            <th>المنتج</th>
            <th>الكمية</th>
            <th>سعر البيع</th>
            <th>التكلفة</th>
            <th>الإيراد</th>
            <th>إجمالي التكلفة</th>
            <th>الربح</th>
          </tr>
        </thead>
        <tbody>
          ${rows.join('') || '<tr><td colspan="7" class="muted">لا توجد بيانات بعد</td></tr>'}
        </tbody>
      </table>
      <div style="margin-top:12px;font-weight:700">
        إجمالي الإيرادات: ${money(totalRevenue)} — 
        إجمالي التكلفة: ${money(totalCost)} — 
        صافي الربح: ${money(totalProfit)}
      </div>
    </div>
  `;
}

/* ---------- Quotes (عروض الأسعار) ---------- */
function renderQuotes(){
  content.innerHTML = `
    <div class="col-12 card">
      <h3>عروض الأسعار</h3>
      <div class="row">
        <select class="sel-customer"></select>
        <select class="sel-product sel-product-quote"></select>
        <input id="qQty" type="number" value="1"/>
        <input id="qPrice" type="number" placeholder="سعر"/>
        <button class="btn" id="addQItem">أضف</button>
        <button class="btn ghost" id="createQ">إنشاء العرض</button>
      </div>
      <table style="margin-top:10px">
        <thead>
          <tr><th>منتج</th><th>كمية</th><th>سعر</th></tr>
        </thead>
        <tbody id="qItems"></tbody>
      </table>
    </div>
  `;
  populateSelects(content);

  const items=[];
  q('#addQItem').addEventListener('click', ()=>{
    const pid=q('.sel-product-quote').value, qty=Number(q('#qQty').value)||0, price=Number(q('#qPrice').value)||0;
    if(!pid||qty<=0) return alert('اختر منتج وكمية');
    items.push({productId:pid, qty, price});
    renderQItems();
  });

  function renderQItems(){
    const tb=q('#qItems'); tb.innerHTML='';
    items.forEach(it=>{
      const p=db.products.find(x=>x.id===it.productId)||{};
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${p.name||''}</td><td>${it.qty}</td><td>${money(it.price)}</td>`;
      tb.appendChild(tr);
    });
  }

  q('#createQ').addEventListener('click', ()=>{
    const cust=q('.sel-customer').value; if(!cust) return alert('اختر عميل');
    if(!items.length) return alert('أضف عناصر');
    const qDoc={id:uid('q'), customerId:cust, items:items.slice(), total:items.reduce((s,i)=> s+i.qty*i.price,0), date:new Date().toISOString(), type:'quote'};
    db.sales.push(qDoc); items.length=0; renderQuotes();
    toast('تم إنشاء عرض السعر'); renderRecentOps();
  });
}

/* ---------- Sales Orders (أوامر المبيعات) ---------- */
function renderSalesOrders(){
  content.innerHTML = `
    <div class="col-12 card">
      <h3>أوامر المبيعات</h3>
      <div class="row">
        <select class="sel-customer"></select>
        <select class="sel-product sel-product-order"></select>
        <input id="soQty" type="number" value="1"/>
        <input id="soPrice" type="number" placeholder="سعر"/>
        <select class="sel-store sel-store-order"></select>
        <button class="btn" id="addSOItem">أضف</button>
        <button class="btn ghost" id="createSO">إنشاء الطلب</button>
      </div>
      <table style="margin-top:10px">
        <thead>
          <tr><th>منتج</th><th>كمية</th><th>سعر</th><th>مخزن</th></tr>
        </thead>
        <tbody id="soItems"></tbody>
      </table>
    </div>
  `;
  populateSelects(content);

  const items=[];
  q('#addSOItem').addEventListener('click', ()=>{
    const pid=q('.sel-product-order').value, qty=Number(q('#soQty').value)||0, price=Number(q('#soPrice').value)||0, store=q('.sel-store-order').value;
    if(!pid||qty<=0||!store) return alert('اختر بيانات صحيحة');
    items.push({productId:pid, qty, price, storeId:store});
    renderSOItems();
  });

  function renderSOItems(){
    const tb=q('#soItems'); tb.innerHTML='';
    items.forEach(it=>{
      const p=db.products.find(x=>x.id===it.productId)||{};
      const s=db.stores.find(x=>x.id===it.storeId)||{};
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${p.name||''}</td><td>${it.qty}</td><td>${money(it.price)}</td><td>${s.name||''}</td>`;
      tb.appendChild(tr);
    });
  }

  q('#createSO').addEventListener('click', ()=>{
    const cust=q('.sel-customer').value; if(!cust) return alert('اختر عميل');
    if(!items.length) return alert('أضف عناصر');
    const soDoc={id:uid('so'), customerId:cust, items:items.slice(), total:items.reduce((s,i)=> s+i.qty*i.price,0), date:new Date().toISOString(), type:'order'};
    db.sales.push(soDoc); items.length=0; renderSalesOrders();
    toast('تم إنشاء أمر المبيعات'); renderRecentOps();
  });
}

// ربط قسم عروض الأسعار وأوامر المبيعات
const oldRenderSection2 = renderSection;
renderSection = function(id){
  if(id === 'profit-analytics') return renderProfitAnalytics();
  if(id === 'quotes') return renderQuotes();
  if(id === 'sales-orders') return renderSalesOrders();
  return oldRenderSection2(id);
};

/* ---------- تهيئة أولية وبيانات تجريبية ---------- */
function init(){
  buildNav(); showSection('dashboard'); populateSelects(); updateKPIs();
  // demo data
  if(!db.stores.length){
    const st1=uid('st'), st2=uid('st'); db.stores.push({id:st1, name:'المخزن الرئيسي'}); db.stores.push({id:st2, name:'فرع المدينة'});
    const cat1=uid('cat'), cat2=uid('cat'); db.categories.push({id:cat1, name:'شوكولاتة'}); db.categories.push({id:cat2, name:'حلويات'});
    db.suppliers.push({id:uid('sup'), name:'مورد تجريبي', phone:'0123456', balance:0});
    db.customers.push({id:uid('cus'), name:'عميل تجريبي', phone:'0987654', balance:0});
    db.products.push({id:uid('pr'), sku:'CH001', name:'شوكولاتة داكنة 70%', categoryId:cat1, price:5.5, cost:3, stocks:[{storeId:st1, qty:120}]});
    db.products.push({id:uid('pr'), sku:'CK001', name:'كوكيز بالشوكولاتة', categoryId:cat2, price:2.5, cost:1, stocks:[{storeId:st1, qty:200},{storeId:st2, qty:40}]});
  }
  populateSelects(); updateKPIs(); renderRecentOps();
}
init();