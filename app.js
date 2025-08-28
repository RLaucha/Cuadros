// =================== CONFIG ===================
const BUSINESS = {
  whatsapp: "+54911XXXXXXXX", // <-- poné tu número real (+54...)
  brand: "Aura Deco",
  city: "Lanús",
};

// Categorías
const CATEGORIES = [
  { id: "todos", name: "Todos" },
  { id: "abstracto", name: "Abstracto" },
  { id: "botanico",  name: "Botánico" },
  { id: "tipografia",name: "Tipografía" },
  { id: "lineart",   name: "Line Art" },
  { id: "mapas",     name: "Mapas" },
];

// Imagen de muestra SVG (sirve hasta que tengas fotos reales)
const SAMPLE_IMG = (seed = 1) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 1000'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='#c89f7a'/>
        <stop offset='50%' stop-color='#e6d5c4'/>
        <stop offset='100%' stop-color='#f6efe8'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <circle cx='${200 + (seed * 40) % 400}' cy='${260 + (seed * 60) % 400}' r='160' fill='rgba(139,94,60,0.55)'/>
    <rect x='120' y='680' width='560' height='40' fill='rgba(42,35,32,0.5)'/>
  </svg>`)}
`;

// Productos (podés reemplazar img por URLs o por rutas locales en /img)
const PRODUCTS = [
  { id:1, title:"Arcilla I",  cat:"abstracto", price:25900, sizes:["30×40","40×50","50×70"], img:SAMPLE_IMG(1), desc:"Tonos cálidos en composición geométrica." },
  { id:2, title:"Arcilla II", cat:"abstracto", price:25900, sizes:["30×40","50×70"],         img:SAMPLE_IMG(2), desc:"Par geométrico para combinar con Arcilla I." },
  { id:3, title:"Botanic A",  cat:"botanico",  price:23900, sizes:["30×40","40×50"],         img:SAMPLE_IMG(3), desc:"Ilustración botánica minimalista." },
  { id:4, title:"Mapamundi",  cat:"mapas",     price:32900, sizes:["50×70","60×90"],         img:SAMPLE_IMG(4), desc:"Mapa artístico para living o estudio." },
  { id:5, title:"Line Art I", cat:"lineart",   price:24900, sizes:["30×40","40×50","50×70"], img:SAMPLE_IMG(5), desc:"Trazos continuos para espacios calmos." },
  { id:6, title:"Quote Bold", cat:"tipografia",price:21900, sizes:["30×40","40×50"],         img:SAMPLE_IMG(6), desc:"Tipografía de impacto en alto contraste." },
];

// =================== UTIL ===================
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const money = (n) => {
  try { return n.toLocaleString("es-AR", { style:"currency", currency:"ARS", maximumFractionDigits:0 }); }
  catch { return `$${n}`; }
};
const labelCat = (id) => (CATEGORIES.find(c => c.id === id) || { name:id }).name;

function wappURL(text = "Hola! Quiero hacer una consulta.") {
  const num = BUSINESS.whatsapp.replace(/[^\d+]/g, "");
  return `https://wa.me/${encodeURIComponent(num)}?text=${encodeURIComponent(text)}`;
}

// =================== CART STATE ===================
let CART = []; // {key,id,title,size,qty,price,img}
const CART_KEY = "auradeco_cart_v1";

