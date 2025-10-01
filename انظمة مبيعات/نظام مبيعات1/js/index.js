/* Edara IMS - Pure JS controller for index.html (RTL Arabic)
 * Data is persisted in localStorage. All bindings are defensive: code checks an element exists before using it.
 */

// دالة لحفظ بيانات مع وقت انتهاء
function saveWithExpiry(key, value, hours) {
  const now = new Date();

  // نخزن القيمة + وقت الانتهاء
  const item = {
    value: value,
    expiry: now.getTime() + hours * 60 * 60 * 1000, // تحويل الساعات لملي ثانية
  };
  localStorage.setItem(key, JSON.stringify(item));
}

// دالة لجلب البيانات مع التحقق من الصلاحية
function loadWithExpiry(key) {
  const itemStr = localStorage.getItem(key);

  // لو ما في بيانات
  if (!itemStr) {
    return null;
  }

  const item = JSON.parse(itemStr);
  const now = new Date();

  // لو خلص وقت الصلاحية
  if (now.getTime() > item.expiry) {
    localStorage.removeItem(key); // نحذفو
    return null;
  }

  return item.value;
}

// ✅ مثال استخدام:
saveWithExpiry("username", "Asom", 10); // يخزن الاسم وينحذف بعد 10 ساعات

console.log(loadWithExpiry("username")); // يرجع "Asom" اذا ما خلص الوقت

(function () {
  'use strict';

  // ===== Helpers =====
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  const store = {
    get(k, def) {
      try {
        const v = localStorage.getItem(k);
        return v ? JSON.parse(v) : def;
      } catch (e) {
        console.error('store.get', k, e);
        return def;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem(k, JSON.stringify(v));
      } catch (e) {
        console.error('store.set', k, e);
      }
    },
  };

  const uid = (prefix = '') =>
    prefix + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

  const fmt = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 });
  const money = (n) => (isFinite(+n) ? fmt.format(+n) : '0');
  const todayStr = () => new Date().toISOString().slice(0, 10);

  // ===== Data Model =====
  const DB = {
    users: 'edara_users',
    session: 'edara_session',
    items: 'edara_items',
    categories: 'edara_categories',
    units: 'edara_units',
    warehouses: 'edara_warehouses',
    movements: 'edara_movements',
    suppliers: 'edara_suppliers',
    customers: 'edara_customers',
    sales: 'edara_sales',
    purchaseReqs: 'edara_purchase_reqs',
    purchaseOrders: 'edara_purchase_orders',
    vendorInvoices: 'edara_vendor_invoices',
    purchaseReturns: 'edara_purchase_returns',
  };
// عناصر الفورم والأزرار
const addBtn = document.getElementById("add-delivery-btn");
const form = document.getElementById("delivery-form");
const saveBtn = document.getElementById("save-delivery");
const cancelBtn = document.getElementById("cancel-delivery");
const deliveriesTable = document.getElementById("deliveries-table").querySelector("tbody");
const searchInput = document.getElementById("search-deliveries");

// متغير لتخزين الشحنات
let deliveries = JSON.parse(localStorage.getItem("deliveries")) || [];
let editIndex = null;

// فتح / إغلاق الفورم
addBtn.addEventListener("click", () => {
    form.style.display = "block";
    resetForm();
});
cancelBtn.addEventListener("click", () => {
    form.style.display = "none";
    resetForm();
});

// حفظ الشحنة
saveBtn.addEventListener("click", () => {
    const delivery = {
        number: document.getElementById("delivery-number").value,
        date: document.getElementById("delivery-date").value,
        salesOrder: document.getElementById("delivery-sales-order").value,
        customer: document.getElementById("delivery-customer").value,
        address: document.getElementById("delivery-address").value,
        carrier: document.getElementById("delivery-carrier").value,
        tracking: document.getElementById("delivery-tracking").value,
        status: document.getElementById("delivery-status").value,
        expected: document.getElementById("delivery-expected").value,
        notes: document.getElementById("delivery-notes").value
    };

    if (!delivery.number || !delivery.date || !delivery.customer) {
        alert("الرجاء تعبئة الحقول المطلوبة");
        return;
    }

    if (editIndex !== null) {
        deliveries[editIndex] = delivery;
        editIndex = null;
    } else {
        deliveries.push(delivery);
    }

    localStorage.setItem("deliveries", JSON.stringify(deliveries));
    renderTable();
    resetForm();
    form.style.display = "none";
});

// عرض البيانات في الجدول
function renderTable() {
    deliveriesTable.innerHTML = "";
    deliveries.forEach((d, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${d.number}</td>
            <td>${d.date}</td>
            <td>${d.customer}</td>
            <td>${d.address}</td>
            <td>${d.carrier}</td>
            <td>${d.status}</td>
            <td>
                <button onclick="editDelivery(${index})"><i class="fas fa-edit"></i></button>
                <button onclick="deleteDelivery(${index})"><i class="fas fa-trash"></i></button>
            </td>
        `;
        deliveriesTable.appendChild(row);
    });
}

// تعديل شحنة
window.editDelivery = function (index) {
    const d = deliveries[index];
    document.getElementById("delivery-number").value = d.number;
    document.getElementById("delivery-date").value = d.date;
    document.getElementById("delivery-sales-order").value = d.salesOrder;
    document.getElementById("delivery-customer").value = d.customer;
    document.getElementById("delivery-address").value = d.address;
    document.getElementById("delivery-carrier").value = d.carrier;
    document.getElementById("delivery-tracking").value = d.tracking;
    document.getElementById("delivery-status").value = d.status;
    document.getElementById("delivery-expected").value = d.expected;
    document.getElementById("delivery-notes").value = d.notes;

    editIndex = index;
    form.style.display = "block";
};

// حذف شحنة
window.deleteDelivery = function (index) {
    if (confirm("هل تريد حذف هذه الشحنة؟")) {
        deliveries.splice(index, 1);
        localStorage.setItem("deliveries", JSON.stringify(deliveries));
        renderTable();
    }
};

// إعادة تعيين الفورم
function resetForm() {
    document.getElementById("delivery-number").value = "";
    document.getElementById("delivery-date").value = "";
    document.getElementById("delivery-sales-order").value = "";
    document.getElementById("delivery-customer").value = "";
    document.getElementById("delivery-address").value = "";
    document.getElementById("delivery-carrier").value = "";
    document.getElementById("delivery-tracking").value = "";
    document.getElementById("delivery-status").value = "معلقة";
    document.getElementById("delivery-expected").value = "";
    document.getElementById("delivery-notes").value = "";
}

// البحث
document.getElementById("search-deliveries-btn").addEventListener("click", () => {
    const term = searchInput.value.toLowerCase();
    const rows = deliveriesTable.querySelectorAll("tr");
    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? "" : "none";
    });
});

// تشغيل عند البداية
renderTable();
// أوامر البيع (بيانات تجريبية)
const salesOrders = [
    { id: "SO-1001", name: "أمر بيع #1001" },
    { id: "SO-1002", name: "أمر بيع #1002" },
    { id: "SO-1003", name: "أمر بيع #1003" },
    { id: "SO-1004", name: "أمر بيع #1004" }
];

// العملاء (كمان بيانات تجريبية)
const customers = [
    { id: "CUST-01", name: "أحمد محمد" },
    { id: "CUST-02", name: "شركة النور" },
    { id: "CUST-03", name: "مها علي" },
    { id: "CUST-04", name: "متجر السلام" }
];

// تعبئة أوامر البيع في القائمة
function loadSalesOrders() {
    const select = document.getElementById("delivery-sales-order");
    salesOrders.forEach(order => {
        const option = document.createElement("option");
        option.value = order.id;
        option.textContent = order.name;
        select.appendChild(option);
    });
}

// تعبئة العملاء في القائمة
function loadCustomers() {
    const select = document.getElementById("delivery-customer");
    customers.forEach(cust => {
        const option = document.createElement("option");
        option.value = cust.id;
        option.textContent = cust.name;
        select.appendChild(option);
    });
}

// تشغيل عند البداية
window.addEventListener("DOMContentLoaded", () => {
    loadSalesOrders();
    loadCustomers();
    renderTable();
});

  document.getElementById("login-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const alertBox = document.getElementById("login-alert");

    if (username === "admin" && password === "1234") {
      // إخفاء صفحة تسجيل الدخول
      document.getElementById("login-page").style.display = "none";
      // إظهار لوحة التحكم
      document.getElementById("dashboard").style.display = "block";
      // عرض رسالة ترحيب
      document.getElementById("user-greeting").textContent = "مرحباً, " + username;
    } else {
      alertBox.style.display = "block";
      alertBox.textContent = "❌ اسم المستخدم أو كلمة المرور غير صحيحة!";
    }
  });

  // زر تسجيل الخروج
  document.getElementById("logout-btn").addEventListener("click", function() {
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("login-page").style.display = "flex";
    document.getElementById("login-form").reset();
  });


  function seedIfEmpty() {
    if (!store.get(DB.users)) store.set(DB.users, [{ id: 'u1', username: 'admin', password: '123456', name: 'admin' }]);
    if (!store.get(DB.categories)) store.set(DB.categories, [
      { id: uid('cat_'), name: 'مشروبات', parent: '' },
      { id: uid('cat_'), name: 'أغذية', parent: '' },
    ]);
    if (!store.get(DB.units)) store.set(DB.units, [
      { id: uid('unit_'), name: 'قطعة', symbol: 'قط' },
      { id: uid('unit_'), name: 'علبة', symbol: 'عل' },
    ]);
    if (!store.get(DB.items)) store.set(DB.items, [
      { id: uid('item_'), code: 'P-100', name: 'ماء معدني 1.5ل', category: 'مشروبات', unit: 'قطعة', cost: 7, price: 10, min: 10, max: 500, stock: 150, description: '' },
      { id: uid('item_'), code: 'P-200', name: 'بسكويت شوكولاتة', category: 'أغذية', unit: 'علبة', cost: 5, price: 8, min: 20, max: 400, stock: 80, description: '' },
    ]);
    if (!store.get(DB.warehouses)) store.set(DB.warehouses, [
      { id: uid('wh_'), code: 'M-01', name: 'المخزن الرئيسي', type: 'رئيسي', branch: 'الفرع الرئيسي', address: 'القاهرة', manager: 'أحمد', phone: '0100', capacity: 1000 },
    ]);
    if (!store.get(DB.suppliers)) store.set(DB.suppliers, [
      { id: uid('sup_'), name: 'شركة الموردين المتحدة', phone: '0111', address: 'الجيزة' },
    ]);
    if (!store.get(DB.customers)) store.set(DB.customers, [
      { id: uid('cus_'), name: 'عميل افتراضي', phone: '0122' },
    ]);
    if (!store.get(DB.sales)) store.set(DB.sales, [
      { id: uid('sale_'), number: 'S-001', customer: 'عميل افتراضي', item: 'ماء معدني 1.5ل', qty: 3, price: 10, date: todayStr() },
      { id: uid('sale_'), number: 'S-002', customer: 'عميل افتراضي', item: 'بسكويت شوكولاتة', qty: 5, price: 8, date: todayStr() },
    ]);
    if (!store.get(DB.movements)) store.set(DB.movements, []);
    if (!store.get(DB.purchaseReqs)) store.set(DB.purchaseReqs, []);
    if (!store.get(DB.purchaseOrders)) store.set(DB.purchaseOrders, []);
    if (!store.get(DB.vendorInvoices)) store.set(DB.vendorInvoices, []);
    if (!store.get(DB.purchaseReturns)) store.set(DB.purchaseReturns, []);
  }

  seedIfEmpty();

  // ===== Auth =====
  const loginPage = $('#login-page');
  const dashboard = $('#dashboard');
  const loginForm = $('#login-form');
  const loginAlert = $('#login-alert');
  const logoutBtn = $('#logout-btn');
  const userGreeting = $('#user-greeting');

  function setSession(user) {
    store.set(DB.session, user ? { id: user.id, username: user.username, name: user.name } : null);
  }
  function getSession() { return store.get(DB.session, null); }

  function updateAuthUI() {
    const sess = getSession();
    if (sess) {
      if (loginPage) loginPage.style.display = 'none';
      if (dashboard) dashboard.style.display = 'block';
      if (userGreeting) userGreeting.textContent = 'مرحباً, ' + (sess.name || sess.username);
    } else {
      if (loginPage) loginPage.style.display = 'flex';
      if (dashboard) dashboard.style.display = 'none';
    }
  }

  on(loginForm, 'submit', (e) => {
    e.preventDefault();
    const username = $('#username').value.trim();
    const password = $('#password').value;
    const users = store.get(DB.users, []);
    const match = users.find((u) => u.username === username && u.password === password);
    if (match) {
      setSession(match);
      if (loginAlert) { loginAlert.style.display = 'none'; loginAlert.textContent = ''; }
      updateAuthUI();
      renderAll();
    } else {
      if (loginAlert) {
        loginAlert.className = 'alert alert-error';
        loginAlert.textContent = 'بيانات الدخول غير صحيحة';
        loginAlert.style.display = 'block';
      }
    }
  });

  on(logoutBtn, 'click', () => { setSession(null); updateAuthUI(); });

  // ===== Sidebar & Sections =====
  const sections = $$('.section');
  function showSection(id) {
    sections.forEach((s) => s.classList.remove('active'));
    const el = $('#' + id);
    if (el) el.classList.add('active');
  }

  // left nav main items
  $$('.sidebar li[data-section]').forEach((li) => {
    on(li, 'click', () => showSection(li.getAttribute('data-section')));
  });

  // submenus expand/collapse
  $$('.sidebar .has-submenu').forEach((li) => {
    on(li, 'click', (e) => {
      if (e.target.closest('li.has-submenu') === li) {
        li.classList.toggle('active');
        const sm = li.querySelector('.submenu');
        if (sm) sm.style.display = sm.style.display === 'block' ? 'none' : 'block';
      }
    });
    // delegate to submenu items
    li.querySelectorAll('.submenu li[data-section]').forEach((sub) => {
      on(sub, 'click', (e) => {
        e.stopPropagation();
        showSection(sub.getAttribute('data-section'));
      });
    });
  });

  // ===== Tabs (generic) =====
  function initTabs(scope = document) {
    $$('.tabs', scope).forEach((tabs) => {
      const tabBtns = $$('.tab', tabs.parentElement);
      tabBtns.forEach((btn) => {
        on(btn, 'click', () => {
          tabBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          const wrap = tabs.parentElement;
          $$('.tab-content', wrap).forEach((c) => c.classList.remove('active'));
          const id = btn.getAttribute('data-tab');
          const pane = $('#' + id, wrap);
          if (pane) pane.classList.add('active');
        });
      });
    });
  }
  initTabs();

  // ===== Dashboard widgets =====
  function renderDashboard() {
    const curDate = $('#current-date');
    if (curDate) curDate.textContent = new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const items = store.get(DB.items, []);
    const sales = store.get(DB.sales, []);
    const customers = store.get(DB.customers, []);
    const suppliers = store.get(DB.suppliers, []);

    const tp = $('#total-products'); if (tp) tp.textContent = items.length;
    const ts = $('#total-sales'); if (ts) ts.textContent = sales.length;
    const tc = $('#total-clients'); if (tc) tc.textContent = customers.length;
    const tSup = $('#total-suppliers'); if (tSup) tSup.textContent = suppliers.length;

    const tbody = $('#recent-sales tbody');
    if (tbody) {
      tbody.innerHTML = '';
      sales.slice(-10).reverse().forEach((s, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${s.number || '—'}</td>
          <td>${s.customer}</td>
          <td>${s.item}</td>
          <td>${s.qty}</td>
          <td>${money(s.price)}</td>
          <td>${s.date}</td>`;
        tbody.appendChild(tr);
      });
    }
  }

  // ===== Inventory: items, categories, units =====
  function fillSelectOptions(select, list, labelKey = 'name') {
    if (!select) return;
    const cur = select.value;
    select.innerHTML = '<option value="">اختر</option>' + list.map((r) => `<option value="${r[labelKey]}">${r[labelKey]}</option>`).join('');
    if (cur) select.value = cur;
  }

  function renderItems() {
    const items = store.get(DB.items, []);
    const tbody = $('#items-table tbody');
    if (!tbody) return;
    const q = ($('#search-items') || { value: '' }).value.trim();
    const filtered = q ? items.filter((it) => Object.values(it).join(' ').includes(q)) : items;
    tbody.innerHTML = '';
    filtered.forEach((it, idx) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${it.code}</td>
        <td>${it.name}</td>
        <td>${it.category}</td>
        <td>${it.unit}</td>
        <td>${money(it.cost)}</td>
        <td>${money(it.price)}</td>
        <td><span class="badge ${it.stock <= it.min ? 'badge-danger' : it.stock <= it.min * 1.5 ? 'badge-warning' : 'badge-success'}">${it.stock ?? 0}</span></td>
        <td class="actions">
          <button class="edit-btn">تعديل</button>
          <button class="delete-btn">حذف</button>
        </td>`;
      on(tr.querySelector('.edit-btn'), 'click', () => openItemForm(it));
      on(tr.querySelector('.delete-btn'), 'click', () => {
        if (confirm('تأكيد حذف الصنف؟')) {
          const next = items.filter((x) => x.id !== it.id);
          store.set(DB.items, next);
          renderItems();
          renderDashboard();
        }
      });
      tbody.appendChild(tr);
    });
  }

  const addItemBtn = $('#add-item-btn');
  const itemForm = $('#item-form');
  const saveItemBtn = $('#save-item');
  const cancelItemBtn = $('#cancel-item');

  function openItemForm(existing = null) {
    if (!itemForm) return;
    itemForm.style.display = 'block';
    $('#item-form-title').textContent = existing ? 'تعديل صنف' : 'إضافة صنف جديد';
    $('#item-code').value = existing?.code || '';
    $('#item-name').value = existing?.name || '';
    $('#item-category').value = existing?.category || '';
    $('#item-unit').value = existing?.unit || '';
    $('#item-cost').value = existing?.cost ?? '';
    $('#item-price').value = existing?.price ?? '';
    $('#item-min').value = existing?.min ?? '';
    $('#item-max').value = existing?.max ?? '';
    $('#item-description').value = existing?.description || '';
    itemForm.dataset.editingId = existing?.id || '';
  }

  function closeItemForm() { if (itemForm) { itemForm.style.display = 'none'; itemForm.dataset.editingId = ''; } }

  on(addItemBtn, 'click', () => openItemForm());
  on(cancelItemBtn, 'click', closeItemForm);

  on(saveItemBtn, 'click', () => {
    const code = $('#item-code').value.trim();
    const name = $('#item-name').value.trim();
    const category = $('#item-category').value.trim();
    const unit = $('#item-unit').value.trim();
    const cost = +$('#item-cost').value || 0;
    const price = +$('#item-price').value || 0;
    const min = +$('#item-min').value || 0;
    const max = +$('#item-max').value || 0;
    const description = $('#item-description').value.trim();
    if (!code || !name || !category || !unit) return alert('أكمل البيانات المطلوبة');

    const items = store.get(DB.items, []);
    const editingId = itemForm.dataset.editingId;
    if (editingId) {
      const idx = items.findIndex((x) => x.id === editingId);
      if (idx > -1) items[idx] = { ...items[idx], code, name, category, unit, cost, price, min, max, description };
    } else {
      items.push({ id: uid('item_'), code, name, category, unit, cost, price, min, max, stock: 0, description });
    }
    store.set(DB.items, items);
    closeItemForm();
    renderItems();
    renderSelectors();
    renderDashboard();
  });

  // Categories
  const addCategoryBtn = $('#add-category-btn');
  const categoryForm = $('#category-form');
  const saveCategoryBtn = $('#save-category');
  const cancelCategoryBtn = $('#cancel-category');

  function renderCategories() {
    const cats = store.get(DB.categories, []);
    const tbody = $('#categories-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    cats.forEach((c, i) => {
      const count = store.get(DB.items, []).filter((x) => x.category === c.name).length;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${c.name}</td>
        <td>${c.parent || '—'}</td>
        <td>${count}</td>
        <td class="actions">
          <button class="edit-btn">تعديل</button>
          <button class="delete-btn">حذف</button>
        </td>`;
      on(tr.querySelector('.edit-btn'), 'click', () => openCategoryForm(c));
      on(tr.querySelector('.delete-btn'), 'click', () => {
        if (confirm('حذف الفئة؟')) {
          store.set(DB.categories, cats.filter((x) => x.id !== c.id));
          renderCategories();
          renderSelectors();
        }
      });
      tbody.appendChild(tr);
    });
  }

  function openCategoryForm(existing = null) {
    if (!categoryForm) return;
    categoryForm.style.display = 'block';
    $('#category-form-title').textContent = existing ? 'تعديل فئة' : 'إضافة فئة جديدة';
    $('#category-name').value = existing?.name || '';
    $('#category-parent').value = existing?.parent || '';
    $('#category-description').value = existing?.description || '';
    categoryForm.dataset.editingId = existing?.id || '';
  }
  function closeCategoryForm() { if (categoryForm) { categoryForm.style.display = 'none'; categoryForm.dataset.editingId = ''; } }
  on(addCategoryBtn, 'click', () => openCategoryForm());
  on(cancelCategoryBtn, 'click', closeCategoryForm);
  on(saveCategoryBtn, 'click', () => {
    const name = $('#category-name').value.trim();
    const parent = $('#category-parent').value.trim();
    const description = $('#category-description').value.trim();
    if (!name) return alert('أدخل اسم الفئة');
    const cats = store.get(DB.categories, []);
    const id = categoryForm.dataset.editingId;
    if (id) {
      const i = cats.findIndex((x) => x.id === id);
      if (i > -1) cats[i] = { ...cats[i], name, parent, description };
    } else {
      cats.push({ id: uid('cat_'), name, parent, description });
    }
    store.set(DB.categories, cats);
    closeCategoryForm();
    renderCategories();
    renderSelectors();
  });

  // Units
  const addUnitBtn = $('#add-unit-btn');
  const unitForm = $('#unit-form');
  const saveUnitBtn = $('#save-unit');
  const cancelUnitBtn = $('#cancel-unit');

  function renderUnits() {
    const units = store.get(DB.units, []);
    const tbody = $('#units-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    units.forEach((u, i) => {
      const count = store.get(DB.items, []).filter((x) => x.unit === u.name).length;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${u.name}</td>
        <td>${u.symbol}</td>
        <td>${count}</td>
        <td class="actions">
          <button class="edit-btn">تعديل</button>
          <button class="delete-btn">حذف</button>
        </td>`;
      on(tr.querySelector('.edit-btn'), 'click', () => openUnitForm(u));
      on(tr.querySelector('.delete-btn'), 'click', () => {
        if (confirm('حذف الوحدة؟')) {
          store.set(DB.units, units.filter((x) => x.id !== u.id));
          renderUnits();
          renderSelectors();
        }
      });
      tbody.appendChild(tr);
    });
  }

  function openUnitForm(existing = null) {
    if (!unitForm) return;
    unitForm.style.display = 'block';
    $('#unit-form-title').textContent = existing ? 'تعديل وحدة' : 'إضافة وحدة قياس جديدة';
    $('#unit-name').value = existing?.name || '';
    $('#unit-symbol').value = existing?.symbol || '';
    unitForm.dataset.editingId = existing?.id || '';
  }
  function closeUnitForm() { if (unitForm) { unitForm.style.display = 'none'; unitForm.dataset.editingId = ''; } }
  on(addUnitBtn, 'click', () => openUnitForm());
  on(cancelUnitBtn, 'click', closeUnitForm);
  on(saveUnitBtn, 'click', () => {
    const name = $('#unit-name').value.trim();
    const symbol = $('#unit-symbol').value.trim();
    if (!name || !symbol) return alert('أدخل اسم الوحدة والرمز');
    const units = store.get(DB.units, []);
    const id = unitForm.dataset.editingId;
    if (id) {
      const i = units.findIndex((x) => x.id === id);
      if (i > -1) units[i] = { ...units[i], name, symbol };
    } else {
      units.push({ id: uid('unit_'), name, symbol });
    }
    store.set(DB.units, units);
    closeUnitForm();
    renderUnits();
    renderSelectors();
  });

  // Shared selectors across forms
  function renderSelectors() {
    const cats = store.get(DB.categories, []);
    const units = store.get(DB.units, []);
    const items = store.get(DB.items, []);
    const warehouses = store.get(DB.warehouses, []);
    const suppliers = store.get(DB.suppliers, []);

    // inventory forms
    fillSelectOptions($('#item-category'), cats);
    fillSelectOptions($('#item-unit'), units);

    // movements
    fillSelectOptions($('#movement-item'), items, 'name');
    fillSelectOptions($('#movement-source'), warehouses, 'name');
    fillSelectOptions($('#movement-destination'), warehouses, 'name');

    // purchase requisitions
    fillSelectOptions($('#requisition-warehouse'), warehouses, 'name');
    fillSelectOptions($('#requisition-item'), items, 'name');
    fillSelectOptions($('#requisition-unit'), units);

    // purchase orders
    fillSelectOptions($('#purchase-order-supplier'), suppliers, 'name');
    fillSelectOptions($('#purchase-order-warehouse'), warehouses, 'name');
    fillSelectOptions($('#purchase-order-item'), items, 'name');
    fillSelectOptions($('#purchase-order-unit'), units);

    // vendor invoices
    fillSelectOptions($('#vendor-invoice-supplier'), suppliers, 'name');
    fillSelectOptions($('#vendor-invoice-item'), items, 'name');
    fillSelectOptions($('#vendor-invoice-unit'), units);
    // purchase returns
    fillSelectOptions($('#purchase-return-supplier'), suppliers, 'name');
    fillSelectOptions($('#purchase-return-item'), items, 'name');
    fillSelectOptions($('#purchase-return-unit'), units);

    // categories parent
    const parentSel = $('#category-parent');
    if (parentSel) {
      parentSel.innerHTML = '<option value="">لا يوجد</option>' + cats.map((c) => `<option value="${c.name}">${c.name}</option>`).join('');
    }
  }

  // ===== Warehouses =====
  const addWhBtn = $('#add-warehouse-btn');
  const whForm = $('#warehouse-form');
  on(addWhBtn, 'click', () => openWhForm());
  on($('#cancel-warehouse'), 'click', () => closeWhForm());
  on($('#save-warehouse'), 'click', saveWarehouse);

  function openWhForm(existing = null) {
    if (!whForm) return;
    whForm.style.display = 'block';
    $('#warehouse-form-title').textContent = existing ? 'تعديل مخزن' : 'إضافة مخزن جديد';
    $('#warehouse-code').value = existing?.code || '';
    $('#warehouse-name').value = existing?.name || '';
    $('#warehouse-type').value = existing?.type || 'رئيسي';
    $('#warehouse-branch').value = existing?.branch || '';
    $('#warehouse-address').value = existing?.address || '';
    $('#warehouse-manager').value = existing?.manager || '';
    $('#warehouse-phone').value = existing?.phone || '';
    $('#warehouse-capacity').value = existing?.capacity ?? '';
    whForm.dataset.editingId = existing?.id || '';
  }
  function closeWhForm() { if (whForm) { whForm.style.display = 'none'; whForm.dataset.editingId = ''; } }

  function saveWarehouse() {
    const code = $('#warehouse-code').value.trim();
    const name = $('#warehouse-name').value.trim();
    const type = $('#warehouse-type').value;
    const branch = $('#warehouse-branch').value.trim();
    const address = $('#warehouse-address').value.trim();
    const manager = $('#warehouse-manager').value.trim();
    const phone = $('#warehouse-phone').value.trim();
    const capacity = +$('#warehouse-capacity').value || 0;
    if (!code || !name) return alert('أدخل كود واسم المخزن');
    const list = store.get(DB.warehouses, []);
    const id = whForm.dataset.editingId;
    if (id) {
      const i = list.findIndex((x) => x.id === id);
      if (i > -1) list[i] = { ...list[i], code, name, type, branch, address, manager, phone, capacity };
    } else {
      list.push({ id: uid('wh_'), code, name, type, branch, address, manager, phone, capacity });
    }
    store.set(DB.warehouses, list);
    closeWhForm();
    renderWarehouses();
    renderSelectors();
  }

  function renderWarehouses() {
    const list = store.get(DB.warehouses, []);
    const tbody = $('#warehouses-table tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    list.forEach((w, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${w.code}</td>
        <td>${w.name}</td>
        <td>${w.type}</td>
        <td>${w.branch || '—'}</td>
        <td>${w.address || '—'}</td>
        <td>${w.manager || '—'}</td>
        <td class="actions">
          <button class="edit-btn">تعديل</button>
          <button class="delete-btn">حذف</button>
        </td>`;
      on(tr.querySelector('.edit-btn'), 'click', () => openWhForm(w));
      on(tr.querySelector('.delete-btn'), 'click', () => {
        if (confirm('حذف المخزن؟')) {
          store.set(DB.warehouses, list.filter((x) => x.id !== w.id));
          renderWarehouses();
          renderSelectors();
        }
      });
      tbody.appendChild(tr);
    });
  }

  // ===== Inventory Movements =====
  const addMoveBtn = $('#add-movement-btn');
  const moveForm = $('#movement-form');
  on(addMoveBtn, 'click', () => openMoveForm());
  on($('#cancel-movement'), 'click', () => closeMoveForm());
  on($('#save-movement'), 'click', saveMovement);

  function openMoveForm(existing = null) {
    if (!moveForm) return;
    moveForm.style.display = 'block';
    $('#movement-form-title').textContent = existing ? 'تعديل حركة' : 'إضافة حركة مخزون';
    $('#movement-type').value = existing?.type || 'إضافة';
    $('#movement-date').value = existing?.date || todayStr();
    $('#movement-item').value = existing?.item || '';
    $('#movement-quantity').value = existing?.qty ?? '';
    $('#movement-source').value = existing?.source || '';
    $('#movement-destination').value = existing?.dest || '';
    $('#movement-reference').value = existing?.ref || '';
    $('#movement-notes').value = existing?.notes || '';
    moveForm.dataset.editingId = existing?.id || '';
  }
  function closeMoveForm() { if (moveForm) { moveForm.style.display = 'none'; moveForm.dataset.editingId = ''; } }

  function saveMovement() {
    const type = $('#movement-type').value;
    const date = $('#movement-date').value || todayStr();
    const itemName = $('#movement-item').value;
    const qty = +$('#movement-quantity').value || 0;
    const source = $('#movement-source').value;
    const dest = $('#movement-destination').value;
    const ref = $('#movement-reference').value.trim();
    const notes = $('#movement-notes').value.trim();
    if (!itemName || !qty) return alert('اختر الصنف وأدخل الكمية');

    const movements = store.get(DB.movements, []);
    const id = moveForm.dataset.editingId;

    // adjust stock helper
    function adjustStock(name, delta) {
      const items = store.get(DB.items, []);
      const i = items.findIndex((x) => x.name === name);
      if (i > -1) {
        items[i].stock = (items[i].stock || 0) + delta;
        store.set(DB.items, items);
      }
    }

    let delta = 0;
    if (type === 'إضافة') delta = qty; else if (type === 'صرف') delta = -qty; else if (type === 'تحويل') delta = 0; else if (type === 'تعديل') delta = qty; // treat as set delta

    if (id) {
      const idx = movements.findIndex((m) => m.id === id);
      if (idx > -1) {
        // revert previous effect then apply new
        const prev = movements[idx];
        if (prev.type === 'إضافة') adjustStock(prev.item, -prev.qty);
        else if (prev.type === 'صرف') adjustStock(prev.item, +prev.qty);
        else if (prev.type === 'تعديل') {/* skip revert */}
        movements[idx] = { ...prev, type, date, item: itemName, qty, source, dest, ref, notes };
      }
    } else {
      movements.push({ id: uid('mov_'), type, date, item: itemName, qty, source, dest, ref, notes });
    }

    // apply effect
    if (type === 'إضافة') adjustStock(itemName, qty);
    else if (type === 'صرف') adjustStock(itemName, -qty);
    // تحويل لا يغير المخزون الكلي

    store.set(DB.movements, movements);
    closeMoveForm();
    renderMovements();
    renderItems();
    renderDashboard();
  }

  function renderMovements() {
    const tbody = $('#movements-table tbody');
    if (!tbody) return;
    const list = store.get(DB.movements, []);
    const q = ($('#search-movements') || { value: '' }).value.trim();
    const filtered = q ? list.filter((m) => Object.values(m).join(' ').includes(q)) : list;
    tbody.innerHTML = '';
    filtered.forEach((m, i) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${i + 1}</td>
        <td>${m.type}</td>
        <td>${m.date}</td>
        <td>${m.item}</td>
        <td>${m.qty}</td>
        <td>${m.source || '—'}</td>
        <td>${m.dest || '—'}</td>
        <td>${m.ref || '—'}</td>
        <td class="actions"><button class="edit-btn">تعديل</button> <button class="delete-btn">حذف</button></td>`;
      on(tr.querySelector('.edit-btn'), 'click', () => openMoveForm(m));
      on(tr.querySelector('.delete-btn'), 'click', () => {
        if (confirm('حذف الحركة؟')) {
          store.set(DB.movements, list.filter((x) => x.id !== m.id));
          renderMovements();
        }
      });
      tbody.appendChild(tr);
    });
  }

  // ===== Purchase Requisitions =====
  function simpleTableHandlers({ addBtnId, formId, saveId, cancelId, tableId, entityKey, columns, collect, titleId }) {
    const addBtn = $('#' + addBtnId);
    const form = $('#' + formId);
    const saveBtn = $('#' + saveId);
    const cancelBtn = $('#' + cancelId);

    function openForm(existing = null) {
      if (!form) return;
      form.style.display = 'block';
      if (titleId) $("#" + titleId).textContent = existing ? 'تعديل' : $("#" + titleId).textContent;
      form.dataset.editingId = existing?.id || '';
      // Let `collect(null, 'fill')` fill fields if provided
      if (collect) collect(existing, 'fill');
    }
    function closeForm() { if (form) { form.style.display = 'none'; form.dataset.editingId = ''; if (collect) collect(null, 'reset'); } }

    on(addBtn, 'click', () => openForm());
    on(cancelBtn, 'click', closeForm);
    on(saveBtn, 'click', () => {
      const data = collect ? collect(null, 'get') : {};
      if (!data) return; // collect handled validation
      const list = store.get(entityKey, []);
      const id = form.dataset.editingId;
      if (id) {
        const idx = list.findIndex((x) => x.id === id);
        if (idx > -1) list[idx] = { ...list[idx], ...data };
      } else {
        list.push({ id: uid(entityKey.slice(6, 9) + '_'), ...data });
      }
      store.set(entityKey, list);
      closeForm();
      render();
    });

    function render() {
      const tbody = $('#' + tableId + ' tbody');
      if (!tbody) return;
      const list = store.get(entityKey, []);
      tbody.innerHTML = '';
      list.forEach((r, i) => {
        const tr = document.createElement('tr');
        const tds = columns.map((k) => `<td>${typeof k === 'function' ? k(r, i) : (r[k] ?? '—')}</td>`).join('');
        tr.innerHTML = `<td>${i + 1}</td>${tds}<td class="actions"><button class="edit-btn">تعديل</button> <button class="delete-btn">حذف</button></td>`;
        on(tr.querySelector('.edit-btn'), 'click', () => openForm(r));
        on(tr.querySelector('.delete-btn'), 'click', () => {
          if (confirm('حذف السجل؟')) {
            store.set(entityKey, list.filter((x) => x.id !== r.id));
            render();
          }
        });
        tbody.appendChild(tr);
      });
    }

    return { render };
  }

  // Requisition items list inside form
  const reqItems = [];
  const requisitionsUI = simpleTableHandlers({
    addBtnId: 'add-purchase-requisition-btn',
    formId: 'purchase-requisition-form',
    saveId: 'save-purchase-requisition',
    cancelId: 'cancel-purchase-requisition',
    tableId: 'purchase-requisitions-table',
    entityKey: DB.purchaseReqs,
    titleId: 'purchase-requisition-form-title',
    columns: ['number', 'date', 'requestedBy', 'warehouse', (r) => r.items?.length || 0, (r) => r.status || 'معلق'],
    collect: (existing, mode) => {
      const number = $('#requisition-number');
      const date = $('#requisition-date');
      const warehouse = $('#requisition-warehouse');
      const requestedBy = $('#requisition-requested-by');
      const itemSel = $('#requisition-item');
      const qty = $('#requisition-quantity');
      const unit = $('#requisition-unit');
      const addBtn = $('#add-requisition-item');
      const tableBody = $('#requisition-items-table tbody');

      function renderInner() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        reqItems.forEach((it, i) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${it.item}</td><td>${it.qty}</td><td>${it.unit}</td><td><button class="delete-btn">حذف</button></td>`;
          on(tr.querySelector('.delete-btn'), 'click', () => { reqItems.splice(i, 1); renderInner(); });
          tableBody.appendChild(tr);
        });
      }

      if (mode === 'fill') {
        reqItems.length = 0;
        if (existing) {
          number.value = existing.number || '';
          date.value = existing.date || todayStr();
          warehouse.value = existing.warehouse || '';
          requestedBy.value = existing.requestedBy || '';
          (existing.items || []).forEach((x) => reqItems.push({ ...x }));
        } else {
          number.value = '';
          date.value = todayStr();
          warehouse.value = '';
          requestedBy.value = '';
        }
        renderInner();
      }

      if (mode === 'reset') { reqItems.length = 0; renderInner(); }

      if (addBtn && !addBtn.dataset.bound) {
        addBtn.dataset.bound = '1';
        on(addBtn, 'click', (e) => {
          e.preventDefault();
          const itName = itemSel.value; if (!itName) return alert('اختر الصنف');
          const q = +qty.value || 0; if (!q) return alert('أدخل الكمية');
          const u = unit.value; if (!u) return alert('اختر الوحدة');
          reqItems.push({ item: itName, qty: q, unit: u });
          renderInner();
        });
      }

      if (mode === 'get') {
        const data = { number: number.value.trim(), date: date.value || todayStr(), warehouse: warehouse.value, requestedBy: requestedBy.value.trim(), items: [...reqItems], status: 'معلق' };
        if (!data.number || !data.warehouse || !data.requestedBy || data.items.length === 0) { alert('أكمل النموذج'); return null; }
        return data;
      }
    },
  });

  // Purchase Orders
  const poItems = [];
  const poUI = simpleTableHandlers({
    addBtnId: 'add-purchase-order-btn',
    formId: 'purchase-order-form',
    saveId: 'save-purchase-order',
    cancelId: 'cancel-purchase-order',
    tableId: 'purchase-orders-table',
    entityKey: DB.purchaseOrders,
    titleId: 'purchase-order-form-title',
    columns: ['number', 'date', 'supplier', 'warehouse', (r) => r.items?.length || 0, (r) => money(r.total || 0), (r) => r.status || 'جديد'],
    collect: (existing, mode) => {
      const number = $('#purchase-order-number');
      const date = $('#purchase-order-date');
      const supplier = $('#purchase-order-supplier');
      const warehouse = $('#purchase-order-warehouse');
      const itemSel = $('#purchase-order-item');
      const qty = $('#purchase-order-quantity');
      const unit = $('#purchase-order-unit');
      const price = $('#purchase-order-price');
      const addBtn = $('#add-purchase-order-item');
      const tableBody = $('#purchase-order-items-table tbody');
      const total = $('#purchase-order-total');
      const tax = $('#purchase-order-tax');
      const discount = $('#purchase-order-discount');
      const net = $('#purchase-order-net');

      function sum() {
        const t = poItems.reduce((s, it) => s + it.qty * it.price, 0);
        total.value = money(t);
        const netVal = t + (+tax.value || 0) - (+discount.value || 0);
        net.value = money(netVal);
      }

      function renderInner() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        poItems.forEach((it, i) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${it.item}</td><td>${it.qty}</td><td>${it.unit}</td><td>${money(it.price)}</td><td>${money(it.qty * it.price)}</td><td><button class="delete-btn">حذف</button></td>`;
          on(tr.querySelector('.delete-btn'), 'click', () => { poItems.splice(i, 1); renderInner(); sum(); });
          tableBody.appendChild(tr);
        });
      }

      if (mode === 'fill') {
        poItems.length = 0;
        if (existing) {
          number.value = existing.number || '';
          date.value = existing.date || todayStr();
          supplier.value = existing.supplier || '';
          warehouse.value = existing.warehouse || '';
          (existing.items || []).forEach((x) => poItems.push({ ...x }));
          tax.value = existing.tax || 0;
          discount.value = existing.discount || 0;
        } else {
          number.value = '';
          date.value = todayStr();
          supplier.value = '';
          warehouse.value = '';
          tax.value = 0; discount.value = 0;
        }
        renderInner(); sum();
      }

      if (mode === 'reset') { poItems.length = 0; renderInner(); sum(); }

      [tax, discount].forEach((el) => on(el, 'input', sum));

      if (addBtn && !addBtn.dataset.bound) {
        addBtn.dataset.bound = '1';
        on(addBtn, 'click', (e) => {
          e.preventDefault();
          const itName = itemSel.value; if (!itName) return alert('اختر الصنف');
          const q = +qty.value || 0; if (!q) return alert('أدخل الكمية');
          const u = unit.value; if (!u) return alert('اختر الوحدة');
          const p = +price.value || 0; if (!p) return alert('أدخل السعر');
          poItems.push({ item: itName, qty: q, unit: u, price: p });
          renderInner(); sum();
        });
      }

      if (mode === 'get') {
        const t = poItems.reduce((s, it) => s + it.qty * it.price, 0);
        const data = { number: number.value.trim(), date: date.value || todayStr(), supplier: supplier.value, warehouse: warehouse.value, items: [...poItems], total: t, tax: +tax.value || 0, discount: +discount.value || 0, net: t + (+tax.value || 0) - (+discount.value || 0), status: 'جديد' };
        if (!data.number || !data.supplier || !data.warehouse || data.items.length === 0) { alert('أكمل النموذج'); return null; }
        return data;
      }
    },
  });

  // Vendor Invoices
  const viItems = [];
  const viUI = simpleTableHandlers({
    addBtnId: 'add-vendor-invoice-btn',
    formId: 'vendor-invoice-form',
    saveId: 'save-vendor-invoice',
    cancelId: 'cancel-vendor-invoice',
    tableId: 'vendor-invoices-table',
    entityKey: DB.vendorInvoices,
    titleId: 'vendor-invoice-form-title',
    columns: ['number', 'date', 'supplier', 'purchaseOrder', (r) => r.items?.length || 0, (r) => money(r.net || 0), (r) => r.status || 'غير مدفوع'],
    collect: (existing, mode) => {
      const number = $('#vendor-invoice-number');
      const date = $('#vendor-invoice-date');
      const supplier = $('#vendor-invoice-supplier');
      const poSel = $('#vendor-invoice-purchase-order');
      const itemSel = $('#vendor-invoice-item');
      const qty = $('#vendor-invoice-quantity');
      const unit = $('#vendor-invoice-unit');
      const price = $('#vendor-invoice-price');
      const addBtn = $('#add-vendor-invoice-item');
      const tableBody = $('#vendor-invoice-items-table tbody');
      const total = $('#vendor-invoice-total');
      const tax = $('#vendor-invoice-tax');
      const discount = $('#vendor-invoice-discount');
      const net = $('#vendor-invoice-net');

      function sum() {
        const t = viItems.reduce((s, it) => s + it.qty * it.price, 0);
        total.value = money(t);
        const netVal = t + (+tax.value || 0) - (+discount.value || 0);
        net.value = money(netVal);
      }

      function renderInner() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        viItems.forEach((it, i) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${it.item}</td><td>${it.qty}</td><td>${it.unit}</td><td>${money(it.price)}</td><td>${money(it.qty * it.price)}</td><td><button class="delete-btn">حذف</button></td>`;
          on(tr.querySelector('.delete-btn'), 'click', () => { viItems.splice(i, 1); renderInner(); sum(); });
          tableBody.appendChild(tr);
        });
      }

      if (mode === 'fill') {
        viItems.length = 0;
        // fill PO dropdown from existing POs
        const pos = store.get(DB.purchaseOrders, []);
        if (poSel) poSel.innerHTML = '<option value="">اختر أمر الشراء (اختياري)</option>' + pos.map((p) => `<option value="${p.number}">${p.number}</option>`).join('');

        if (existing) {
          number.value = existing.number || '';
          date.value = existing.date || todayStr();
          supplier.value = existing.supplier || '';
          poSel.value = existing.purchaseOrder || '';
          (existing.items || []).forEach((x) => viItems.push({ ...x }));
          tax.value = existing.tax || 0; discount.value = existing.discount || 0;
        } else {
          number.value = '';
          date.value = todayStr();
          supplier.value = '';
          poSel.value = '';
          tax.value = 0; discount.value = 0;
        }
        renderInner(); sum();
      }

      if (mode === 'reset') { viItems.length = 0; renderInner(); sum(); }

      [tax, discount].forEach((el) => on(el, 'input', sum));

      if (addBtn && !addBtn.dataset.bound) {
        addBtn.dataset.bound = '1';
        on(addBtn, 'click', (e) => {
          e.preventDefault();
          const itName = itemSel.value; if (!itName) return alert('اختر الصنف');
          const q = +qty.value || 0; if (!q) return alert('أدخل الكمية');
          const u = unit.value; if (!u) return alert('اختر الوحدة');
          const p = +price.value || 0; if (!p) return alert('أدخل السعر');
          viItems.push({ item: itName, qty: q, unit: u, price: p });
          renderInner(); sum();
        });
      }

      if (mode === 'get') {
        const t = viItems.reduce((s, it) => s + it.qty * it.price, 0);
        const data = { number: number.value.trim(), date: date.value || todayStr(), supplier: supplier.value, purchaseOrder: poSel.value, items: [...viItems], total: t, tax: +tax.value || 0, discount: +discount.value || 0, net: t + (+tax.value || 0) - (+discount.value || 0), status: 'غير مدفوع' };
        if (!data.number || !data.supplier || data.items.length === 0) { alert('أكمل النموذج'); return null; }
        // Adjust stock for received items
        data.items.forEach((it) => {
          const items = store.get(DB.items, []);
          const i = items.findIndex((x) => x.name === it.item);
          if (i > -1) { items[i].stock = (items[i].stock || 0) + it.qty; store.set(DB.items, items); }
        });
        renderItems();
        renderDashboard();
        return data;
      }
    },
  });

  // Purchase Returns
  const prItems = [];
  const prUI = simpleTableHandlers({
    addBtnId: 'add-purchase-return-btn',
    formId: 'purchase-return-form',
    saveId: 'save-purchase-return',
    cancelId: 'cancel-purchase-return',
    tableId: 'purchase-returns-table',
    entityKey: DB.purchaseReturns,
    titleId: 'purchase-return-form-title',
    columns: ['number', 'date', 'supplier', 'vendorInvoice', (r) => r.items?.length || 0, (r) => r.status || 'قيد المعالجة'],
    collect: (existing, mode) => {
      const number = $('#purchase-return-number');
      const date = $('#purchase-return-date');
      const supplier = $('#purchase-return-supplier');
      const viSel = $('#purchase-return-vendor-invoice');
      const itemSel = $('#purchase-return-item');
      const qty = $('#purchase-return-quantity');
      const unit = $('#purchase-return-unit');
      const reason = $('#purchase-return-reason');
      const addBtn = $('#add-purchase-return-item');
      const tableBody = $('#purchase-return-items-table tbody');

      function renderInner() {
        if (!tableBody) return;
        tableBody.innerHTML = '';
        prItems.forEach((it, i) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${it.item}</td><td>${it.qty}</td><td>${it.unit}</td><td>${it.reason}</td><td><button class="delete-btn">حذف</button></td>`;
          on(tr.querySelector('.delete-btn'), 'click', () => { prItems.splice(i, 1); renderInner(); });
          tableBody.appendChild(tr);
        });
      }

      if (mode === 'fill') {
        prItems.length = 0;
        // fill VI dropdown
        const vis = store.get(DB.vendorInvoices, []);
        if (viSel) viSel.innerHTML = '<option value="">اختر فاتورة المورد (اختياري)</option>' + vis.map((v) => `<option value="${v.number}">${v.number}</option>`).join('');

        if (existing) {
          number.value = existing.number || '';
          date.value = existing.date || todayStr();
          supplier.value = existing.supplier || '';
          viSel.value = existing.vendorInvoice || '';
          (existing.items || []).forEach((x) => prItems.push({ ...x }));
        } else {
          number.value = '';
          date.value = todayStr();
          supplier.value = '';
          viSel.value = '';
        }
        renderInner();
      }

      if (mode === 'reset') { prItems.length = 0; renderInner(); }

      if (addBtn && !addBtn.dataset.bound) {
        addBtn.dataset.bound = '1';
        on(addBtn, 'click', (e) => {
          e.preventDefault();
          const itName = itemSel.value; if (!itName) return alert('اختر الصنف');
          const q = +qty.value || 0; if (!q) return alert('أدخل الكمية');
          const u = unit.value; if (!u) return alert('اختر الوحدة');
          const rsn = reason.value; if (!rsn) return alert('اختر السبب');
          prItems.push({ item: itName, qty: q, unit: u, reason: rsn });
          renderInner();
        });
      }

      if (mode === 'get') {
        const data = { number: number.value.trim(), date: date.value || todayStr(), supplier: supplier.value, vendorInvoice: viSel.value, items: [...prItems], status: 'قيد المعالجة' };
        if (!data.number || !data.supplier || data.items.length === 0) { alert('أكمل النموذج'); return null; }
        // reduce stock
        data.items.forEach((it) => {
          const items = store.get(DB.items, []);
          const i = items.findIndex((x) => x.name === it.item);
          if (i > -1) { items[i].stock = Math.max(0, (items[i].stock || 0) - it.qty); store.set(DB.items, items); }
        });
        renderItems();
        renderDashboard();
        return data;
      }
    },
  });

  // ===== Search binds =====
  on($('#search-items-btn'), 'click', (e) => { e.preventDefault(); renderItems(); });
  on($('#search-items'), 'input', renderItems);
  on($('#search-movements-btn'), 'click', (e) => { e.preventDefault(); renderMovements(); });
  on($('#search-movements'), 'input', renderMovements);
  on($('#search-purchase-orders'), 'input', () => poUI.render());
  on($('#search-vendor-invoices'), 'input', () => viUI.render());
  on($('#search-purchase-returns'), 'input', () => prUI.render());
  on($('#search-requisitions'), 'input', () => requisitionsUI.render());

  // ===== Init =====
  function renderAll() {
    renderSelectors();
    renderItems();
    renderCategories();
    renderUnits();
    renderWarehouses();
    renderMovements();
    requisitionsUI.render();
    poUI.render();
    viUI.render();
    prUI.render();
    renderDashboard();
  }

  updateAuthUI();
  if (getSession()) renderAll();

  // show inventory section by default after login
  // (Dashboard is active in HTML by default)
})();
/* Edara IMS - Complete single-file app.js
 * يدير: المصادقة، المخزون، المشتريات، المبيعات (POS)، العملاء، الموردين، المستخدمين، التقارير
 * يعتمد على localStorage. Defensive selectors: لا يفشل لو عنصر ناقص في HTML.
 *
 * Default account: username=admin  password=123456
 */
(function () {
  'use strict';

  // ======== Helpers ========
  const $ = (sel, ctx = document) => ctx && ctx.querySelector ? ctx.querySelector(sel) : null;
  const $$ = (sel, ctx = document) => ctx && ctx.querySelectorAll ? Array.from(ctx.querySelectorAll(sel)) : [];
  const on = (el, ev, fn) => { if (el) el.addEventListener(ev, fn); };
  const uid = (p = '') => p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
  const todayStr = () => new Date().toISOString().slice(0,10);
  const fmtN = new Intl.NumberFormat('ar-EG', { maximumFractionDigits: 2 });
  const money = (n) => (isFinite(+n) ? fmtN.format(+n) : '0');

  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : (d===undefined?null:d); } catch (e){console.error('store.get',e); return d;} },
    set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){console.error('store.set',e); } },
    remove(k){ localStorage.removeItem(k); }
  };

  // ======== DB Keys ========
  const DB = {
    users: 'edara_users',
    session: 'edara_session',
    items: 'edara_items',
    categories: 'edara_categories',
    units: 'edara_units',
    warehouses: 'edara_warehouses',
    movements: 'edara_movements',
    suppliers: 'edara_suppliers',
    customers: 'edara_customers',
    sales: 'edara_sales',
    salesDrafts: 'edara_sales_drafts',
    purchaseReqs: 'edara_purchase_reqs',
    purchaseOrders: 'edara_purchase_orders',
    vendorInvoices: 'edara_vendor_invoices',
    purchaseReturns: 'edara_purchase_returns',
  };

  // ======== Seed initial data if empty ========
  function seedIfEmpty() {
    if (!store.get(DB.users)) {
      store.set(DB.users, [
        { id: 'u_admin', username: 'admin', password: '123456', name: 'Admin', role: 'admin' },
      ]);
    }
    if (!store.get(DB.categories)) {
      store.set(DB.categories, [
        { id: uid('cat_'), name: 'مشروبات', parent: '' },
        { id: uid('cat_'), name: 'أغذية', parent: '' },
      ]);
    }
    if (!store.get(DB.units)) {
      store.set(DB.units, [
        { id: uid('unit_'), name: 'قطعة', symbol: 'قط' },
        { id: uid('unit_'), name: 'علبة', symbol: 'عل' },
      ]);
    }
    if (!store.get(DB.items)) {
      store.set(DB.items, [
        { id: uid('item_'), code: 'P-100', name: 'ماء 1.5ل', category: 'مشروبات', unit: 'قطعة', cost: 7, price: 10, min: 10, max: 500, stock: 150, description: '' },
        { id: uid('item_'), code: 'P-200', name: 'بسكويت شوكولاتة', category: 'أغذية', unit: 'علبة', cost: 5, price: 8, min: 20, max: 400, stock: 80, description: '' },
      ]);
    }
    if (!store.get(DB.warehouses)) {
      store.set(DB.warehouses, [
        { id: uid('wh_'), code: 'M-01', name: 'المخزن الرئيسي', type: 'رئيسي', branch: 'الفرع الرئيسي', address: 'القاهرة', manager: 'أحمد', phone: '0100', capacity: 1000 },
      ]);
    }
    if (!store.get(DB.suppliers)) {
      store.set(DB.suppliers, [
        { id: uid('sup_'), name: 'شركة الموردين المتحدة', phone: '0111', address: 'الجيزة', email: '' },
      ]);
    }
    if (!store.get(DB.customers)) {
      store.set(DB.customers, [
        { id: uid('cus_'), name: 'عميل افتراضي', phone: '0122', email: '' },
      ]);
    }
    if (!store.get(DB.sales)) store.set(DB.sales, []);
    if (!store.get(DB.salesDrafts)) store.set(DB.salesDrafts, []);
    if (!store.get(DB.movements)) store.set(DB.movements, []);
    if (!store.get(DB.purchaseReqs)) store.set(DB.purchaseReqs, []);
    if (!store.get(DB.purchaseOrders)) store.set(DB.purchaseOrders, []);
    if (!store.get(DB.vendorInvoices)) store.set(DB.vendorInvoices, []);
    if (!store.get(DB.purchaseReturns)) store.set(DB.purchaseReturns, []);
  }
  seedIfEmpty();

  // ======== Auth ========
  const loginForm = $('#login-form');
  const logoutBtn = $('#logout-btn');
  const userGreeting = $('#user-greeting');

  function setSession(user) { store.set(DB.session, user ? { id: user.id, username: user.username, name: user.name, role: user.role } : null); }
  function getSession() { return store.get(DB.session, null); }

  function updateAuthUI() {
    const sess = getSession();
    const loginPage = $('#login-page');
    const dashboard = $('#dashboard');
    if (sess) {
      if (loginPage) loginPage.style.display = 'none';
      if (dashboard) dashboard.style.display = 'block';
      if (userGreeting) userGreeting.textContent = 'مرحباً، ' + (sess.name || sess.username);
    } else {
      if (loginPage) loginPage.style.display = 'flex';
      if (dashboard) dashboard.style.display = 'none';
    }
  }

  if (loginForm) {
    on(loginForm, 'submit', function (e) {
      e.preventDefault();
      const username = ($('#username') && $('#username').value.trim()) || '';
      const password = ($('#password') && $('#password').value) || '';
      const users = store.get(DB.users, []);
      const u = users.find(x => x.username === username && x.password === password);
      const loginAlert = $('#login-alert');
      if (u) {
        setSession(u);
        if (loginAlert) { loginAlert.style.display = 'none'; loginAlert.textContent = ''; }
        updateAuthUI();
        renderAll();
      } else {
        if (loginAlert) { loginAlert.style.display = 'block'; loginAlert.textContent = 'بيانات الدخول غير صحيحة'; }
      }
    });
  }
  if (logoutBtn) on(logoutBtn, 'click', () => { setSession(null); updateAuthUI(); });

  updateAuthUI();

  // ======== Sidebar navigation helpers ========
  const sections = $$('.section');
  function showSection(id) {
    sections.forEach(s => s.classList.remove('active'));
    const el = $('#' + id);
    if (el) el.classList.add('active');
  }
  // bind sidebar list items that have data-section
  $$('.sidebar li[data-section]').forEach(li => on(li, 'click', () => showSection(li.getAttribute('data-section'))));

  // ======== Generic Tabs ========
  function initTabs(scope = document) {
    $$('.tabs', scope).forEach(tabs => {
      const parent = tabs.parentElement;
      if (!parent) return;
      const tabBtns = $$('.tab', parent);
      tabBtns.forEach(btn => on(btn, 'click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        $$('.tab-content', parent).forEach(c => c.classList.remove('active'));
        const id = btn.getAttribute('data-tab');
        const pane = $('#' + id, parent);
        if (pane) pane.classList.add('active');
      }));
    });
  }
  initTabs();

  // ======== Render Selects helper ========
  function fillSelectOptions(select, list, labelKey = 'name') {
    if (!select) return;
    const cur = select.value;
    select.innerHTML = '<option value="">اختر</option>' + (list || []).map(r => `<option value="${r[labelKey]}">${r[labelKey]}</option>`).join('');
    if (cur) select.value = cur;
  }

  // ======== Dashboard Widgets ========
  function renderDashboardWidgets() {
    const items = store.get(DB.items, []);
    const sales = store.get(DB.sales, []);
    const customers = store.get(DB.customers, []);
    const suppliers = store.get(DB.suppliers, []);

    const tp = $('#total-products'); if (tp) tp.textContent = items.length;
    const ts = $('#total-sales'); if (ts) ts.textContent = sales.length;
    const tc = $('#total-clients'); if (tc) tc.textContent = customers.length;
    const tSup = $('#total-suppliers'); if (tSup) tSup.textContent = suppliers.length;

    const tbody = $('#recent-sales tbody');
    if (tbody) {
      tbody.innerHTML = '';
      sales.slice(-10).reverse().forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s.number||'—'}</td><td>${s.customer||'—'}</td><td>${s.items?.length||0}</td><td>${money(s.total||0)}</td><td>${s.date||'—'}</td>`;
        tbody.appendChild(tr);
      });
    }
  }

  // ======== Items (Inventory) ========
  function renderItems(searchQ) {
    const items = store.get(DB.items, []);
    const tbody = $('#items-table tbody'); if (!tbody) return;
    const q = (searchQ !== undefined) ? searchQ : (($('#search-items') && $('#search-items').value.trim()) || '');
    const filtered = q ? items.filter(it => Object.values(it).join(' ').includes(q)) : items;
    tbody.innerHTML = '';
    filtered.forEach((it, idx) => {
      const tr = document.createElement('tr');
      const badgeClass = (it.stock <= it.min) ? 'badge-danger' : (it.stock <= (it.min*1.5)) ? 'badge-warning' : 'badge-success';
      tr.innerHTML = `<td>${idx+1}</td><td>${it.code||''}</td><td>${it.name||''}</td><td>${it.category||''}</td><td>${it.unit||''}</td><td>${money(it.cost)}</td><td>${money(it.price)}</td><td><span class="badge ${badgeClass}">${it.stock||0}</span></td><td class="actions"><button class="edit-btn">تعديل</button> <button class="delete-btn">حذف</button></td>`;
      on(tr.querySelector('.edit-btn'), 'click', () => openItemForm(it));
      on(tr.querySelector('.delete-btn'), 'click', () => {
        if (confirm('تأكيد حذف الصنف؟')) {
          const list = store.get(DB.items, []).filter(x => x.id !== it.id);
          store.set(DB.items, list); renderItems(); renderDashboardWidgets();
        }
      });
      tbody.appendChild(tr);
    });
  }

  // Item form handlers (add/edit)
  const itemForm = $('#item-form');
  function openItemForm(existing) {
    if (!itemForm) return;
    itemForm.style.display = 'block';
    $('#item-form-title').textContent = existing ? 'تعديل صنف' : 'إضافة صنف';
    $('#item-code').value = existing?.code || '';
    $('#item-name').value = existing?.name || '';
    $('#item-category').value = existing?.category || '';
    $('#item-unit').value = existing?.unit || '';
    $('#item-cost').value = existing?.cost ?? '';
    $('#item-price').value = existing?.price ?? '';
    $('#item-min').value = existing?.min ?? '';
    $('#item-max').value = existing?.max ?? '';
    $('#item-stock').value = existing?.stock ?? 0;
    $('#item-description').value = existing?.description || '';
    itemForm.dataset.editingId = existing?.id || '';
  }
  function closeItemForm(){ if (itemForm) { itemForm.style.display = 'none'; itemForm.dataset.editingId=''; } }
  if ($('#add-item-btn')) on($('#add-item-btn'),'click',()=>openItemForm());
  if ($('#cancel-item')) on($('#cancel-item'),'click', closeItemForm);
  if ($('#save-item')) on($('#save-item'),'click', ()=>{
    const code = ($('#item-code') && $('#item-code').value.trim()) || '';
    const name = ($('#item-name') && $('#item-name').value.trim()) || '';
    const category = ($('#item-category') && $('#item-category').value.trim()) || '';
    const unit = ($('#item-unit') && $('#item-unit').value.trim()) || '';
    const cost = +($('#item-cost') && $('#item-cost').value) || 0;
    const price = +($('#item-price') && $('#item-price').value) || 0;
    const min = +($('#item-min') && $('#item-min').value) || 0;
    const max = +($('#item-max') && $('#item-max').value) || 0;
    const stock = +($('#item-stock') && $('#item-stock').value) || 0;
    const description = ($('#item-description') && $('#item-description').value) || '';
    if (!code||!name||!category||!unit) return alert('أكمل الحقول المطلوبة');
    const list = store.get(DB.items, []);
    const editingId = itemForm.dataset.editingId;
    if (editingId) {
      const i = list.findIndex(x=>x.id===editingId);
      if (i>-1) list[i] = { ...list[i], code, name, category, unit, cost, price, min, max, stock, description };
    } else {
      list.push({ id: uid('item_'), code, name, category, unit, cost, price, min, max, stock, description });
    }
    store.set(DB.items, list); closeItemForm(); renderItems(); renderSelectors(); renderDashboardWidgets();
  });

  // ======== Categories & Units (simple tables) ========
  function renderCategories() {
    const cats = store.get(DB.categories, []);
    const tbody = $('#categories-table tbody'); if (!tbody) return;
    tbody.innerHTML = '';
    cats.forEach((c,i)=> {
      const count = store.get(DB.items,[]).filter(it=>it.category===c.name).length;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${c.name}</td><td>${c.parent||'—'}</td><td>${count}</td><td class="actions"><button class="edit-btn">تعديل</button> <button class="delete-btn">حذف</button></td>`;
      on(tr.querySelector('.edit-btn'), 'click', ()=> openCategoryForm(c));
      on(tr.querySelector('.delete-btn'), 'click', ()=> { if(confirm('حذف الفئة؟')){ store.set(DB.categories, cats.filter(x=>x.id!==c.id)); renderCategories(); renderSelectors(); }});
      tbody.appendChild(tr);
    });
  }
  const categoryForm = $('#category-form');
  function openCategoryForm(existing){ if(!categoryForm) return; categoryForm.style.display='block'; $('#category-form-title').textContent = existing? 'تعديل فئة':'إضافة فئة'; $('#category-name').value = existing?.name||''; $('#category-parent').value = existing?.parent||''; categoryForm.dataset.editingId = existing?.id||''; }
  function closeCategoryForm(){ if(categoryForm){ categoryForm.style.display='none'; categoryForm.dataset.editingId=''; } }
  if($('#add-category-btn')) on($('#add-category-btn'),'click',()=>openCategoryForm());
  if($('#cancel-category')) on($('#cancel-category'),'click', closeCategoryForm);
  if($('#save-category')) on($('#save-category'),'click', ()=>{
    const name = ($('#category-name') && $('#category-name').value.trim()) || '';
    const parent = ($('#category-parent') && $('#category-parent').value.trim()) || '';
    if(!name) return alert('أدخل اسم الفئة');
    const list = store.get(DB.categories, []);
    const id = categoryForm.dataset.editingId;
    if(id){ const i = list.findIndex(x=>x.id===id); if(i>-1) list[i] = {...list[i], name, parent}; }
    else list.push({ id: uid('cat_'), name, parent });
    store.set(DB.categories, list); closeCategoryForm(); renderCategories(); renderSelectors();
  });

  // Units
  function renderUnits() {
    const units = store.get(DB.units, []);
    const tbody = $('#units-table tbody'); if(!tbody) return; tbody.innerHTML='';
    units.forEach((u,i)=> {
      const count = store.get(DB.items,[]).filter(it=>it.unit===u.name).length;
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${u.name}</td><td>${u.symbol}</td><td>${count}</td><td class="actions"><button class="edit-btn">تعديل</button> <button class="delete-btn">حذف</button></td>`;
      on(tr.querySelector('.edit-btn'),'click', ()=> openUnitForm(u));
      on(tr.querySelector('.delete-btn'),'click', ()=> { if(confirm('حذف الوحدة؟')){ store.set(DB.units, units.filter(x=>x.id!==u.id)); renderUnits(); renderSelectors(); }});
      tbody.appendChild(tr);
    });
  }
  const unitForm = $('#unit-form');
  function openUnitForm(existing){ if(!unitForm) return; unitForm.style.display='block'; $('#unit-form-title').textContent = existing? 'تعديل وحدة':'إضافة وحدة'; $('#unit-name').value = existing?.name||''; $('#unit-symbol').value = existing?.symbol||''; unitForm.dataset.editingId = existing?.id||''; }
  function closeUnitForm(){ if(unitForm){ unitForm.style.display='none'; unitForm.dataset.editingId=''; } }
  if($('#add-unit-btn')) on($('#add-unit-btn'),'click',()=>openUnitForm());
  if($('#cancel-unit')) on($('#cancel-unit'),'click', closeUnitForm);
  if($('#save-unit')) on($('#save-unit'),'click', ()=>{
    const name = ($('#unit-name') && $('#unit-name').value.trim()) || '';
    const symbol = ($('#unit-symbol') && $('#unit-symbol').value.trim()) || '';
    if(!name||!symbol) return alert('أكمل حقول الوحدة');
    const list = store.get(DB.units, []);
    const id = unitForm.dataset.editingId;
    if(id){ const i=list.findIndex(x=>x.id===id); if(i>-1) list[i] = {...list[i], name, symbol}; }
    else list.push({ id: uid('unit_'), name, symbol });
    store.set(DB.units,list); closeUnitForm(); renderUnits(); renderSelectors();
  });

  // ======== Warehouses (already present earlier) ========
  function renderWarehouses() {
    const list = store.get(DB.warehouses, []);
    const tbody = $('#warehouses-table tbody'); if(!tbody) return; tbody.innerHTML='';
    list.forEach((w,i)=> {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${w.code}</td><td>${w.name}</td><td>${w.type}</td><td>${w.branch||'—'}</td><td>${w.address||'—'}</td><td>${w.manager||'—'}</td><td class="actions"><button class="edit-btn">تعديل</button> <button class="delete-btn">حذف</button></td>`;
      on(tr.querySelector('.edit-btn'),'click', ()=> openWhForm(w) );
      on(tr.querySelector('.delete-btn'),'click', ()=> { if(confirm('حذف المخزن؟')){ store.set(DB.warehouses, list.filter(x=>x.id!==w.id)); renderWarehouses(); renderSelectors(); }});
      tbody.appendChild(tr);
    });
  }
  const whForm = $('#warehouse-form');
  function openWhForm(existing){ if(!whForm) return; whForm.style.display='block'; $('#warehouse-form-title').textContent = existing? 'تعديل مخزن':'إضافة مخزن'; $('#warehouse-code').value = existing?.code||''; $('#warehouse-name').value = existing?.name||''; $('#warehouse-type').value = existing?.type||'رئيسي'; $('#warehouse-branch').value = existing?.branch||''; $('#warehouse-address').value = existing?.address||''; $('#warehouse-manager').value = existing?.manager||''; $('#warehouse-phone').value = existing?.phone||''; $('#warehouse-capacity').value = existing?.capacity||''; whForm.dataset.editingId = existing?.id||''; }
  function closeWhForm(){ if(whForm){ whForm.style.display='none'; whForm.dataset.editingId=''; } }
  if($('#add-warehouse-btn')) on($('#add-warehouse-btn'),'click', ()=> openWhForm() );
  if($('#cancel-warehouse')) on($('#cancel-warehouse'),'click', closeWhForm);
  if($('#save-warehouse')) on($('#save-warehouse'),'click', ()=>{
    const code = ($('#warehouse-code') && $('#warehouse-code').value.trim()) || '';
    const name = ($('#warehouse-name') && $('#warehouse-name').value.trim()) || '';
    const type = ($('#warehouse-type') && $('#warehouse-type').value) || 'رئيسي';
    const branch = ($('#warehouse-branch') && $('#warehouse-branch').value.trim()) || '';
    const address = ($('#warehouse-address') && $('#warehouse-address').value.trim()) || '';
    const manager = ($('#warehouse-manager') && $('#warehouse-manager').value.trim()) || '';
    const phone = ($('#warehouse-phone') && $('#warehouse-phone').value.trim()) || '';
    const capacity = +($('#warehouse-capacity') && $('#warehouse-capacity').value) || 0;
    if(!code||!name) return alert('أدخل كود واسم المخزن');
    const list = store.get(DB.warehouses, []);
    const id = whForm.dataset.editingId;
    if(id){ const i=list.findIndex(x=>x.id===id); if(i>-1) list[i] = {...list[i], code, name, type, branch, address, manager, phone, capacity}; }
    else list.push({ id: uid('wh_'), code, name, type, branch, address, manager, phone, capacity});
    store.set(DB.warehouses,list); closeWhForm(); renderWarehouses(); renderSelectors();
  });

  // ======== Movements ========
  function renderMovements() {
    const list = store.get(DB.movements, []);
    const tbody = $('#movements-table tbody'); if(!tbody) return;
    const q = ($('#search-movements') && $('#search-movements').value.trim()) || '';
    const filtered = q ? list.filter(m => Object.values(m).join(' ').includes(q)) : list;
    tbody.innerHTML = '';
    filtered.forEach((m,i)=> {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${m.type}</td><td>${m.date}</td><td>${m.item}</td><td>${m.qty}</td><td>${m.source||'—'}</td><td>${m.dest||'—'}</td><td>${m.ref||'—'}</td><td class="actions"><button class="edit-btn">تعديل</button> <button class="delete-btn">حذف</button></td>`;
      on(tr.querySelector('.edit-btn'),'click', ()=> openMoveForm(m));
      on(tr.querySelector('.delete-btn'),'click', ()=> { if(confirm('حذف الحركة؟')){ store.set(DB.movements, list.filter(x=>x.id!==m.id)); renderMovements(); }});
      tbody.appendChild(tr);
    });
  }

  const moveForm = $('#movement-form');
  function openMoveForm(existing){
    if(!moveForm) return;
    moveForm.style.display='block';
    $('#movement-form-title').textContent = existing? 'تعديل حركة' : 'إضافة حركة';
    $('#movement-type').value = existing?.type || 'إضافة';
    $('#movement-date').value = existing?.date || todayStr();
    $('#movement-item').value = existing?.item || '';
    $('#movement-quantity').value = existing?.qty || '';
    $('#movement-source').value = existing?.source || '';
    $('#movement-destination').value = existing?.dest || '';
    $('#movement-reference').value = existing?.ref || '';
    $('#movement-notes').value = existing?.notes || '';
    moveForm.dataset.editingId = existing?.id || '';
  }
  function closeMoveForm(){ if(moveForm){ moveForm.style.display='none'; moveForm.dataset.editingId=''; } }
  if($('#add-movement-btn')) on($('#add-movement-btn'),'click', ()=> openMoveForm());
  if($('#cancel-movement')) on($('#cancel-movement'),'click', closeMoveForm);
  if($('#save-movement')) on($('#save-movement'),'click', ()=>{
    const type = ($('#movement-type') && $('#movement-type').value) || 'إضافة';
    const date = ($('#movement-date') && $('#movement-date').value) || todayStr();
    const itemName = ($('#movement-item') && $('#movement-item').value) || '';
    const qty = +($('#movement-quantity') && $('#movement-quantity').value) || 0;
    const source = ($('#movement-source') && $('#movement-source').value) || '';
    const dest = ($('#movement-destination') && $('#movement-destination').value) || '';
    const ref = ($('#movement-reference') && $('#movement-reference').value) || '';
    const notes = ($('#movement-notes') && $('#movement-notes').value) || '';
    if(!itemName||!qty) return alert('اختر الصنف وأدخل الكمية');
    const movements = store.get(DB.movements, []);
    const editingId = moveForm.dataset.editingId;
    function adjustStock(name, delta){
      const items = store.get(DB.items, []);
      const i = items.findIndex(x=>x.name===name);
      if(i>-1){ items[i].stock = (items[i].stock||0) + delta; store.set(DB.items, items); }
    }
    if(editingId){
      const idx = movements.findIndex(x=>x.id===editingId);
      if(idx>-1){
        const prev = movements[idx];
        if(prev.type === 'إضافة') adjustStock(prev.item, -prev.qty);
        if(prev.type === 'صرف') adjustStock(prev.item, +prev.qty);
        movements[idx] = {...prev, type, date, item: itemName, qty, source, dest, ref, notes};
      }
    } else {
      movements.push({ id: uid('mov_'), type, date, item: itemName, qty, source, dest, ref, notes });
    }
    if(type === 'إضافة') adjustStock(itemName, qty);
    if(type === 'صرف') adjustStock(itemName, -qty);
    store.set(DB.movements, movements);
    closeMoveForm(); renderMovements(); renderItems(); renderDashboardWidgets();
  });

  // ======== Suppliers CRUD ========
  function renderSuppliers() {
    const list = store.get(DB.suppliers, []);
    const tbody = $('#suppliers-table tbody'); if(!tbody) return; tbody.innerHTML='';
    list.forEach((s,i)=> {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${s.name}</td><td>${s.phone||'—'}</td><td>${s.address||'—'}</td><td class="actions"><button class="edit-btn">تعديل</button> <button class="delete-btn">حذف</button></td>`;
      on(tr.querySelector('.edit-btn'),'click', ()=> openSupplierForm(s));
      on(tr.querySelector('.delete-btn'),'click', ()=> { if(confirm('حذف المورد؟')){ store.set(DB.suppliers, list.filter(x=>x.id!==s.id)); renderSuppliers(); renderSelectors(); }});
      tbody.appendChild(tr);
    });
  }
  const supplierForm = $('#supplier-form');
  function openSupplierForm(existing){ if(!supplierForm) return; supplierForm.style.display='block'; $('#supplier-form-title').textContent = existing? 'تعديل مورد':'إضافة مورد'; $('#supplier-name').value = existing?.name||''; $('#supplier-phone').value = existing?.phone||''; $('#supplier-address').value = existing?.address||''; $('#supplier-email').value = existing?.email||''; supplierForm.dataset.editingId = existing?.id||''; }
  function closeSupplierForm(){ if(supplierForm){ supplierForm.style.display='none'; supplierForm.dataset.editingId=''; } }
  if($('#add-supplier-btn')) on($('#add-supplier-btn'),'click', ()=> openSupplierForm());
  if($('#cancel-supplier')) on($('#cancel-supplier'),'click', closeSupplierForm);
  if($('#save-supplier')) on($('#save-supplier'),'click', ()=>{
    const name = ($('#supplier-name') && $('#supplier-name').value.trim()) || '';
    const phone = ($('#supplier-phone') && $('#supplier-phone').value.trim()) || '';
    const addr = ($('#supplier-address') && $('#supplier-address').value.trim()) || '';
    const email = ($('#supplier-email') && $('#supplier-email').value.trim()) || '';
    if(!name) return alert('أدخل اسم المورد');
    const list = store.get(DB.suppliers, []);
    const id = supplierForm.dataset.editingId;
    if(id){ const i=list.findIndex(x=>x.id===id); if(i>-1) list[i] = {...list[i], name, phone, address:addr, email}; }
    else list.push({ id: uid('sup_'), name, phone, address:addr, email });
    store.set(DB.suppliers,list); closeSupplierForm(); renderSuppliers(); renderSelectors();
  });

  // ======== Customers CRUD ========
  function renderCustomers() {
    const list = store.get(DB.customers, []);
    const tbody = $('#customers-table tbody'); if(!tbody) return; tbody.innerHTML='';
    list.forEach((c,i)=> {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${c.name}</td><td>${c.phone||'—'}</td><td>${c.email||'—'}</td><td class="actions"><button class="edit-btn">تعديل</button> <button class="delete-btn">حذف</button></td>`;
      on(tr.querySelector('.edit-btn'),'click', ()=> openCustomerForm(c));
      on(tr.querySelector('.delete-btn'),'click', ()=> { if(confirm('حذف العميل؟')){ store.set(DB.customers, list.filter(x=>x.id!==c.id)); renderCustomers(); renderSelectors(); }});
      tbody.appendChild(tr);
    });
  }
  const customerForm = $('#customer-form');
  function openCustomerForm(existing){ if(!customerForm) return; customerForm.style.display='block'; $('#customer-form-title').textContent = existing? 'تعديل عميل':'إضافة عميل'; $('#customer-name').value = existing?.name||''; $('#customer-phone').value = existing?.phone||''; $('#customer-email').value = existing?.email||''; customerForm.dataset.editingId = existing?.id||''; }
  function closeCustomerForm(){ if(customerForm){ customerForm.style.display='none'; customerForm.dataset.editingId=''; } }
  if($('#add-customer-btn')) on($('#add-customer-btn'),'click', ()=> openCustomerForm());
  if($('#cancel-customer')) on($('#cancel-customer'),'click', closeCustomerForm);
  if($('#save-customer')) on($('#save-customer'),'click', ()=>{
    const name = ($('#customer-name') && $('#customer-name').value.trim()) || '';
    const phone = ($('#customer-phone') && $('#customer-phone').value.trim()) || '';
    const email = ($('#customer-email') && $('#customer-email').value.trim()) || '';
    if(!name) return alert('أدخل اسم العميل');
    const list = store.get(DB.customers, []);
    const id = customerForm.dataset.editingId;
    if(id){ const i=list.findIndex(x=>x.id===id); if(i>-1) list[i] = {...list[i], name, phone, email}; }
    else list.push({ id: uid('cus_'), name, phone, email });
    store.set(DB.customers, list); closeCustomerForm(); renderCustomers(); renderSelectors();
  });

  // ======== Users (manage users & change password) ========
  function renderUsers() {
    const list = store.get(DB.users, []);
    const tbody = $('#users-table tbody'); if(!tbody) return; tbody.innerHTML='';
    list.forEach((u,i)=> {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${u.username}</td><td>${u.name||'—'}</td><td>${u.role||'user'}</td><td class="actions"><button class="edit-btn">تعديل</button> <button class="delete-btn">حذف</button></td>`;
      on(tr.querySelector('.edit-btn'),'click', ()=> openUserForm(u));
      on(tr.querySelector('.delete-btn'),'click', ()=> { if(confirm('حذف المستخدم؟')){ store.set(DB.users, list.filter(x=>x.id!==u.id)); renderUsers(); }});
      tbody.appendChild(tr);
    });
  }
  const userForm = $('#user-form');
  function openUserForm(existing){ if(!userForm) return; userForm.style.display='block'; $('#user-form-title').textContent = existing? 'تعديل مستخدم':'إضافة مستخدم'; $('#user-username').value = existing?.username||''; $('#user-name').value = existing?.name||''; $('#user-role').value = existing?.role||'user'; $('#user-password').value = ''; userForm.dataset.editingId = existing?.id||''; }
  function closeUserForm(){ if(userForm){ userForm.style.display='none'; userForm.dataset.editingId=''; } }
  if($('#add-user-btn')) on($('#add-user-btn'),'click', ()=> openUserForm());
  if($('#cancel-user')) on($('#cancel-user'),'click', closeUserForm);
  if($('#save-user')) on($('#save-user'),'click', ()=>{
    const username = ($('#user-username') && $('#user-username').value.trim()) || '';
    const name = ($('#user-name') && $('#user-name').value.trim()) || '';
    const role = ($('#user-role') && $('#user-role').value) || 'user';
    const password = ($('#user-password') && $('#user-password').value) || '';
    if(!username) return alert('أدخل اسم المستخدم');
    const list = store.get(DB.users, []);
    const id = userForm.dataset.editingId;
    if(id){
      const i=list.findIndex(x=>x.id===id);
      if(i>-1){ list[i] = {...list[i], username, name, role}; if(password) list[i].password = password; }
    } else {
      if(!password) return alert('أدخل كلمة السر للمستخدم الجديد');
      list.push({ id: uid('u_'), username, name, role, password });
    }
    store.set(DB.users,list); closeUserForm(); renderUsers();
  });

  // Change password for logged-in user
  if($('#change-password-form')) {
    on($('#change-password-form'),'submit', (e)=>{
      e.preventDefault();
      const oldp = ($('#old-password') && $('#old-password').value) || '';
      const newp = ($('#new-password') && $('#new-password').value) || '';
      const confirmp = ($('#confirm-password') && $('#confirm-password').value) || '';
      const sess = getSession();
      if(!sess) return alert('يجب تسجيل الدخول');
      const users = store.get(DB.users, []);
      const me = users.find(x=>x.id===sess.id || x.username===sess.username);
      if(!me) return alert('المستخدم غير موجود');
      if(me.password !== oldp) return alert('كلمة المرور القديمة غير صحيحة');
      if(!newp || newp !== confirmp) return alert('تأكد من كلمة المرور الجديدة ومطابقتها');
      me.password = newp;
      store.set(DB.users, users);
      alert('تم تغيير كلمة السر');
      $('#old-password').value=''; $('#new-password').value=''; $('#confirm-password').value='';
    });
  }

  // ======== Sales (POS / Invoice) ========
  // Simple cart-based POS: add items to cart, choose customer, checkout -> creates sale and reduces stock
  let CART = []; // { itemName, qty, price, unit }
  function renderPOSItems() {
    const items = store.get(DB.items, []);
    const wrap = $('#pos-items'); if(!wrap) return;
    wrap.innerHTML = items.map(it => `<div class="pos-item" data-name="${it.name}" data-price="${it.price}"><strong>${it.name}</strong><div>${money(it.price)}</div><div>المخزون: ${it.stock||0}</div></div>`).join('');
    $$('.pos-item', wrap).forEach(el=>{
      on(el,'click', ()=> {
        const name = el.getAttribute('data-name');
        const price = +el.getAttribute('data-price')||0;
        addToCart(name,1,price);
      });
    });
  }
  function addToCart(name, qty=1, price=0, unit=''){ 
    const idx = CART.findIndex(c=>c.itemName===name);
    if(idx>-1) CART[idx].qty += qty;
    else CART.push({ itemName: name, qty, price, unit });
    renderCart();
  }
  function renderCart(){
    const tbody = $('#cart-items'); if(!tbody) return; tbody.innerHTML='';
    CART.forEach((c,i)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${c.itemName}</td><td><button class="dec">-</button> ${c.qty} <button class="inc">+</button></td><td>${money(c.price)}</td><td>${money(c.qty*c.price)}</td><td><button class="remove">حذف</button></td>`;
      on(tr.querySelector('.dec'),'click', ()=> { if(c.qty>1){ c.qty--; } else CART.splice(i,1); renderCart(); });
      on(tr.querySelector('.inc'),'click', ()=> { c.qty++; renderCart(); });
      on(tr.querySelector('.remove'),'click', ()=> { CART.splice(i,1); renderCart(); });
      tbody.appendChild(tr);
    });
    const total = CART.reduce((s,x)=>s + (x.qty * x.price), 0);
    const totalEl = $('#cart-total'); if(totalEl) totalEl.textContent = money(total);
  }
  if($('#pos-clear-cart')) on($('#pos-clear-cart'),'click', ()=> { CART = []; renderCart(); });
  if($('#pos-add-manual')) on($('#pos-add-manual'),'click', ()=> {
    const name = prompt('اسم المنتج:'); if(!name) return;
    const price = +prompt('السعر:')||0;
    addToCart(name,1,price);
  });

  if($('#pos-customer')) {
    // fill customers select
    const sel = $('#pos-customer');
    function fillCustomersToPos(){ fillSelectOptions(sel, store.get(DB.customers,[])); }
    fillCustomersToPos();
    // open customer form should re-fill
    if($('#add-customer-btn')) on($('#add-customer-btn'),'click', fillCustomersToPos);
  }

  // Checkout: create sale record, reduce stock (if matches existing item)
  if($('#pos-checkout')) on($('#pos-checkout'),'click', ()=> {
    if(CART.length===0) return alert('السلة فارغة');
    const customer = ($('#pos-customer') && $('#pos-customer').value) || 'نقدي';
    const date = todayStr();
    const number = 'S-' + (store.get(DB.sales,[]).length + 1).toString().padStart(4,'0');
    const total = CART.reduce((s,x)=>s + x.qty*x.price,0);
    const sale = { id: uid('sale_'), number, customer, date, items: JSON.parse(JSON.stringify(CART)), total, status: 'مدفوع' };
    // reduce stock for matching items
    const items = store.get(DB.items, []);
    sale.items.forEach(it => {
      const i = items.findIndex(x=>x.name === it.itemName);
      if(i>-1){ items[i].stock = Math.max(0, (items[i].stock||0) - it.qty); }
    });
    store.set(DB.items, items);
    const salesList = store.get(DB.sales, []);
    salesList.push(sale); store.set(DB.sales, salesList);
    CART = []; renderCart(); renderItems(); renderDashboardWidgets(); renderSales(); renderPOSItems();
    alert('تم إنشاء الفاتورة: ' + number);
  });

  // Sales table view
  function renderSales() {
    const list = store.get(DB.sales, []);
    const tbody = $('#sales-table tbody'); if(!tbody) return; tbody.innerHTML='';
    list.forEach((s,i)=> {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${s.number}</td><td>${s.customer||'—'}</td><td>${s.items?.length||0}</td><td>${money(s.total||0)}</td><td>${s.date||'—'}</td><td class="actions"><button class="view-btn">عرض</button> <button class="delete-btn">حذف</button></td>`;
      on(tr.querySelector('.view-btn'),'click', ()=> { alert('فاتورة '+s.number + '\\nالعميل: '+s.customer + '\\nالمجموع: ' + money(s.total)); });
      on(tr.querySelector('.delete-btn'),'click', ()=> { if(confirm('حذف الفاتورة؟')){ store.set(DB.sales, list.filter(x=>x.id!==s.id)); renderSales(); renderDashboardWidgets(); }});
      tbody.appendChild(tr);
    });
  }

  // ======== Purchase flows (orders, invoices, returns) ========
  // We'll reuse earlier simpleTableHandlers approach for purchase orders and invoices. But to keep file size reasonable, we implement basic render/save for purchase orders and vendor invoices.

  // Purchase Orders basic CRUD
  function renderPurchaseOrders() {
    const list = store.get(DB.purchaseOrders, []);
    const tbody = $('#purchase-orders-table tbody'); if(!tbody) return; tbody.innerHTML='';
    list.forEach((p,i)=> {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${p.number||'—'}</td><td>${p.supplier||'—'}</td><td>${p.items?.length||0}</td><td>${money(p.net||0)}</td><td>${p.date||'—'}</td><td class="actions"><button class="view-btn">عرض</button> <button class="delete-btn">حذف</button></td>`;
      on(tr.querySelector('.view-btn'),'click', ()=> { alert('أمر شراء '+p.number+'\\nالمورد: '+p.supplier+'\\nالمجموع: '+money(p.net)); });
      on(tr.querySelector('.delete-btn'),'click', ()=> { if(confirm('حذف أمر الشراء؟')){ store.set(DB.purchaseOrders, list.filter(x=>x.id!==p.id)); renderPurchaseOrders(); }});
      tbody.appendChild(tr);
    });
  }
  // Vendor invoices
  function renderVendorInvoices() {
    const list = store.get(DB.vendorInvoices, []);
    const tbody = $('#vendor-invoices-table tbody'); if(!tbody) return; tbody.innerHTML='';
    list.forEach((v,i)=> {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${v.number||'—'}</td><td>${v.supplier||'—'}</td><td>${v.items?.length||0}</td><td>${money(v.net||0)}</td><td>${v.date||'—'}</td><td class="actions"><button class="view-btn">عرض</button> <button class="delete-btn">حذف</button></td>`;
      on(tr.querySelector('.view-btn'),'click', ()=> { alert('فاتورة مورد '+v.number+'\\nالمورد: '+v.supplier+'\\nالمجموع: '+money(v.net)); });
      on(tr.querySelector('.delete-btn'),'click', ()=> { if(confirm('حذف الفاتورة؟')){ store.set(DB.vendorInvoices, list.filter(x=>x.id!==v.id)); renderVendorInvoices(); }});
      tbody.appendChild(tr);
    });
  }

  // ======== Purchase Returns (simple) ========
  function renderPurchaseReturns() {
    const list = store.get(DB.purchaseReturns, []);
    const tbody = $('#purchase-returns-table tbody'); if(!tbody) return; tbody.innerHTML='';
    list.forEach((r,i)=> {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${r.number||'—'}</td><td>${r.supplier||'—'}</td><td>${r.items?.length||0}</td><td>${r.date||'—'}</td><td class="actions"><button class="view-btn">عرض</button> <button class="delete-btn">حذف</button></td>`;
      on(tr.querySelector('.view-btn'),'click', ()=> { alert('مرتجع شراء '+r.number+'\\nالمورد: '+r.supplier); });
      on(tr.querySelector('.delete-btn'),'click', ()=> { if(confirm('حذف المرتجع؟')){ store.set(DB.purchaseReturns, list.filter(x=>x.id!==r.id)); renderPurchaseReturns(); }});
      tbody.appendChild(tr);
    });
  }

  // ======== Reports (simple) ========
  function renderReports() {
    // Inventory report
    const items = store.get(DB.items, []);
    const invWrap = $('#report-inventory'); if(invWrap) {
      invWrap.innerHTML = items.map(it => `<div>${it.code || ''} - ${it.name} — المخزون: ${it.stock||0} — السعر: ${money(it.price)}</div>`).join('');
    }
    // Sales summary
    const sales = store.get(DB.sales, []);
    const byDate = {};
    sales.forEach(s => { const d = s.date||todayStr(); byDate[d] = (byDate[d]||0) + (s.total||0); });
    const salesWrap = $('#report-sales'); if(salesWrap) {
      salesWrap.innerHTML = Object.keys(byDate).map(d => `<div>${d} — ${money(byDate[d])}</div>`).join('');
    }
  }

  // ======== Selectors rendering (fill selects used across forms) ========
  function renderSelectors() {
    const cats = store.get(DB.categories, []);
    const units = store.get(DB.units, []);
    const items = store.get(DB.items, []);
    const warehouses = store.get(DB.warehouses, []);
    const suppliers = store.get(DB.suppliers, []);
    const customers = store.get(DB.customers, []);

    fillSelectOptions($('#item-category'), cats);
    fillSelectOptions($('#item-unit'), units);
    fillSelectOptions($('#movement-item'), items, 'name');
    fillSelectOptions($('#movement-source'), warehouses, 'name');
    fillSelectOptions($('#movement-destination'), warehouses, 'name');

    fillSelectOptions($('#purchase-order-supplier'), suppliers, 'name');
    fillSelectOptions($('#purchase-order-warehouse'), warehouses, 'name');
    fillSelectOptions($('#purchase-order-item'), items, 'name');
    fillSelectOptions($('#purchase-order-unit'), units);

    fillSelectOptions($('#vendor-invoice-supplier'), suppliers, 'name');
    fillSelectOptions($('#vendor-invoice-item'), items, 'name');
    fillSelectOptions($('#vendor-invoice-unit'), units);

    fillSelectOptions($('#purchase-return-supplier'), suppliers, 'name');
    fillSelectOptions($('#purchase-return-item'), items, 'name');
    fillSelectOptions($('#purchase-return-unit'), units);

    fillSelectOptions($('#pos-customer'), customers, 'name');
  }

  // ======== Search binds ========
  if($('#search-items')) on($('#search-items'),'input', ()=> renderItems($('#search-items').value.trim()));
  if($('#search-movements')) on($('#search-movements'),'input', renderMovements);

  // ======== Initial render of all components ========
  function renderAll() {
    renderSelectors();
    renderItems();
    renderCategories();
    renderUnits();
    renderWarehouses();
    renderMovements();
    renderSuppliers();
    renderCustomers();
    renderUsers();
    renderPOSItems();
    renderCart();
    renderSales();
    renderPurchaseOrders();
    renderVendorInvoices();
    renderPurchaseReturns();
    renderReports();
    renderDashboardWidgets();
  }

  // expose a few functions for debugging on window (optional)
  window.Edara = {
    renderAll, renderItems, renderSales, renderSuppliers, renderCustomers, renderUsers, clearData(){ if(confirm('محو كل بيانات localStorage (ما عدا users)؟')){ const keys = Object.values(DB); keys.forEach(k=>store.remove(k)); seedIfEmpty(); renderAll(); } }
  };

  // run initial render if logged in
  if (getSession()) renderAll();

})();
/* Sales + Customers + Shipping module for Edara
   - Quotations, Sales Orders, Sales Invoices, Sales Returns
   - Customers CRUD
   - Shipping tracking
   - Integrates with inventory via localStorage keys (edara_items ...)
   - Defensive selectors: safe if some HTML parts absent
*/
(function(){
  'use strict';

  // --- helpers (safe DOM, uid, store) ---
  const $ = (s, ctx=document)=> ctx && ctx.querySelector ? ctx.querySelector(s) : null;
  const $$ = (s, ctx=document)=> ctx && ctx.querySelectorAll ? Array.from(ctx.querySelectorAll(s)) : [];
  const on = (el,ev,fn)=> { if(!el) return; el.addEventListener(ev,fn); };
  const uid = (p='')=> p + Math.random().toString(36).slice(2,8) + Date.now().toString(36).slice(-4);
  const today = ()=> new Date().toISOString().slice(0,10);
  const fmt = n => (isFinite(+n) ? (+n).toLocaleString('en-US', {maximumFractionDigits:2}) : '0');

  const store = {
    get(k, d=[]){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : (d===undefined?null:d); }catch(e){ console.error(e); return d; } },
    set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){ console.error(e); } },
  };

  // --- keys (compatible with existing app) ---
  const K = {
    items: 'edara_items',
    customers: 'edara_customers',
    quotations: 'edara_quotations',
    salesOrders: 'edara_sales_orders',
    salesInvoices: 'edara_sales_invoices',
    salesReturns: 'edara_sales_returns',
    sales: 'edara_sales', // overall sales ledger (optional)
    shippings: 'edara_shippings'
  };

  // ensure arrays exist
  if(!store.get(K.quotations)) store.set(K.quotations, []);
  if(!store.get(K.salesOrders)) store.set(K.salesOrders, []);
  if(!store.get(K.salesInvoices)) store.set(K.salesInvoices, []);
  if(!store.get(K.salesReturns)) store.set(K.salesReturns, []);
  if(!store.get(K.customers)) store.set(K.customers, store.get(K.customers, []));
  if(!store.get(K.sales)) store.set(K.sales, []);
  if(!store.get(K.shippings)) store.set(K.shippings, []);

  // --- Utility: update dashboard counters (uses ids in index.html) ---
  function updateDashboard() {
    try {
      const items = store.get(K.items, []);
      const salesAll = store.get(K.sales, []);
      const customers = store.get(K.customers, []);
      const suppliersCount = (()=> {
        // if you have edara_suppliers key
        const sup = store.get('edara_suppliers', []);
        return sup ? sup.length : 0;
      })();
      if($('#total-products')) $('#total-products').textContent = items.length;
      if($('#total-sales')) $('#total-sales').textContent = salesAll.length;
      if($('#total-clients')) $('#total-clients').textContent = customers.length;
      if($('#total-suppliers')) $('#total-suppliers').textContent = suppliersCount;
      // recent sales table (dashboard)
      const tbody = $('#recent-sales tbody');
      if(tbody){
        tbody.innerHTML = '';
        const s = store.get(K.salesInvoices, []).slice(-10).reverse();
        s.forEach(inv=>{
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${inv.number||inv.id}</td><td>${inv.customer||'—'}</td><td>${(inv.items||[]).map(i=>i.name).join(', ')}</td><td>${(inv.items||[]).reduce((a,b)=>a+(b.qty||0),0)}</td><td>${fmt(inv.net||0)}</td><td>${inv.date||'—'}</td>`;
          tbody.appendChild(tr);
        });
      }
    } catch(e){ console.error(e); }
  }

  // --- Select-fill helpers used across modules ---
  function fillSelect(selectEl, list, valueKey='name') {
    if(!selectEl) return;
    const cur = selectEl.value;
    let html = '<option value="">اختر</option>';
    (list||[]).forEach(it => html += `<option value="${it.id||it[valueKey]||it.name}">${it[valueKey]||it.name}</option>`);
    selectEl.innerHTML = html;
    if(cur) selectEl.value = cur;
  }

  // fill item-selects and customer-selects used by forms
  function refreshGlobalSelectors(){
    const items = store.get(K.items, []);
    const customers = store.get(K.customers, []);
    // many selects by id in HTML
    const map = [
      'quotation-item','purchase-order-item','vendor-invoice-item','purchase-return-item',
      'sales-order-item','sales-invoice-item','sales-return-item'
    ];
    map.forEach(id => {
      const el = $('#'+id); if(el) fillSelect(el, items, 'name');
    });
    // customers
    const custMap = ['quotation-customer','sales-order-customer','sales-invoice-customer','sales-return-customer','pos-customer'];
    custMap.forEach(id => { const el = $('#'+id); if(el) fillSelect(el, customers, 'name'); });
    // fill sales-order / invoice lists (for linking)
    const soSel = $('#sales-invoice-order'); if(soSel) fillSelect(soSel, store.get(K.salesOrders, []), 'number');
    const quoSel = $('#sales-order-quotation'); if(quoSel) fillSelect(quoSel, store.get(K.quotations, []), 'number');
    const invSel = $('#sales-return-invoice'); if(invSel) fillSelect(invSel, store.get(K.salesInvoices, []), 'number');
  }

  // --- INVENTORY adjustments used by sales flows ---
  function adjustStockByName(name, delta){
    if(!name) return;
    const items = store.get(K.items, []);
    // match by name OR code
    const idx = items.findIndex(it => it.name === name || it.code === name || (it.id && it.id===name));
    if(idx===-1) return false;
    items[idx].stock = (items[idx].stock||0) + delta;
    if(items[idx].stock < 0) items[idx].stock = 0;
    store.set(K.items, items);
    return true;
  }

  // --- QUOTATIONS ---
  function renderQuotations(){
    const list = store.get(K.quotations, []);
    const tbody = $('#quotations-table tbody'); if(!tbody) return;
    tbody.innerHTML = '';
    list.forEach((q,i)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td>
        <td>${q.number||q.id}</td>
        <td>${q.date||'—'}</td>
        <td>${q.customerName||q.customer||'—'}</td>
        <td>${fmt(q.total||0)}</td>
        <td>${q.status||'مسودة'}</td>
        <td>${q.validUntil||'—'}</td>
        <td class="actions">
          <button class="edit-quo">تعديل</button>
          <button class="del-quo">حذف</button>
          <button class="to-order">تحويل لأمر</button>
        </td>`;
      on(tr.querySelector('.edit-quo'),'click', ()=> openQuotationForm(q));
      on(tr.querySelector('.del-quo'),'click', ()=> { if(confirm('حذف عرض السعر؟')){ list.splice(i,1); store.set(K.quotations,list); renderQuotations(); refreshGlobalSelectors(); }});
      on(tr.querySelector('.to-order'),'click', ()=> convertQuotationToOrder(q));
      tbody.appendChild(tr);
    });
  }

  function openQuotationForm(existing){
    const form = $('#quotation-form'); if(!form) return;
    form.style.display = 'block';
    $('#quotation-form-title').textContent = existing ? 'تعديل عرض سعر' : 'عرض سعر جديد';
    $('#quotation-number').value = existing?.number || ('Q-'+(Math.floor(Math.random()*9000)+1000));
    $('#quotation-date').value = existing?.date || today();
    $('#quotation-customer').value = existing?.customerId || existing?.customer || '';
    $('#quotation-validity').value = existing?.validity || 30;
    $('#quotation-items-table tbody').innerHTML = '';
    (existing?.items||[]).forEach(it=> addRowToQuotationItemsTable(it));
    $('#quotation-notes').value = existing?.notes || '';
    form.dataset.editId = existing?.id || '';
    calcQuotationTotals();
  }

  function closeQuotationForm(){ const f = $('#quotation-form'); if(f) { f.style.display='none'; f.dataset.editId=''; $('#quotation-items-table tbody').innerHTML=''; } }

  function addRowToQuotationItemsTable(item){
    const tbody = $('#quotation-items-table tbody'); if(!tbody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="q-name">${item.name}</td><td class="q-qty">${item.qty}</td><td class="q-price">${fmt(item.price)}</td><td class="q-sub">${fmt(item.qty*item.price)}</td><td><button class="q-del">حذف</button></td>`;
    on(tr.querySelector('.q-del'),'click', ()=> { tr.remove(); calcQuotationTotals(); });
    tbody.appendChild(tr);
  }

  function calcQuotationTotals(){
    const rows = $$('#quotation-items-table tbody tr');
    let subtotal = 0;
    rows.forEach(r=> {
      const name = r.querySelector('.q-name').textContent;
      const qty = +r.querySelector('.q-qty').textContent || 0;
      const price = +(r.querySelector('.q-price').textContent.replace(/,/g,'')) || 0;
      subtotal += qty * price;
    });
    $('#quotation-subtotal') && ($('#quotation-subtotal').value = fmt(subtotal));
    const taxPct = +($('#quotation-tax') && $('#quotation-tax').value) || 0;
    const total = subtotal + (subtotal * taxPct / 100);
    $('#quotation-total') && ($('#quotation-total').value = fmt(total));
  }

  // add item to quotation UI
  on($('#add-quotation-btn'),'click', ()=> openQuotationForm());
  on($('#quotation-item'),'click', ()=> {}); // defensive

  on($('#add-quotation-item'), 'click', (e)=>{
    e && e.preventDefault();
    const sel = $('#quotation-item'); const qty = +($('#quotation-quantity') && $('#quotation-quantity').value) || 1; const price = +($('#quotation-price') && $('#quotation-price').value) || 0;
    if(!sel||!sel.value) return alert('اختر صنف');
    const itemName = sel.options[sel.selectedIndex].text;
    addRowToQuotationItemsTable({ name: itemName, qty, price });
    calcQuotationTotals();
  });

  on($('#save-quotation'),'click', (e)=>{
    e && e.preventDefault();
    const list = store.get(K.quotations, []);
    const id = $('#quotation-form').dataset.editId;
    const number = $('#quotation-number').value || ('Q-'+Date.now());
    const date = $('#quotation-date').value || today();
    const customerId = $('#quotation-customer').value || '';
    const customerName = ($('#quotation-customer').selectedOptions && $('#quotation-customer').selectedOptions[0]?.text) || '';
    const validity = +($('#quotation-validity') && $('#quotation-validity').value) || 30;
    const notes = $('#quotation-notes').value || '';
    const items = $$('#quotation-items-table tbody tr').map(r => ({
      name: r.querySelector('.q-name').textContent,
      qty: +r.querySelector('.q-qty').textContent,
      price: +(r.querySelector('.q-price').textContent.replace(/,/g,'')) || 0
    }));
    const subtotal = items.reduce((s,i)=>s + i.qty*i.price, 0);
    const tax = +($('#quotation-tax') && $('#quotation-tax').value) || 0;
    const total = subtotal + subtotal*tax/100;
    const validUntil = new Date(new Date(date).getTime() + validity*24*3600*1000).toISOString().slice(0,10);
    if(id){
      const idx = list.findIndex(x=>x.id===id);
      if(idx>-1) list[idx] = { ...list[idx], number, date, customerId, customerName, items, subtotal, tax, total, notes, validUntil, status:'محدث' };
    } else {
      list.push({ id: uid('quo_'), number, date, customerId, customerName, items, subtotal, tax, total, notes, validUntil, status:'مسودة' });
    }
    store.set(K.quotations, list);
    closeQuotationForm(); renderQuotations(); refreshGlobalSelectors();
  });

  on($('#cancel-quotation'),'click', (e)=> { e&&e.preventDefault(); closeQuotationForm(); });

  function convertQuotationToOrder(quo){
    // open sales order form pre-filled
    openSalesOrderForm({
      fromQuotationId: quo.id,
      items: quo.items,
      customerId: quo.customerId,
      customerName: quo.customerName,
      notes: quo.notes,
    });
  }

  // --- SALES ORDERS ---
  function renderSalesOrders(){
    const list = store.get(K.salesOrders, []);
    const tbody = $('#sales-orders-table tbody'); if(!tbody) return;
    tbody.innerHTML = '';
    list.forEach((o,i)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${o.number||o.id}</td><td>${o.date||'—'}</td><td>${o.customerName||o.customer||'—'}</td><td>${fmt(o.total||0)}</td><td>${o.status||'جديد'}</td><td>${o.deliveryDate||'—'}</td><td class="actions">
        <button class="edit-so">تعديل</button>
        <button class="del-so">حذف</button>
        <button class="to-inv">إنشاء فاتورة</button>
      </td>`;
      on(tr.querySelector('.edit-so'),'click', ()=> openSalesOrderForm(o));
      on(tr.querySelector('.del-so'),'click', ()=> { if(confirm('حذف أمر البيع؟')){ list.splice(i,1); store.set(K.salesOrders,list); renderSalesOrders(); refreshGlobalSelectors(); }});
      on(tr.querySelector('.to-inv'),'click', ()=> { if(confirm('تحويل أمر إلى فاتورة ومخصوم من المخزون؟')) createInvoiceFromOrder(o); });
      tbody.appendChild(tr);
    });
  }

  function openSalesOrderForm(existing){
    const f = $('#sales-order-form'); if(!f) return;
    f.style.display = 'block';
    $('#sales-order-form-title').textContent = existing ? 'تعديل أمر بيع' : 'أمر بيع جديد';
    $('#sales-order-number').value = existing?.number || ('SO-'+(Math.floor(Math.random()*9000)+1000));
    $('#sales-order-date').value = existing?.date || today();
    $('#sales-order-customer').value = existing?.customerId || existing?.customer || '';
    $('#sales-order-quotation').value = existing?.fromQuotationId || '';
    $('#sales-order-delivery').value = existing?.deliveryDate || '';
    $('#sales-order-shipping').value = existing?.shippingAddress || '';
    $('#sales-order-notes').value = existing?.notes || '';
    $('#sales-order-items-table tbody').innerHTML = '';
    (existing?.items||[]).forEach(it => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="so-name">${it.name}</td><td class="so-qty">${it.qty}</td><td class="so-price">${fmt(it.price)}</td><td class="so-sub">${fmt(it.qty*it.price)}</td><td><button class="so-del">حذف</button></td>`;
      on(tr.querySelector('.so-del'),'click', ()=> { tr.remove(); calcSalesOrderTotals(); });
      $('#sales-order-items-table tbody').appendChild(tr);
    });
    f.dataset.editId = existing?.id || '';
    calcSalesOrderTotals();
  }

  function closeSalesOrderForm(){ const f=$('#sales-order-form'); if(f){ f.style.display='none'; f.dataset.editId=''; $('#sales-order-items-table tbody').innerHTML=''; } }

  on($('#add-sales-order-btn'),'click', ()=> openSalesOrderForm());

  on($('#add-sales-order-item'),'click', (e)=> {
    e && e.preventDefault();
    const sel = $('#sales-order-item'); if(!sel || !sel.value) return alert('اختر صنف');
    const itemName = sel.options[sel.selectedIndex].text;
    const qty = +($('#sales-order-quantity') && $('#sales-order-quantity').value) || 1;
    const price = +($('#sales-order-price') && $('#sales-order-price').value) || 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="so-name">${itemName}</td><td class="so-qty">${qty}</td><td class="so-price">${fmt(price)}</td><td class="so-sub">${fmt(qty*price)}</td><td><button class="so-del">حذف</button></td>`;
    on(tr.querySelector('.so-del'),'click', ()=> { tr.remove(); calcSalesOrderTotals(); });
    $('#sales-order-items-table tbody').appendChild(tr);
    calcSalesOrderTotals();
  });

  function calcSalesOrderTotals(){
    const rows = $$('#sales-order-items-table tbody tr');
    let subtotal = 0;
    rows.forEach(r=>{
      const qty = +r.querySelector('.so-qty').textContent||0;
      const price = +(r.querySelector('.so-price').textContent.replace(/,/g,''))||0;
      subtotal += qty*price;
    });
    $('#sales-order-subtotal') && ($('#sales-order-subtotal').value = fmt(subtotal));
    const taxPct = +($('#sales-order-tax') && $('#sales-order-tax').value) || 0;
    const total = subtotal + subtotal*taxPct/100;
    $('#sales-order-total') && ($('#sales-order-total').value = fmt(total));
  }

  on($('#save-sales-order'),'click', (e)=>{
    e && e.preventDefault();
    const list = store.get(K.salesOrders, []);
    const id = $('#sales-order-form').dataset.editId;
    const number = $('#sales-order-number').value || ('SO-'+Date.now());
    const date = $('#sales-order-date').value || today();
    const customerId = $('#sales-order-customer').value||'';
    const customerName = ($('#sales-order-customer').selectedOptions && $('#sales-order-customer').selectedOptions[0]?.text) || '';
    const deliveryDate = $('#sales-order-delivery').value || '';
    const shippingAddress = $('#sales-order-shipping').value || '';
    const notes = $('#sales-order-notes').value || '';
    const items = $$('#sales-order-items-table tbody tr').map(r => ({ name: r.querySelector('.so-name').textContent, qty: +r.querySelector('.so-qty').textContent, price: +(r.querySelector('.so-price').textContent.replace(/,/g,''))||0 }));
    const subtotal = items.reduce((s,i)=>s + i.qty*i.price, 0);
    const tax = +($('#sales-order-tax') && $('#sales-order-tax').value) || 0;
    const total = subtotal + subtotal*tax/100;
    if(id){
      const idx = list.findIndex(x=>x.id===id);
      if(idx>-1) list[idx] = {...list[idx], number, date, customerId, customerName, deliveryDate, shippingAddress, notes, items, subtotal, tax, total, status:'محدث'};
    } else {
      list.push({ id: uid('so_'), number, date, customerId, customerName, deliveryDate, shippingAddress, notes, items, subtotal, tax, total, status:'جديد' });
    }
    store.set(K.salesOrders, list);
    closeSalesOrderForm(); renderSalesOrders(); refreshGlobalSelectors(); updateDashboard();
  });

  on($('#cancel-sales-order'),'click', (e)=> { e&&e.preventDefault(); closeSalesOrderForm(); });

  // convert order to invoice (creates sales-invoice and reduces stock)
  function createInvoiceFromOrder(order){
    if(!order) return;
    // create invoice record
    const invList = store.get(K.salesInvoices, []);
    const inv = {
      id: uid('sinv_'),
      number: 'INV-'+(Math.floor(Math.random()*90000)+1000),
      date: today(),
      customerId: order.customerId || '',
      customer: order.customerName || order.customer || '',
      items: order.items.map(it=> ({ name: it.name, qty: it.qty, price: it.price })),
      subtotal: order.subtotal || 0,
      tax: order.tax || 0,
      net: order.total || 0,
      status: 'مدفوع'
    };
    // decrease stock for each item
    inv.items.forEach(it => adjustStockByName(it.name, -Math.abs(it.qty)));
    invList.push(inv); store.set(K.salesInvoices, invList);
    // also add to sales ledger
    const ledger = store.get(K.sales, []); ledger.push({ id: inv.id, number: inv.number, date: inv.date, total: inv.net, customer: inv.customer }); store.set(K.sales, ledger);
    // mark order as invoiced
    const orders = store.get(K.salesOrders, []); const idx = orders.findIndex(x=>x.id===order.id); if(idx>-1) { orders[idx].status='مفوترة'; store.set(K.salesOrders, orders); }
    renderSalesInvoices(); renderSalesOrders(); renderItems(); refreshGlobalSelectors(); updateDashboard();
    alert('تم إنشاء الفاتورة وتسوية المخزون: ' + inv.number);
  }

  // --- SALES INVOICES ---
  function renderSalesInvoices(){
    const list = store.get(K.salesInvoices, []);
    const tbody = $('#sales-invoices-table tbody'); if(!tbody) return;
    tbody.innerHTML = '';
    list.forEach((inv,i)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${inv.number||inv.id}</td><td>${inv.date||'—'}</td><td>${inv.customer||'—'}</td><td>${fmt(inv.net||0)}</td><td>${inv.payment||'—'}</td><td>${inv.status||'—'}</td>
        <td class="actions">
          <button class="view-inv">عرض</button>
          <button class="del-inv">حذف</button>
        </td>`;
      on(tr.querySelector('.view-inv'),'click', ()=> { alert('فاتورة '+(inv.number||inv.id)+'\\nالمجموع: '+fmt(inv.net||0)); });
      on(tr.querySelector('.del-inv'),'click', ()=> {
        if(!confirm('حذف الفاتورة وإرجاع الكميات للمخزون؟')) return;
        // on delete, return items to stock
        inv.items.forEach(it=> adjustStockByName(it.name, +Math.abs(it.qty)));
        const arr = store.get(K.salesInvoices, []); arr.splice(i,1); store.set(K.salesInvoices, arr);
        // also remove ledger entry
        const ledger = store.get(K.sales, []); const lidx = ledger.findIndex(l=>l.id===inv.id); if(lidx>-1) { ledger.splice(lidx,1); store.set(K.sales, ledger); }
        renderSalesInvoices(); renderItems(); updateDashboard(); refreshGlobalSelectors();
      });
      tbody.appendChild(tr);
    });
  }

  on($('#add-sales-invoice-btn'),'click', ()=> {
    // open empty invoice form
    const f = $('#sales-invoice-form'); if(!f) return;
    f.style.display = 'block';
    $('#sales-invoice-form-title').textContent = 'فاتورة بيع جديدة';
    $('#sales-invoice-number').value = 'INV-'+(Math.floor(Math.random()*90000)+1000);
    $('#sales-invoice-date').value = today();
    $('#sales-invoice-items-table tbody').innerHTML = '';
    f.dataset.editId = '';
  });

  on($('#add-sales-invoice-item'),'click', (e)=> {
    e && e.preventDefault();
    const sel = $('#sales-invoice-item'); if(!sel||!sel.value) return alert('اختر صنف');
    const name = sel.options[sel.selectedIndex].text;
    const qty = +($('#sales-invoice-quantity') && $('#sales-invoice-quantity').value) || 1;
    const price = +($('#sales-invoice-price') && $('#sales-invoice-price').value) || 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="inv-name">${name}</td><td class="inv-qty">${qty}</td><td class="inv-price">${fmt(price)}</td><td class="inv-sub">${fmt(qty*price)}</td><td><button class="inv-del">حذف</button></td>`;
    on(tr.querySelector('.inv-del'),'click', ()=> { tr.remove(); calcInvoiceTotals(); });
    $('#sales-invoice-items-table tbody').appendChild(tr);
    calcInvoiceTotals();
  });

  function calcInvoiceTotals(){
    const rows = $$('#sales-invoice-items-table tbody tr');
    let subtotal = 0; rows.forEach(r=>{ const q=+r.querySelector('.inv-qty').textContent||0; const p=+(r.querySelector('.inv-price').textContent.replace(/,/g,''))||0; subtotal += q*p; });
    $('#sales-invoice-subtotal') && ($('#sales-invoice-subtotal').value = fmt(subtotal));
    const taxPct = +($('#sales-invoice-tax') && $('#sales-invoice-tax').value) || 0;
    const discount = +($('#sales-invoice-discount') && $('#sales-invoice-discount').value) || 0;
    const net = subtotal + subtotal*taxPct/100 - discount;
    $('#sales-invoice-total') && ($('#sales-invoice-total').value = fmt(net));
  }

  on($('#save-sales-invoice'),'click', (e)=>{
    e && e.preventDefault();
    const invoiceItems = $$('#sales-invoice-items-table tbody tr').map(r => ({ name: r.querySelector('.inv-name').textContent, qty: +r.querySelector('.inv-qty').textContent, price: +(r.querySelector('.inv-price').textContent.replace(/,/g,''))||0 }));
    if(invoiceItems.length === 0) return alert('أضف أصناف للفاتورة');
    const number = $('#sales-invoice-number').value || ('INV-'+Date.now());
    const date = $('#sales-invoice-date').value || today();
    const customerId = $('#sales-invoice-customer').value || '';
    const customer = ($('#sales-invoice-customer').selectedOptions && $('#sales-invoice-customer').selectedOptions[0]?.text) || '';
    const subtotal = invoiceItems.reduce((s,i)=>s + i.qty*i.price, 0);
    const tax = +($('#sales-invoice-tax') && $('#sales-invoice-tax').value) || 0;
    const discount = +($('#sales-invoice-discount') && $('#sales-invoice-discount').value) || 0;
    const net = subtotal + subtotal*tax/100 - discount;
    const inv = { id: uid('sinv_'), number, date, customerId, customer, items: invoiceItems, subtotal, tax, discount, net, status: 'مدفوع' };
    // deduct stock
    invoiceItems.forEach(it => adjustStockByName(it.name, -Math.abs(it.qty)));
    // save
    const list = store.get(K.salesInvoices, []);
    list.push(inv); store.set(K.salesInvoices, list);
    // ledger
    const ledger = store.get(K.sales, []); ledger.push({ id: inv.id, number: inv.number, date: inv.date, total: inv.net, customer: inv.customer }); store.set(K.sales, ledger);
    // UI updates
    renderSalesInvoices(); renderItems(); refreshGlobalSelectors(); updateDashboard();
    // close form
    $('#sales-invoice-form').style.display = 'none';
    alert('تم حفظ فاتورة البيع: ' + inv.number);
  });

  on($('#cancel-sales-invoice'),'click', (e)=> { e&&e.preventDefault(); const f=$('#sales-invoice-form'); if(f) f.style.display='none'; });

  // --- SALES RETURNS ---
  function renderSalesReturns(){
    const list = store.get(K.salesReturns, []);
    const tbody = $('#sales-returns-table tbody'); if(!tbody) return;
    tbody.innerHTML = '';
    list.forEach((r,i)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${r.number||r.id}</td><td>${r.date||'—'}</td><td>${r.customer||'—'}</td><td>${r.invoiceNumber||'—'}</td><td>${(r.items||[]).length}</td><td>${r.status||'—'}</td><td class="actions"><button class="view-rt">عرض</button><button class="del-rt">حذف</button></td>`;
      on(tr.querySelector('.view-rt'),'click', ()=> { alert('مرتجع: '+(r.number||r.id)+'\\nالمجموع: '+fmt(r.total||0)); });
      on(tr.querySelector('.del-rt'),'click', ()=> { if(confirm('حذف المرتجع؟ سيتم إلغاء تأثيره على المخزون')){ // when deleting, subtract the returned qty
          r.items.forEach(it=> adjustStockByName(it.name, -Math.abs(it.qty)));
          const arr = store.get(K.salesReturns, []); arr.splice(i,1); store.set(K.salesReturns, arr); renderSalesReturns(); renderItems(); updateDashboard();
        }});
      tbody.appendChild(tr);
    });
  }

  on($('#add-sales-return-btn'),'click', ()=> { const f=$('#sales-return-form'); if(!f) return; f.style.display='block'; $('#sales-return-number').value = 'SR-'+(Math.floor(Math.random()*90000)+1000); $('#sales-return-date').value = today(); $('#sales-return-items-table tbody').innerHTML=''; f.dataset.editId=''; });

  on($('#add-sales-return-item'),'click', (e)=> {
    e && e.preventDefault();
    const sel = $('#sales-return-item'); if(!sel||!sel.value) return alert('اختر صنف');
    const name = sel.options[sel.selectedIndex].text; const qty = +($('#sales-return-quantity') && $('#sales-return-quantity').value) || 1; const reason = $('#sales-return-reason') && $('#sales-return-reason').value || '';
    const tr = document.createElement('tr'); tr.innerHTML = `<td class="rt-name">${name}</td><td class="rt-qty">${qty}</td><td class="rt-unit">${$('#sales-return-unit')?$('#sales-return-unit').value:''}</td><td class="rt-reason">${reason}</td><td><button class="rt-del">حذف</button></td>`;
    on(tr.querySelector('.rt-del'),'click', ()=> { tr.remove(); });
    $('#sales-return-items-table tbody').appendChild(tr);
  });

  on($('#save-sales-return'),'click', (e)=> {
    e && e.preventDefault();
    const items = $$('#sales-return-items-table tbody tr').map(r => ({ name: r.querySelector('.rt-name').textContent, qty: +r.querySelector('.rt-qty').textContent, reason: r.querySelector('.rt-reason').textContent }));
    if(items.length===0) return alert('أضف أصناف للمرتجع');
    const number = $('#sales-return-number').value || ('SR-'+Date.now());
    const date = $('#sales-return-date').value || today();
    const invoiceId = $('#sales-return-invoice').value || '';
    const invoiceNumber = ($('#sales-return-invoice').selectedOptions && $('#sales-return-invoice').selectedOptions[0]?.text) || '';
    const customer = ($('#sales-return-customer').selectedOptions && $('#sales-return-customer').selectedOptions[0]?.text) || '';
    const notes = $('#sales-return-notes').value || '';
    // apply return to stock (increase)
    items.forEach(it => adjustStockByName(it.name, +Math.abs(it.qty)));
    const list = store.get(K.salesReturns, []);
    list.push({ id: uid('sret_'), number, date, invoiceId, invoiceNumber, customer, items, notes, status:'مسترجع' });
    store.set(K.salesReturns, list);
    renderSalesReturns(); renderItems(); updateDashboard(); refreshGlobalSelectors();
    $('#sales-return-form').style.display='none';
    alert('تم حفظ المرتجع: ' + number);
  });

  // --- CUSTOMERS CRUD (integrated) ---
  function renderCustomers(){
    const list = store.get(K.customers, []);
    const tbody = $('#customers-table tbody'); if(!tbody) return;
    tbody.innerHTML = '';
    list.forEach((c,i)=> {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${c.name}</td><td>${c.phone||'—'}</td><td>${c.email||'—'}</td><td class="actions"><button class="edit-c">تعديل</button><button class="del-c">حذف</button></td>`;
      on(tr.querySelector('.edit-c'),'click', ()=> openCustomerForm(c));
      on(tr.querySelector('.del-c'),'click', ()=> { if(confirm('حذف العميل؟')){ list.splice(i,1); store.set(K.customers,list); renderCustomers(); refreshGlobalSelectors(); updateDashboard(); }});
      tbody.appendChild(tr);
    });
    // also fill selects used elsewhere
    refreshGlobalSelectors();
  }
  function openCustomerForm(existing){
    const f = $('#customer-form'); if(!f) return;
    f.style.display = 'block';
    $('#customerName').value = existing?.name||''; $('#customerPhone').value = existing?.phone||''; $('#customerEmail').value = existing?.email||'';
    f.dataset.editId = existing?.id || '';
  }
  function closeCustomerForm(){ const f=$('#customer-form'); if(f){ f.style.display='none'; f.dataset.editId=''; } }
  on($('#add-customer-btn'),'click', ()=> { const f=$('#customer-form'); if(f){ f.style.display='block'; $('#customerName').value=''; $('#customerPhone').value=''; $('#customerEmail').value=''; f.dataset.editId=''; }});
  on($('#save-customer'),'click', (e)=> {
    e && e.preventDefault();
    const list = store.get(K.customers, []);
    const id = $('#customer-form').dataset.editId;
    const name = $('#customerName').value || ''; const phone = $('#customerPhone').value || ''; const email = $('#customerEmail').value || '';
    if(!name) return alert('أدخل اسم العميل');
    if(id){
      const idx = list.findIndex(x=>x.id===id); if(idx>-1) list[idx] = {...list[idx], name, phone, email};
    } else {
      list.push({ id: uid('cus_'), name, phone, email });
    }
    store.set(K.customers, list);
    closeCustomerForm(); renderCustomers(); refreshGlobalSelectors(); updateDashboard();
  });
  on($('#cancel-customer'),'click', (e)=>{ e&&e.preventDefault(); closeCustomerForm(); });

  // --- SHIPPING / DELIVERY tracking ---
  function renderShippings(){
    const list = store.get(K.shippings, []);
    const tbody = $('#shippingTableBody') || $('#shipping-table-body') || $('#shippingTable tbody') || $('#shippingTableBody');
    // fallback: search for #shippingTableBody or specific id used earlier is "shippingTableBody" per previous sample? if not, find id shippingTableBody or shippingTableBody
    const t = $('#shippingTableBody') || $('#shippingTableBody') || $('#shippingTableBody') || $('#shippingTableBody');
    const target = $('#shippingTableBody') || $('#shippingTableBody') || $('#shippingTableBody') || $('#shippingTableBody');
    // safer: use id in HTML: shippingTableBody does not exist — check the index: shippingTableBody (in earlier code it was 'shippingTableBody' in initial suggestion). We'll instead search by '#shippingTableBody' and fallback to a table with id 'shippingTable'
    const tbodyEl = $('#shippingTableBody') || $('#shippingTableBody') || $('#shippingTableBody') || $('#shippingTableBody') || $('#shippingTableBody') || $('#shippingTableBody');
    // Realistic fallback: find table with id 'shipping-table' or 'shippingTable'
    const shippingTable = $('#shippingTableBody') || $('#shippingTable') || $('#shipping-table') || $('#shipments-section') || null;
    // We'll try to find the actual tbody in the HTML: in index.html the shipping table id is "shippingTableBody" not present; but there is "shippingTableBody" in the earlier sample — to avoid errors, search for table with #shippingTableBody then bail if not found.
    const tb = $('#shippingTableBody') || $('#shippingTableBody') || $('#shippingTableBody');
    // If nothing, attempt #shippingTableBody; else stop
    if(!$('#shippingTableBody') && !$('#shippingTableBody') && !$('#shippingTable')) {
      // try table with id shippingTableBody or fallback to element with id 'shippingTableBody' - if absent skip rendering
    }
    // Simpler: locate tbody via id 'shippingTableBody' (used in the earlier snippet) — if not exist, exit
    const realTbody = $('#shippingTableBody');
    if(!realTbody) return;
    realTbody.innerHTML = '';
    list.forEach((s,i)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td><td>${s.orderId||'—'}</td><td>${s.status||'—'}</td><td>${s.date||'—'}</td><td class="actions"><button class="edit-sh">تعديل</button><button class="del-sh">حذف</button></td>`;
      on(tr.querySelector('.edit-sh'),'click', ()=> openShippingForm(s));
      on(tr.querySelector('.del-sh'),'click', ()=> { if(confirm('حذف متابعة الشحن؟')){ const arr = store.get(K.shippings, []); arr.splice(i,1); store.set(K.shippings, arr); renderShippings(); }});
      realTbody.appendChild(tr);
    });
  }

  function openShippingForm(existing){
    const f = $('#shippingForm') || $('#shipping-form') || $('#shipping-form');
    if(!f) return;
    f.style.display = 'block';
    $('#shippingOrderId') && ($('#shippingOrderId').value = existing?.orderId || '');
    $('#shippingStatus') && ($('#shippingStatus').value = existing?.status || 'جاري الشحن');
    $('#shippingDate') && ($('#shippingDate').value = existing?.date || today());
    f.dataset.editId = existing?.id || '';
  }

  on($('#add-shipping-btn'),'click', ()=> openShippingForm({}));

  on($('#save-shipping'),'click', (e)=> {
    e && e.preventDefault();
    const list = store.get(K.shippings, []);
    const id = $('#shippingForm')?.dataset.editId;
    const orderId = $('#shippingOrderId')?.value || '';
    const status = $('#shippingStatus')?.value || '';
    const date = $('#shippingDate')?.value || today();
    if(id){
      const idx = list.findIndex(x=>x.id===id); if(idx>-1) list[idx] = {...list[idx], orderId, status, date};
    } else {
      list.push({ id: uid('ship_'), orderId, status, date });
    }
    store.set(K.shippings, list);
    // close if form exists
    const f = $('#shippingForm'); if(f) { f.style.display='none'; f.dataset.editId=''; }
    renderShippings();
  });

  // --- Initialization / binds ---
  function renderAllSalesModules(){
    renderQuotations();
    renderSalesOrders();
    renderSalesInvoices();
    renderSalesReturns();
    renderCustomers();
    renderShippings();
    refreshGlobalSelectors();
    updateDashboard();
  }

  // bind basic search inputs if present
  on($('#search-quotations'), 'input', ()=> renderQuotations());
  on($('#search-sales-orders'), 'input', ()=> renderSalesOrders());
  on($('#search-sales-invoices'), 'input', ()=> renderSalesInvoices());
  on($('#search-sales-returns'), 'input', ()=> renderSalesReturns());
  on($('#search-customers'), 'input', ()=> renderCustomers());

  // initial render on load
  document.addEventListener('DOMContentLoaded', ()=> {
    try{ renderAllSalesModules(); }catch(e){ console.error('renderAllSalesModules', e); }
  });

  // expose some debug helpers (optional)
  window.EdaraSales = {
    renderAll: renderAllSalesModules,
    adjustStockByName,
    K
  };
})();
/* === CRM + Accounting Modules === */
(function(){
  'use strict';
  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
  const on = (el,ev,fn)=>{ if(el) el.addEventListener(ev,fn); };
  const uid = (p='')=> p+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);
  const today = ()=> new Date().toISOString().slice(0,10);
  const fmt = n=> (isFinite(+n)?(+n).toLocaleString('en-US',{maximumFractionDigits:2}):'0');
  const store = {
    get(k,d=[]){ try{let v=localStorage.getItem(k); return v?JSON.parse(v):d; }catch(e){return d;} },
    set(k,v){ localStorage.setItem(k,JSON.stringify(v)); }
  };

  const K = {
    crm: 'edara_crm',
    journal: 'edara_journal',
    receivable: 'edara_receivable',
    payable: 'edara_payable',
    ledger: 'edara_ledger'
  };
  if(!store.get(K.crm)) store.set(K.crm,[]);
  if(!store.get(K.journal)) store.set(K.journal,[]);
  if(!store.get(K.receivable)) store.set(K.receivable,[]);
  if(!store.get(K.payable)) store.set(K.payable,[]);
  if(!store.get(K.ledger)) store.set(K.ledger,[]);

  /* === CRM (إدارة العملاء) === */
  function renderCRM(){
    const list=store.get(K.crm,[]);
    const tbody=$('#crm-table tbody'); if(!tbody) return;
    tbody.innerHTML='';
    list.forEach((n,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${i+1}</td><td>${n.type}</td><td>${n.customer}</td><td>${n.note}</td><td>${n.date}</td>
      <td><button class="del">🗑</button></td>`;
      on(tr.querySelector('.del'),'click',()=>{ list.splice(i,1); store.set(K.crm,list); renderCRM(); });
      tbody.appendChild(tr);
    });
  }
  on($('#save-crm'),'click',e=>{
    e.preventDefault();
    const type=$('#crm-type').value||'نشاط';
    const customer=$('#crm-customer').value||'';
    const note=$('#crm-note').value||'';
    if(!customer||!note) return alert('أدخل بيانات كاملة');
    const list=store.get(K.crm,[]);
    list.push({id:uid('crm_'),type,customer,note,date:today()});
    store.set(K.crm,list); renderCRM();
    $('#crm-note').value='';
  });

  /* === قيود اليومية (Journal) === */
  function renderJournal(){
    const list=store.get(K.journal,[]);
    const tbody=$('#journal-table tbody'); if(!tbody) return;
    tbody.innerHTML='';
    list.forEach((j,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${i+1}</td><td>${j.date}</td><td>${j.account}</td><td>${fmt(j.debit)}</td><td>${fmt(j.credit)}</td><td>${j.desc}</td>
      <td><button class="del">🗑</button></td>`;
      on(tr.querySelector('.del'),'click',()=>{ list.splice(i,1); store.set(K.journal,list); renderJournal(); renderLedger(); });
      tbody.appendChild(tr);
    });
  }
  on($('#save-journal'),'click',e=>{
    e.preventDefault();
    const date=$('#journal-date').value||today();
    const account=$('#journal-account').value||'';
    const debit=+($('#journal-debit').value)||0;
    const credit=+($('#journal-credit').value)||0;
    const desc=$('#journal-desc').value||'';
    if(!account) return alert('حدد الحساب');
    const list=store.get(K.journal,[]);
    list.push({id:uid('jr_'),date,account,debit,credit,desc});
    store.set(K.journal,list);
    // Ledger entry
    const ledger=store.get(K.ledger,[]);
    ledger.push({date,account,debit,credit,desc});
    store.set(K.ledger,ledger);
    renderJournal(); renderLedger();
  });

  /* === الذمم المدينة (AR) === */
  function renderReceivable(){
    const list=store.get(K.receivable,[]);
    const tbody=$('#ar-table tbody'); if(!tbody) return;
    tbody.innerHTML='';
    list.forEach((r,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${i+1}</td><td>${r.customer}</td><td>${fmt(r.amount)}</td><td>${r.due}</td><td>${r.status}</td>
      <td><button class="pay">💵</button></td>`;
      on(tr.querySelector('.pay'),'click',()=>{ r.status='مدفوع'; store.set(K.receivable,list); renderReceivable(); });
      tbody.appendChild(tr);
    });
  }
  on($('#save-ar'),'click',e=>{
    e.preventDefault();
    const customer=$('#ar-customer').value||'';
    const amount=+($('#ar-amount').value)||0;
    const due=$('#ar-due').value||today();
    if(!customer||!amount) return alert('بيانات ناقصة');
    const list=store.get(K.receivable,[]);
    list.push({id:uid('ar_'),customer,amount,due,status:'غير مدفوع'});
    store.set(K.receivable,list); renderReceivable();
  });

  /* === الذمم الدائنة (AP) === */
  function renderPayable(){
    const list=store.get(K.payable,[]);
    const tbody=$('#ap-table tbody'); if(!tbody) return;
    tbody.innerHTML='';
    list.forEach((p,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${i+1}</td><td>${p.supplier}</td><td>${fmt(p.amount)}</td><td>${p.due}</td><td>${p.status}</td>
      <td><button class="pay">💵</button></td>`;
      on(tr.querySelector('.pay'),'click',()=>{ p.status='مدفوع'; store.set(K.payable,list); renderPayable(); });
      tbody.appendChild(tr);
    });
  }
  on($('#save-ap'),'click',e=>{
    e.preventDefault();
    const supplier=$('#ap-supplier').value||'';
    const amount=+($('#ap-amount').value)||0;
    const due=$('#ap-due').value||today();
    if(!supplier||!amount) return alert('بيانات ناقصة');
    const list=store.get(K.payable,[]);
    list.push({id:uid('ap_'),supplier,amount,due,status:'غير مدفوع'});
    store.set(K.payable,list); renderPayable();
  });

  /* === دفتر الأستاذ (Ledger) === */
  function renderLedger(){
    const list=store.get(K.ledger,[]);
    const tbody=$('#ledger-table tbody'); if(!tbody) return;
    tbody.innerHTML='';
    list.forEach((l,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${i+1}</td><td>${l.date}</td><td>${l.account}</td><td>${fmt(l.debit)}</td><td>${fmt(l.credit)}</td><td>${l.desc}</td>`;
      tbody.appendChild(tr);
    });
  }

  /* === Init === */
  document.addEventListener('DOMContentLoaded',()=>{
    renderCRM(); renderJournal(); renderReceivable(); renderPayable(); renderLedger();
  });
})();
/* =======================
   إدارة العملاء (CRM)
   ======================= */