function loadCart(){
  try { CART = JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { CART = []; }
}
function saveCart(){
  localStorage.setItem(CART_KEY, JSON.stringify(CART));
  updateCartCount();
}
function updateCartCount(){
  $("#cartCount").textContent = CART.reduce((a,b)=>a+b.qty, 0);
}
function cartSubtotal(){ return CART.reduce((acc, it)=> acc + it.price*it.qty, 0); }
const cartKey = (pId, size) => `${pId}__${size}`;

function addToCart(product, size, qty=1){
  const key = cartKey(product.id, size);
  const existing = CART.find(i => i.key === key);
  if (existing) existing.qty += qty;
  else CART.push({ key, id:product.id, title:product.title, size, qty, price:product.price, img:product.img });
  saveCart(); renderCartTotals();
}
function setQty(key, qty){
  const it = CART.find(i=>i.key===key);
  if (!it) return;
  it.qty = Math.max(1, qty);
  saveCart(); renderCart();
}
function removeItem(key){
  CART = CART.filter(i=>i.key!==key);
  saveCart(); renderCart();
}
function emptyCart(){
  CART = []; saveCart(); renderCart();
}

// =================== RENDER: FILTROS + GRID ===================
const $filters = $("#filters");
const $grid    = $("#grid");
const $year    = $("#year");
if ($year) $year.textContent = new Date().getFullYear();
const $brandName = $("#brandName");
if ($brandName) $brandName.textContent = BUSINESS.brand;

function renderFilters(active="todos"){
  if (!$filters) return;
  $filters.innerHTML = "";
  CATEGORIES.forEach(c=>{
    const el = document.createElement("button");
    el.className = "chip" + (c.id===active ? " active" : "");
    el.textContent = c.name;
    el.onclick = ()=>{
      $$(".chip").forEach(x=>x.classList.remove("active"));
      el.classList.add("active");
      renderGrid(c.id);
    };
    $filters.appendChild(el);
  });
}

function renderGrid(filter="todos"){
  if (!$grid) return;
  const list = filter==="todos" ? PRODUCTS : PRODUCTS.filter(p=>p.cat===filter);
  $grid.innerHTML = "";
  list.forEach(p=>{
    const card = document.createElement("article");
    card.className = "card";
    const sizeOptions = p.sizes.map(s=>`<option value="${s}">${s}</option>`).join("");
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="card-body">
        <div class="meta">
          <b>${p.title}</b>
          <span class="price">${money(p.price)}</span>
        </div>
        <div class="meta" style="margin-top:6px">
          <span style="color:#cdb8a8">${labelCat(p.cat)}</span>
          <div class="sizes">${p.sizes.map(s=>`<span>${s}</span>`).join("")}</div>
        </div>
        <div class="inline-controls">
          <label style="flex:1;min-width:140px">
            <span style="font-size:12px;color:#cdb8a8">Tamaño</span>
            <select data-size-for="${p.id}">${sizeOptions}</select>
          </label>
          <button class="btn primary" data-view="${p.id}">Ver detalles</button>
          <button class="btn ghost" data-add="${p.id}">Agregar</button>
        </div>
      </div>
    `;
    // Eventos
    card.querySelector(`[data-view="${p.id}"]`)?.addEventListener("click", ()=>openModal(p));
    card.querySelector(`[data-add="${p.id}"]`)?.addEventListener("click", ()=>{
      const sel = card.querySelector(`[data-size-for="${p.id}"]`);
      addToCart(p, sel.value, 1);
      openCart(); // feedback visual
    });
    $grid.appendChild(card);
  });
}

// =================== MODAL DE PRODUCTO ===================
const modal       = $("#productModal");
const modalImg    = $("#modalImg");
const modalTitle  = $("#modalTitle");
const modalDesc   = $("#modalDesc");
const modalSize   = $("#modalSize");
const modalQty    = $("#modalQty");
const modalPrice  = $("#modalPrice");
const modalBuy    = $("#modalBuy");
const modalAddBtn = $("#modalAddCart");
$("#modalClose")?.addEventListener("click", ()=> modal.close());

let modalProduct = null;

function openModal(p){
  if (!modal) return;
  modalProduct = p;
  modalImg.src = p.img;
  modalTitle.textContent = p.title;
  modalDesc.textContent = p.desc;
  modalSize.innerHTML = p.sizes.map(s=>`<option value="${s}">${s}</option>`).join("");
  modalQty.value = 1;
  modalPrice.textContent = money(p.price);
  modalBuy.href = wappURL(`Hola! Me interesa el cuadro "${p.title}". Tamaño: ${p.sizes[0]}. ¿Disponibilidad y precio?`);
  modal.showModal();
}

modalQty?.addEventListener("change", ()=>{
  const q = Math.max(1, parseInt(modalQty.value || "1", 10));
  modalQty.value = q;
  if (modalProduct) modalPrice.textContent = money(modalProduct.price * q);
});
modalAddBtn?.addEventListener("click", ()=>{
  if (!modalProduct) return;
  const size = modalSize.value;
  const qty  = Math.max(1, parseInt(modalQty.value || "1", 10));
  addToCart(modalProduct, size, qty);
  modal.close();
  openCart();
});

// =================== CARRITO (DRAWER) ===================
const drawer        = $("#cartDrawer");
const cartItems     = $("#cartItems");
const cartSubtotalEl= $("#cartSubtotal");
const openCartBtn   = $("#openCart");
const closeCartBtn  = $("#closeCart");
const emptyCartBtn  = $("#emptyCart");
const checkoutBtn   = $("#cartCheckout");

openCartBtn?.addEventListener("click", openCart);
closeCartBtn?.addEventListener("click", ()=> drawer.close());
emptyCartBtn?.addEventListener("click", ()=> emptyCart());

checkoutBtn?.addEventListener("click", ()=>{
  if (!CART.length) return;
  const lines = CART.map((it, i)=> `${i+1}) ${it.title} - ${it.size} x${it.qty} = ${money(it.price*it.qty)}`);
  const total = money(cartSubtotal());
  const msg = [
    `Hola! Quiero armar mi pedido de *${BUSINESS.brand}*:`,
    ...lines,
    `Subtotal: ${total}`,
    "",
    "¿Disponibilidad y tiempos de entrega?"
  ].join("\n");
  checkoutBtn.href = wappURL(msg);
});

function openCart(){
  renderCart();
  drawer?.showModal();
}

function renderCart(){
  if (!cartItems) return;
  cartItems.innerHTML = "";
  if (!CART.length){
    cartItems.innerHTML = `<div style="padding:18px;color:#d6c6b8">Tu carrito está vacío.</div>`;
  } else {
    CART.forEach(it=>{
      const row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML = `
        <img class="cart-thumb" src="${it.img}" alt="${it.title}">
        <div>
          <b>${it.title}</b>
          <span class="muted">${it.size} · ${money(it.price)}</span>
          <div class="qty-controls" style="margin-top:6px">
            <button data-dec="${it.key}">−</button>
            <span>${it.qty}</span>
            <button data-inc="${it.key}">+</button>
            <button data-del="${it.key}" title="Quitar">🗑️</button>
          </div>
        </div>
        <div><b>${money(it.price * it.qty)}</b></div>
      `;
      row.querySelector(`[data-dec="${it.key}"]`)?.addEventListener("click", ()=> setQty(it.key, it.qty - 1));
      row.querySelector(`[data-inc="${it.key}"]`)?.addEventListener("click", ()=> setQty(it.key, it.qty + 1));
      row.querySelector(`[data-del="${it.key}"]`)?.addEventListener("click", ()=> removeItem(it.key));
      cartItems.appendChild(row);
    });
  }
  renderCartTotals();
}
function renderCartTotals(){
  if (cartSubtotalEl) cartSubtotalEl.textContent = money(cartSubtotal());
  updateCartCount();
}

// =================== FORM -> WHATSAPP ===================
$("#form")?.addEventListener("submit", (e)=>{
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target).entries());
  const text = `Hola! Soy ${data.nombre}. ${data.mensaje}`;
  window.open(wappURL(text), "_blank");
});

// =================== MENÚ RESPONSIVE ===================
const menuToggle = $("#menuToggle");
const menu       = $("#menu");
menuToggle?.addEventListener("click", ()=>{
  menu?.classList.toggle("open");
});
$$(".menu a").forEach(a=>{
  a.addEventListener("click", ()=> menu?.classList.remove("open"));
});

// =================== INIT ===================
function initWhatsAppLinks(){
  const url = wappURL();
  $("#wappLink")?.setAttribute("href", url);
  $("#wappCTA")?.setAttribute("href", url);
}
function init(){
  loadCart();
  renderFilters();
  renderGrid();
  updateCartCount();
  initWhatsAppLinks();
}
init();