(function(){
  'use strict';
  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
  const on=(el,ev,fn)=>{ if(el) el.addEventListener(ev,fn); };
  const uid=(p='')=> p+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);
  const today=()=> new Date().toISOString().slice(0,10);

  const store={
    get(k,d){ try{let v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;} },
    set(k,v){ localStorage.setItem(k,JSON.stringify(v)); }
  };

  // مفاتيح تخزين البيانات
  const DB = {
    activities: 'crm_activities',
    leads: 'crm_leads',
    contacts: 'crm_contacts',
    campaigns: 'crm_campaigns'
  };
  if(!store.get(DB.activities)) store.set(DB.activities,[]);
  if(!store.get(DB.leads)) store.set(DB.leads,[]);
  if(!store.get(DB.contacts)) store.set(DB.contacts,[]);
  if(!store.get(DB.campaigns)) store.set(DB.campaigns,[]);

  /* === الأنشطة === */
  function renderActivities(){
    const list=store.get(DB.activities,[]);
    const tbody=$('#activities-table tbody');
    if(!tbody) return;
    tbody.innerHTML='';
    list.forEach((a,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`
        <td>${i+1}</td>
        <td>${a.type}</td>
        <td>${a.subject}</td>
        <td>${a.customer}</td>
        <td>${a.date}</td>
        <td>${a.status}</td>
        <td>${a.priority}</td>
        <td>
          <button class="btn-edit">✏️</button>
          <button class="btn-del">🗑️</button>
        </td>`;
      on(tr.querySelector('.btn-del'),'click',()=>{
        if(confirm('حذف النشاط؟')){
          const arr=store.get(DB.activities,[]).filter(x=>x.id!==a.id);
          store.set(DB.activities,arr);
          renderActivities();
        }
      });
      tbody.appendChild(tr);
    });
  }

  on($('#add-activity-btn'),'click',()=>{
    $('#crm-activity-form').style.display='block';
    $('#crm-activity-form-title').textContent='إضافة نشاط جديد';
  });
  on($('#cancel-crm-activity'),'click',()=>$('#crm-activity-form').style.display='none');

  on($('#save-crm-activity'),'click',()=>{
    const type=$('#activity-type').value;
    const subject=$('#activity-subject').value.trim();
    const customer=$('#activity-customer').value.trim();
    const contact=$('#activity-contact').value.trim();
    const date=$('#activity-date').value||today();
    const time=$('#activity-time').value;
    const status=$('#activity-status').value;
    const priority=$('#activity-priority').value;
    const desc=$('#activity-description').value.trim();

    if(!subject||!customer) return alert('أدخل كل البيانات المطلوبة');
    const list=store.get(DB.activities,[]);
    list.push({id:uid('act_'),type,subject,customer,contact,date,time,status,priority,desc});
    store.set(DB.activities,list);

    $('#crm-activity-form').style.display='none';
    renderActivities();
  });

  /* === الفرص === */
  function renderLeads(){
    const list=store.get(DB.leads,[]);
    const tbody=$('#leads-table tbody');
    if(!tbody) return;
    tbody.innerHTML='';
    list.forEach((l,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${i+1}</td><td>${l.name}</td><td>${l.customer}</td><td>${l.value}</td><td>${l.stage}</td><td>${l.closeDate}</td><td>${l.prob}</td><td><button class="btn-del">🗑️</button></td>`;
      on(tr.querySelector('.btn-del'),'click',()=>{
        store.set(DB.leads,store.get(DB.leads,[]).filter(x=>x.id!==l.id));
        renderLeads();
      });
      tbody.appendChild(tr);
    });
  }
  on($('#add-lead-btn'),'click',()=>{
    const name=prompt('اسم الفرصة:');
    const customer=prompt('العميل:');
    const value=+prompt('القيمة:')||0;
    const stage=prompt('مرحلة البيع:','مبدئية');
    const closeDate=prompt('تاريخ الإغلاق المتوقع:',today());
    const prob=prompt('احتمالية الإغلاق:','50%');
    if(!name||!customer) return;
    const list=store.get(DB.leads,[]);
    list.push({id:uid('lead_'),name,customer,value,stage,closeDate,prob});
    store.set(DB.leads,list);
    renderLeads();
  });

  /* === جهات الاتصال === */
  function renderContacts(){
    const list=store.get(DB.contacts,[]);
    const tbody=$('#contacts-table tbody');
    if(!tbody) return;
    tbody.innerHTML='';
    list.forEach((c,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${i+1}</td><td>${c.name}</td><td>${c.customer}</td><td>${c.job}</td><td>${c.email}</td><td>${c.phone}</td><td><button class="btn-del">🗑️</button></td>`;
      on(tr.querySelector('.btn-del'),'click',()=>{
        store.set(DB.contacts,store.get(DB.contacts,[]).filter(x=>x.id!==c.id));
        renderContacts();
      });
      tbody.appendChild(tr);
    });
  }
  on($('#add-contact-btn'),'click',()=>{
    const name=prompt('اسم جهة الاتصال:');
    const customer=prompt('العميل:');
    const job=prompt('الوظيفة:');
    const email=prompt('البريد الإلكتروني:');
    const phone=prompt('الهاتف:');
    if(!name||!customer) return;
    const list=store.get(DB.contacts,[]);
    list.push({id:uid('con_'),name,customer,job,email,phone});
    store.set(DB.contacts,list);
    renderContacts();
  });

  /* === الحملات === */
  function renderCampaigns(){
    const list=store.get(DB.campaigns,[]);
    const tbody=$('#campaigns-table tbody');
    if(!tbody) return;
    tbody.innerHTML='';
    list.forEach((c,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${i+1}</td><td>${c.name}</td><td>${c.type}</td><td>${c.start}</td><td>${c.end}</td><td>${c.status}</td><td><button class="btn-del">🗑️</button></td>`;
      on(tr.querySelector('.btn-del'),'click',()=>{
        store.set(DB.campaigns,store.get(DB.campaigns,[]).filter(x=>x.id!==c.id));
        renderCampaigns();
      });
      tbody.appendChild(tr);
    });
  }
  on($('#add-campaign-btn'),'click',()=>{
    const name=prompt('اسم الحملة:');
    const type=prompt('نوع الحملة:','إيميل');
    const start=prompt('تاريخ البدء:',today());
    const end=prompt('تاريخ الانتهاء:',today());
    const status=prompt('الحالة:','نشطة');
    if(!name||!type) return;
    const list=store.get(DB.campaigns,[]);
    list.push({id:uid('camp_'),name,type,start,end,status});
    store.set(DB.campaigns,list);
    renderCampaigns();
  });

  /* === تشغيل عند التحميل === */
  document.addEventListener('DOMContentLoaded',()=>{
    renderActivities();
    renderLeads();
    renderContacts();
    renderCampaigns();
  });

})();
/* =======================
   المحاسبة المالية - كامل
   ======================= */
(function(){
  'use strict';
  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const on=(el,ev,fn)=>{ if(el) el.addEventListener(ev,fn); };
  const uid=(p='')=> p+Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4);
  const today=()=> new Date().toISOString().slice(0,10);
  const fmt=n=> isFinite(+n)?(+n).toLocaleString('en-US',{maximumFractionDigits:2}):'0';

  const store={
    get(k,d){ try{let v=localStorage.getItem(k);return v?JSON.parse(v):d;}catch(e){return d;} },
    set(k,v){ localStorage.setItem(k,JSON.stringify(v)); }
  };

  const DB={
    journals:'acc_journals',
    ledger:'acc_ledger',
    receivable:'acc_receivable',
    payable:'acc_payable',
    receipts:'acc_receipts',
    payments:'acc_payments'
  };
  if(!store.get(DB.journals)) store.set(DB.journals,[]);
  if(!store.get(DB.ledger)) store.set(DB.ledger,[]);
  if(!store.get(DB.receivable)) store.set(DB.receivable,[]);
  if(!store.get(DB.payable)) store.set(DB.payable,[]);
  if(!store.get(DB.receipts)) store.set(DB.receipts,[]);
  if(!store.get(DB.payments)) store.set(DB.payments,[]);

  /* === قيود اليومية === */
  let journalItems=[];
  function renderJournalItems(){
    const tbody=$('#journal-items-table tbody'); if(!tbody) return;
    tbody.innerHTML='';
    journalItems.forEach((it,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${it.account}</td><td>${fmt(it.debit)}</td><td>${fmt(it.credit)}</td><td>${it.desc||''}</td><td><button class="del">🗑️</button></td>`;
      on(tr.querySelector('.del'),'click',()=>{journalItems.splice(i,1);renderJournalItems();updateJournalTotals();});
      tbody.appendChild(tr);
    });
    updateJournalTotals();
  }
  function updateJournalTotals(){
    const totalD=journalItems.reduce((a,b)=>a+Number(b.debit||0),0);
    const totalC=journalItems.reduce((a,b)=>a+Number(b.credit||0),0);
    $('#journal-total-debit').value=fmt(totalD);
    $('#journal-total-credit').value=fmt(totalC);
    $('#journal-difference').value=fmt(totalD-totalC);
  }
  on($('#add-journal-item'),'click',(e)=>{
    e.preventDefault();
    const account=$('#journal-account').value;
    const debit=+$('#journal-debit').value||0;
    const credit=+$('#journal-credit').value||0;
    const desc=$('#journal-description').value;
    if(!account) return alert('اختر الحساب');
    journalItems.push({account,debit,credit,desc});
    renderJournalItems();
    $('#journal-account').value='';
    $('#journal-debit').value='0';
    $('#journal-credit').value='0';
    $('#journal-description').value='';
  });
  on($('#save-journal-entry'),'click',()=>{
    if(journalItems.length===0) return alert('أضف بنود القيد');
    const id=uid('jr_');
    const number=$('#journal-number').value||id;
    const date=$('#journal-date').value||today();
    const type=$('#journal-type').value;
    const notes=$('#journal-notes').value;
    const totalD=journalItems.reduce((a,b)=>a+Number(b.debit||0),0);
    const totalC=journalItems.reduce((a,b)=>a+Number(b.credit||0),0);
    const entry={id,number,date,type,items:journalItems,totalD,totalC,notes};
    const list=store.get(DB.journals,[]);
    list.push(entry); store.set(DB.journals,list);
    // Ledger
    const ledger=store.get(DB.ledger,[]);
    journalItems.forEach(it=>{
      ledger.push({date,ref:number,account:it.account,debit:it.debit,credit:it.credit,desc:it.desc});
    });
    store.set(DB.ledger,ledger);
    journalItems=[];
    renderJournalItems();
    renderJournalEntries();
    renderLedger();
    $('#journal-entry-form').style.display='none';
  });
  function renderJournalEntries(){
    const list=store.get(DB.journals,[]);
    const tbody=$('#journal-entries-table tbody'); if(!tbody) return;
    tbody.innerHTML='';
    list.forEach((j,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${i+1}</td><td>${j.number}</td><td>${j.date}</td><td>${j.type}</td><td>${fmt(j.totalD)}</td><td>${fmt(j.totalC)}</td><td>${j.notes||''}</td><td><button class="del">🗑️</button></td>`;
      on(tr.querySelector('.del'),'click',()=>{
        store.set(DB.journals,list.filter(x=>x.id!==j.id));
        renderJournalEntries();
      });
      tbody.appendChild(tr);
    });
  }
  function renderLedger(){
    const list=store.get(DB.ledger,[]);
    const tbody=$('#general-ledger-table tbody'); if(!tbody) return;
    tbody.innerHTML='';
    let balance=0,totalD=0,totalC=0;
    list.forEach(l=>{
      balance+=Number(l.debit||0)-Number(l.credit||0);
      totalD+=Number(l.debit||0);
      totalC+=Number(l.credit||0);
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${l.date}</td><td>${l.ref}</td><td>${l.desc||''}</td><td>${fmt(l.debit)}</td><td>${fmt(l.credit)}</td><td>${fmt(balance)}</td>`;
      tbody.appendChild(tr);
    });
    $('#total-debit').textContent=fmt(totalD);
    $('#total-credit').textContent=fmt(totalC);
    $('#closing-balance').textContent=fmt(balance);
  }

  /* === الذمم المدينة (فواتير العملاء) === */
  function renderReceivableInvoices(){
    const list=store.get(DB.receivable,[]);
    const tbody=$('#receivable-invoices-table tbody'); if(!tbody) return;
    tbody.innerHTML='';
    list.forEach((r,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`
        <td>${i+1}</td><td>${r.number}</td><td>${r.date}</td><td>${r.customer}</td>
        <td>${fmt(r.amount)}</td><td>${fmt(r.paid)}</td><td>${fmt(r.amount-r.paid)}</td>
        <td>${r.due}</td><td>${r.status}</td>
        <td><button class="pay">💰</button><button class="edit">✏️</button><button class="del">🗑️</button></td>`;
      on(tr.querySelector('.pay'),'click',()=>{
        const pay=+prompt('المبلغ المدفوع:',r.amount-r.paid)||0;
        r.paid+=pay;
        r.status=(r.paid>=r.amount)?'مدفوعة':'جزئية';
        store.set(DB.receivable,list); renderReceivableInvoices();
      });
      on(tr.querySelector('.edit'),'click',()=>{
        r.number=prompt('رقم الفاتورة:',r.number)||r.number;
        r.customer=prompt('اسم العميل:',r.customer)||r.customer;
        r.amount=+prompt('المبلغ:',r.amount)||r.amount;
        r.due=prompt('تاريخ الاستحقاق:',r.due)||r.due;
        store.set(DB.receivable,list); renderReceivableInvoices();
      });
      on(tr.querySelector('.del'),'click',()=>{list.splice(i,1);store.set(DB.receivable,list);renderReceivableInvoices();});
      tbody.appendChild(tr);
    });
    $('#total-receivable').textContent=fmt(list.reduce((a,b)=>a+b.amount,0));
  }
  function addReceivableInvoice(){
    const number=prompt('رقم الفاتورة:');
    const customer=prompt('اسم العميل:');
    const amount=+prompt('المبلغ:')||0;
    const due=prompt('تاريخ الاستحقاق:',today());
    if(!number||!customer||!amount) return;
    const list=store.get(DB.receivable,[]);
    list.push({id:uid('ar_'),number,date:today(),customer,amount,paid:0,due,status:'غير مدفوعة'});
    store.set(DB.receivable,list); renderReceivableInvoices();
  }

  /* === المقبوضات === */
  function renderReceipts(){
    const list=store.get(DB.receipts,[]);
    const tbody=$('#receivable-payments-table tbody'); if(!tbody) return;
    tbody.innerHTML='';
    list.forEach((r,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`
        <td>${i+1}</td><td>${r.number}</td><td>${r.date}</td><td>${r.customer}</td>
        <td>${fmt(r.amount)}</td><td>${r.method}</td><td>${r.ref}</td>
        <td><button class="edit">✏️</button><button class="del">🗑️</button></td>`;
      on(tr.querySelector('.edit'),'click',()=>{
        r.number=prompt('رقم العملية:',r.number)||r.number;
        r.customer=prompt('اسم العميل:',r.customer)||r.customer;
        r.amount=+prompt('المبلغ:',r.amount)||r.amount;
        r.method=prompt('طريقة الدفع:',r.method)||r.method;
        r.ref=prompt('المرجع:',r.ref)||r.ref;
        store.set(DB.receipts,list); renderReceipts();
      });
      on(tr.querySelector('.del'),'click',()=>{list.splice(i,1);store.set(DB.receipts,list);renderReceipts();});
      tbody.appendChild(tr);
    });
  }
  function addReceipt(){
    const number=prompt('رقم العملية:');
    const customer=prompt('اسم العميل:');
    const amount=+prompt('المبلغ:')||0;
    const method=prompt('طريقة الدفع:','نقدا');
    const ref=prompt('المرجع:','-');
    if(!number||!customer||!amount) return;
    const list=store.get(DB.receipts,[]);
    list.push({id:uid('rc_'),number,date:today(),customer,amount,method,ref});
    store.set(DB.receipts,list); renderReceipts();
  }

  /* === الذمم الدائنة (فواتير الموردين) === */
  function renderPayableInvoices(){
    const list=store.get(DB.payable,[]);
    const tbody=$('#payable-invoices-table tbody'); if(!tbody) return;
    tbody.innerHTML='';
    list.forEach((p,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`
        <td>${i+1}</td><td>${p.number}</td><td>${p.date}</td><td>${p.supplier}</td>
        <td>${fmt(p.amount)}</td><td>${fmt(p.paid)}</td><td>${fmt(p.amount-p.paid)}</td>
        <td>${p.due}</td><td>${p.status}</td>
        <td><button class="pay">💳</button><button class="edit">✏️</button><button class="del">🗑️</button></td>`;
      on(tr.querySelector('.pay'),'click',()=>{
        const pay=+prompt('المبلغ المدفوع:',p.amount-p.paid)||0;
        p.paid+=pay;
        p.status=(p.paid>=p.amount)?'مدفوعة':'جزئية';
        store.set(DB.payable,list); renderPayableInvoices();
      });
      on(tr.querySelector('.edit'),'click',()=>{
        p.number=prompt('رقم الفاتورة:',p.number)||p.number;
        p.supplier=prompt('اسم المورد:',p.supplier)||p.supplier;
        p.amount=+prompt('المبلغ:',p.amount)||p.amount;
        p.due=prompt('تاريخ الاستحقاق:',p.due)||p.due;
        store.set(DB.payable,list); renderPayableInvoices();
      });
      on(tr.querySelector('.del'),'click',()=>{list.splice(i,1);store.set(DB.payable,list);renderPayableInvoices();});
      tbody.appendChild(tr);
    });
    $('#total-payable').textContent=fmt(list.reduce((a,b)=>a+b.amount,0));
  }
  function addPayableInvoice(){
    const number=prompt('رقم الفاتورة:');
    const supplier=prompt('اسم المورد:');
    const amount=+prompt('المبلغ:')||0;
    const due=prompt('تاريخ الاستحقاق:',today());
    if(!number||!supplier||!amount) return;
    const list=store.get(DB.payable,[]);
    list.push({id:uid('ap_'),number,date:today(),supplier,amount,paid:0,due,status:'غير مدفوعة'});
    store.set(DB.payable,list); renderPayableInvoices();
  }

  /* === المدفوعات === */
  function renderPayments(){
    const list=store.get(DB.payments,[]);
    const tbody=$('#payable-payments-table tbody'); if(!tbody) return;
    tbody.innerHTML='';
    list.forEach((p,i)=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`
        <td>${i+1}</td><td>${p.number}</td><td>${p.date}</td><td>${p.supplier}</td>
        <td>${fmt(p.amount)}</td><td>${p.method}</td><td>${p.ref}</td>
        <td><button class="edit">✏️</button><button class="del">🗑️</button></td>`;
      on(tr.querySelector('.edit'),'click',()=>{
        p.number=prompt('رقم العملية:',p.number)||p.number;
        p.supplier=prompt('اسم المورد:',p.supplier)||p.supplier;
        p.amount=+prompt('المبلغ:',p.amount)||p.amount;
        p.method=prompt('طريقة الدفع:',p.method)||p.method;
        p.ref=prompt('المرجع:',p.ref)||p.ref;
        store.set(DB.payments,list); renderPayments();
      });
      on(tr.querySelector('.del'),'click',()=>{list.splice(i,1);store.set(DB.payments,list);renderPayments();});
      tbody.appendChild(tr);
    });
  }
  function addPayment(){
    const number=prompt('رقم العملية:');
    const supplier=prompt('اسم المورد:');
    const amount=+prompt('المبلغ:')||0;
    const method=prompt('طريقة الدفع:','تحويل');
    const ref=prompt('المرجع:','-');
    if(!number||!supplier||!amount) return;
    const list=store.get(DB.payments,[]);
    list.push({id:uid('pm_'),number,date:today(),supplier,amount,method,ref});
    store.set(DB.payments,list); renderPayments();
  }

  /* === تهيئة الأحداث === */
  document.addEventListener('DOMContentLoaded',()=>{
    // قيود اليومية
    on($('#add-journal-entry-btn'),'click',()=>{$('#journal-entry-form').style.display='block';});
    on($('#cancel-journal-entry'),'click',()=>$('#journal-entry-form').style.display='none');

    renderJournalEntries();
    renderLedger();
    renderReceivableInvoices();
    renderReceipts();
    renderPayableInvoices();
    renderPayments();

    on($('#add-receivable-invoice-btn'),'click',addReceivableInvoice);
    on($('#add-payable-invoice-btn'),'click',addPayableInvoice);
    on($('#add-receivable-payment-btn'),'click',addReceipt);
    on($('#add-payable-payment-btn'),'click',addPayment);
  });

})();

(function(){
  'use strict';

  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
  const today=()=>new Date().toISOString().slice(0,10);
  const fmt=n=>isFinite(+n)?(+n).toLocaleString('en-US',{maximumFractionDigits:2}):'0';

  // بيانات وهمية للتجريب (بدون Backend)
  const mockSales = [
    {date:'2025-01-01', product:'عطر A', customer:'أحمد', qty:5, price:100, returns:0, cost:60},
    {date:'2025-01-03', product:'عطر B', customer:'منى', qty:3, price:150, returns:1, cost:90},
    {date:'2025-01-05', product:'عطر A', customer:'خالد', qty:2, price:100, returns:0, cost:60},
    {date:'2025-01-08', product:'عطر C', customer:'سارة', qty:4, price:200, returns:0, cost:120},
  ];
  const mockPurchases = [
    {date:'2025-01-02', product:'عطر A', supplier:'شركة روائح', qty:20, price:60},
    {date:'2025-01-04', product:'عطر B', supplier:'مؤسسة عطور', qty:15, price:90},
    {date:'2025-01-06', product:'عطر C', supplier:'مؤسسة عطور', qty:10, price:120},
  ];

  /* =============================
     تقارير المبيعات
     ============================= */
  function generateSalesSummary(){
    const from=$('#sales-summary-from').value||'2025-01-01';
    const to=$('#sales-summary-to').value||today();
    const data=mockSales.filter(s=>s.date>=from && s.date<=to);
    const totalSales=data.reduce((a,b)=>a+b.qty*b.price,0);
    const totalReturns=data.reduce((a,b)=>a+b.returns*b.price,0);
    const invoices=data.length;
    const netSales=totalSales-totalReturns;
    const avgInvoice=invoices?totalSales/invoices:0;

    $('#total-sales').textContent=fmt(totalSales);
    $('#total-returns').textContent=fmt(totalReturns);
    $('#total-invoices').textContent=invoices;
    $('#net-sales').textContent=fmt(netSales);

    const tbody=$('#sales-summary-table tbody');
    if(tbody){
      tbody.innerHTML='';
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${from} إلى ${to}</td><td>${fmt(totalSales)}</td><td>${fmt(totalReturns)}</td><td>${fmt(netSales)}</td><td>${invoices}</td><td>${fmt(avgInvoice)}</td>`;
      tbody.appendChild(tr);
    }
  }

  function generateSalesByProduct(){
    const tbody=$('#sales-product-table tbody');
    if(!tbody) return;
    tbody.innerHTML='';
    const grouped={};
    mockSales.forEach(s=>{
      if(!grouped[s.product]) grouped[s.product]={qty:0,total:0,cost:0};
      grouped[s.product].qty+=s.qty;
      grouped[s.product].total+=s.qty*s.price;
      grouped[s.product].cost+=s.qty*s.cost;
    });
    Object.keys(grouped).forEach(p=>{
      const g=grouped[p];
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${p}</td><td>${g.qty}</td><td>${fmt(g.total)}</td><td>${fmt(g.total/g.qty)}</td><td>${fmt((g.total/mockSales.reduce((a,b)=>a+b.qty*b.price,0))*100)}%</td>`;
      tbody.appendChild(tr);
    });
  }

  function generateSalesByCustomer(){
    const tbody=$('#sales-customer-table tbody');
    if(!tbody) return;
    tbody.innerHTML='';
    const grouped={};
    mockSales.forEach(s=>{
      if(!grouped[s.customer]) grouped[s.customer]={count:0,total:0};
      grouped[s.customer].count+=1;
      grouped[s.customer].total+=s.qty*s.price;
    });
    Object.keys(grouped).forEach(c=>{
      const g=grouped[c];
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>${c}</td><td>${g.count}</td><td>${fmt(g.total)}</td><td>${fmt(g.total/g.count)}</td><td>${fmt((g.total/mockSales.reduce((a,b)=>a+b.qty*b.price,0))*100)}%</td>`;
      tbody.appendChild(tr);
    });
  }

  /* =============================
     تحليل الأرباح
     ============================= */
  function generateProfitOverview(){
    const salesTotal=mockSales.reduce((a,b)=>a+b.qty*b.price,0);
    const cogs=mockSales.reduce((a,b)=>a+b.qty*b.cost,0);
    const gross=salesTotal-cogs;
    const margin=(gross/salesTotal*100)||0;

    $('#total-sales-profit').textContent=fmt(salesTotal);
    $('#total-cogs').textContent=fmt(cogs);
    $('#gross-profit').textContent=fmt(gross);
    $('#gross-margin').textContent=fmt(margin)+'%';

    const tbody=$('#profit-summary-table tbody');
    if(tbody){
      tbody.innerHTML='';
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>2025</td><td>${fmt(salesTotal)}</td><td>${fmt(cogs)}</td><td>${fmt(gross)}</td><td>${fmt(margin)}%</td><td>-</td>`;
      tbody.appendChild(tr);
    }
  }

  /* =============================
     تقارير المشتريات
     ============================= */
  function generatePurchaseSummary(){
    const total=mockPurchases.reduce((a,b)=>a+b.qty*b.price,0);
    const invoices=mockPurchases.length;
    const net=total; // ما في مرتجعات بهالبيانات
    const avg=invoices?total/invoices:0;

    $('#total-purchases').textContent=fmt(total);
    $('#total-purchase-invoices').textContent=invoices;
    $('#total-purchase-returns').textContent='0';
    $('#net-purchases').textContent=fmt(net);

    const tbody=$('#purchase-summary-table tbody');
    if(tbody){
      tbody.innerHTML='';
      const tr=document.createElement('tr');
      tr.innerHTML=`<td>2025</td><td>${fmt(total)}</td><td>0</td><td>${fmt(net)}</td><td>${invoices}</td><td>${fmt(avg)}</td>`;
      tbody.appendChild(tr);
    }
  }

  /* =============================
     تقارير المخزون
     ============================= */
  function generateInventorySummary(){
    const grouped={};
    mockPurchases.forEach(p=>{
      if(!grouped[p.product]) grouped[p.product]={qty:0,value:0};
      grouped[p.product].qty+=p.qty;
      grouped[p.product].value+=p.qty*p.price;
    });

    const totalItems=Object.keys(grouped).length;
    const totalQty=Object.values(grouped).reduce((a,b)=>a+b.qty,0);
    const totalValue=Object.values(grouped).reduce((a,b)=>a+b.value,0);

    $('#total-items').textContent=totalItems;
    $('#total-quantity').textContent=totalQty;
    $('#total-inventory-value').textContent=fmt(totalValue);
    $('#low-stock-items').textContent=Object.values(grouped).filter(g=>g.qty<10).length;

    const tbody=$('#inventory-summary-table tbody');
    if(tbody){
      tbody.innerHTML='';
      Object.keys(grouped).forEach(p=>{
        const g=grouped[p];
        const tr=document.createElement('tr');
        tr.innerHTML=`<td>${p}</td><td>1</td><td>${g.qty}</td><td>${fmt(g.value)}</td><td>${fmt(g.value/g.qty)}</td><td>${fmt((g.value/totalValue)*100)}%</td>`;
        tbody.appendChild(tr);
      });
    }
  }

  /* =============================
     ربط الأزرار
     ============================= */
  document.addEventListener('DOMContentLoaded',()=>{
    // مبيعات
    $('#generate-sales-summary-btn')?.addEventListener('click',generateSalesSummary);
    $('#generate-sales-product-btn')?.addEventListener('click',generateSalesByProduct);
    $('#generate-sales-customer-btn')?.addEventListener('click',generateSalesByCustomer);

    // أرباح
    $('#generate-profit-btn')?.addEventListener('click',generateProfitOverview);

    // مشتريات
    $('#generate-purchase-summary-btn')?.addEventListener('click',generatePurchaseSummary);

    // مخزون
    $('#generate-inventory-summary-btn')?.addEventListener('click',generateInventorySummary);

    // تشغيل افتراضي
    generateSalesSummary();
    generateSalesByProduct();
    generateSalesByCustomer();
    generateProfitOverview();
    generatePurchaseSummary();
    generateInventorySummary();
  });

})();
(function(){
  'use strict';

  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
  const fmt = n => (+n).toFixed(2)+" ر.س";

  // بيانات المنتجات (وهمية للتجريب)
  const products = [
    {id:1,name:"عطر A",category:"عطور",price:100},
    {id:2,name:"عطر B",category:"عطور",price:150},
    {id:3,name:"بخاخ C",category:"بخاخات",price:80},
    {id:4,name:"زيت D",category:"زيوت",price:50},
    {id:5,name:"عطر E",category:"عطور",price:200},
  ];

  let cart=[]; // السلة
  let discount=0;

  /* ====== عرض المنتجات ====== */
  function renderProducts(category="all",search=""){
    const container=$(".pos-products-list");
    container.innerHTML="";
    products
      .filter(p=>(category==="all"||p.category===category) && p.name.includes(search))
      .forEach(p=>{
        const div=document.createElement("div");
        div.className="pos-product";
        div.innerHTML=`<h4>${p.name}</h4><p>${fmt(p.price)}</p><button class="btn add-to-cart" data-id="${p.id}">+</button>`;
        container.appendChild(div);
      });
    $$(".add-to-cart").forEach(btn=>btn.addEventListener("click",()=>addToCart(+btn.dataset.id)));
  }

  /* ====== عرض التصنيفات ====== */
  function renderCategories(){
    const cats=["all",...new Set(products.map(p=>p.category))];
    const container=$(".pos-categories");
    container.innerHTML="";
    cats.forEach(c=>{
      const btn=document.createElement("button");
      btn.className="btn pos-category-btn";
      if(c==="all") btn.classList.add("active");
      btn.dataset.category=c;
      btn.textContent=c==="all"?"الكل":c;
      btn.addEventListener("click",()=>{
        $$(".pos-category-btn").forEach(b=>b.classList.remove("active"));
        btn.classList.add("active");
        renderProducts(c);
      });
      container.appendChild(btn);
    });
  }

  /* ====== إدارة السلة ====== */
  function addToCart(id){
    const product=products.find(p=>p.id===id);
    const existing=cart.find(i=>i.id===id);
    if(existing){ existing.qty++; }
    else{ cart.push({...product,qty:1}); }
    renderCart();
  }

  function removeFromCart(id){
    cart=cart.filter(i=>i.id!==id);
    renderCart();
  }

  function updateQty(id,qty){
    const item=cart.find(i=>i.id===id);
    if(item){ item.qty=qty>0?qty:1; }
    renderCart();
  }

  function clearCart(){
    cart=[];
    discount=0;
    renderCart();
  }

  function renderCart(){
    const tbody=$("#pos-cart-table tbody");
    tbody.innerHTML="";
    let subtotal=0;
    cart.forEach(i=>{
      const total=i.qty*i.price;
      subtotal+=total;
      const tr=document.createElement("tr");
      tr.innerHTML=`
        <td>${i.name}</td>
        <td><input type="number" value="${i.qty}" min="1" style="width:50px"></td>
        <td>${fmt(i.price)}</td>
        <td>${fmt(total)}</td>
        <td><button class="btn btn-danger remove-item">×</button></td>
      `;
      tr.querySelector("input").addEventListener("change",e=>updateQty(i.id,+e.target.value));
      tr.querySelector(".remove-item").addEventListener("click",()=>removeFromCart(i.id));
      tbody.appendChild(tr);
    });

    const tax=subtotal*0.15;
    const total=subtotal+tax-discount;
    $("#pos-subtotal").textContent=fmt(subtotal);
    $("#pos-tax").textContent=fmt(tax);
    $("#pos-discount").textContent=fmt(discount);
    $("#pos-total").textContent=fmt(total>0?total:0);
  }

  /* ====== الدفع ====== */
  function openPayment(){
    if(cart.length===0){ alert("السلة فارغة"); return; }
    $(".pos-payment-modal").style.display="block";
    $("#payment-amount").value="";
    $("#payment-change").value="";
  }

  function closePayment(){
    $(".pos-payment-modal").style.display="none";
  }

  function completePayment(){
    const total=parseFloat($("#pos-total").textContent)||0;
    const paid=parseFloat($("#payment-amount").value)||0;
    if(paid<total){ alert("المبلغ المدفوع غير كافي"); return; }
    const change=paid-total;
    $("#payment-change").value=fmt(change);
    alert("تمت عملية الدفع بنجاح ✅");
    clearCart();
    closePayment();
  }

  /* ====== خصم ====== */
  function applyDiscount(){
    const val=prompt("أدخل قيمة الخصم:");
    if(val){
      discount=parseFloat(val)||0;
      renderCart();
    }
  }

  /* ====== ربط الأحداث ====== */
  document.addEventListener("DOMContentLoaded",()=>{
    renderCategories();
    renderProducts();

    $("#pos-search-btn").addEventListener("click",()=>{
      renderProducts("all",$("#pos-search").value);
    });

    $("#pos-clear-btn").addEventListener("click",clearCart);
    $("#pos-discount-btn").addEventListener("click",applyDiscount);
    $("#pos-payment-btn").addEventListener("click",openPayment);
    $("#pos-cancel-payment").addEventListener("click",closePayment);
    $("#pos-complete-payment").addEventListener("click",completePayment);
    $("#pos-hold-btn").addEventListener("click",()=>alert("تم تعليق الطلب مؤقتاً"));
  });

})();
(function(){
  'use strict';

  const $ = (s,ctx=document)=>ctx.querySelector(s);
  const $$ = (s,ctx=document)=>Array.from(ctx.querySelectorAll(s));

  // بيانات أولية (وهمية للتجريب)
  let users = [
    {id:1,name:"أحمد علي",email:"ahmed@example.com",role:"admin",status:"نشط",phone:"0551234567",createdAt:"2025-01-01"},
    {id:2,name:"سارة محمد",email:"sara@example.com",role:"sales",status:"نشط",phone:"0559876543",createdAt:"2025-02-15"}
  ];

  let editingId=null;

  // قائمة الصلاحيات
  const rolePermissions = {
    admin:["كل الصلاحيات"],
    manager:["إدارة المبيعات","إدارة المشتريات","إدارة المخازن","التقارير"],
    sales:["إنشاء فواتير","إدارة العملاء","عرض تقارير المبيعات"],
    purchasing:["إنشاء طلب شراء","إدارة الموردين","عرض تقارير المشتريات"],
    inventory:["إضافة أصناف","إدارة المستودعات","تقارير المخزون"],
    accountant:["قيود اليومية","إدارة الحسابات","تقارير مالية"]
  };

  /* ====== عرض المستخدمين ====== */
  function renderUsers(){
    const tbody=$("#users-table tbody");
    const search=$("#search-users").value.trim();
    tbody.innerHTML="";

    users
      .filter(u=>!search || u.name.includes(search) || u.email.includes(search))
      .forEach((u,idx)=>{
        const tr=document.createElement("tr");
        tr.innerHTML=`
          <td>${idx+1}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${mapRole(u.role)}</td>
          <td><span class="status-${u.status==='نشط'?'active':'inactive'}">${u.status}</span></td>
          <td>${u.createdAt}</td>
          <td>
            <button class="btn-icon edit-user"><i class="fas fa-edit"></i></button>
            <button class="btn-icon delete-user"><i class="fas fa-trash"></i></button>
          </td>
        `;
        tr.querySelector(".edit-user").addEventListener("click",()=>editUser(u.id));
        tr.querySelector(".delete-user").addEventListener("click",()=>deleteUser(u.id));
        tbody.appendChild(tr);
      });
  }

  function mapRole(role){
    const map={
      admin:"مدير النظام",
      manager:"مدير",
      sales:"مبيعات",
      purchasing:"مشتريات",
      inventory:"مخازن",
      accountant:"محاسب"
    };
    return map[role]||role;
  }

  /* ====== عرض الصلاحيات ====== */
  function renderPermissions(role){
    const container=$(".permissions-list");
    container.innerHTML="";
    (rolePermissions[role]||[]).forEach(p=>{
      const div=document.createElement("div");
      div.innerHTML=`<label><input type="checkbox" checked disabled> ${p}</label>`;
      container.appendChild(div);
    });
  }

  /* ====== إضافة أو تعديل مستخدم ====== */
  function saveUser(){
    const name=$("#user-name").value.trim();
    const email=$("#user-email").value.trim();
    const role=$("#user-role").value;
    const password=$("#user-password").value;
    const confirm=$("#user-confirm-password").value;
    const status=$("#user-status").value==="active"?"نشط":"غير نشط";
    const phone=$("#user-phone").value.trim();

    if(!name||!email||!role){
      alert("الرجاء تعبئة جميع الحقول المطلوبة");
      return;
    }
    if(password!==confirm){
      alert("كلمة المرور غير متطابقة");
      return;
    }

    if(editingId){
      // تعديل
      const u=users.find(u=>u.id===editingId);
      Object.assign(u,{name,email,role,status,phone});
      editingId=null;
    } else {
      // إضافة
      users.push({
        id:Date.now(),
        name,email,role,status,phone,
        createdAt:new Date().toISOString().split("T")[0]
      });
    }

    hideUserForm();
    renderUsers();
  }

  function editUser(id){
    const u=users.find(u=>u.id===id);
    if(!u) return;
    editingId=id;
    $("#user-form-title").textContent="تعديل مستخدم";
    $("#user-name").value=u.name;
    $("#user-email").value=u.email;
    $("#user-role").value=u.role;
    $("#user-status").value=u.status==="نشط"?"active":"inactive";
    $("#user-phone").value=u.phone;
    $("#user-password").value="";
    $("#user-confirm-password").value="";
    renderPermissions(u.role);
    $("#user-form").style.display="block";
  }

  function deleteUser(id){
    if(confirm("هل تريد حذف هذا المستخدم؟")){
      users=users.filter(u=>u.id!==id);
      renderUsers();
    }
  }

  /* ====== عرض/إخفاء النموذج ====== */
  function showUserForm(){
    $("#user-form-title").textContent="إضافة مستخدم جديد";
    $("#user-form").style.display="block";
    $("#user-name").value="";
    $("#user-email").value="";
    $("#user-role").value="sales";
    $("#user-password").value="";
    $("#user-confirm-password").value="";
    $("#user-status").value="active";
    $("#user-phone").value="";
    renderPermissions("sales");
  }

  function hideUserForm(){
    $("#user-form").style.display="none";
  }

  /* ====== ربط الأحداث ====== */
  document.addEventListener("DOMContentLoaded",()=>{
    renderUsers();

    $("#add-user-btn").addEventListener("click",showUserForm);
    $("#cancel-user").addEventListener("click",hideUserForm);
    $("#save-user").addEventListener("click",saveUser);
    $("#search-users-btn").addEventListener("click",renderUsers);
    $("#user-role").addEventListener("change",e=>renderPermissions(e.target.value));
  });

})();
