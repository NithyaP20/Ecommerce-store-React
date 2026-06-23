import { useState, useReducer, createContext, useContext, useEffect } from "react";

// ─── MOCK DATA ──────────────────────────────────────────────────────────────
const INITIAL_PRODUCTS = [
  { id: 1, name: "Arc Desk Lamp", category: "Lighting", price: 89, stock: 14, image: "💡", description: "Sleek minimalist arc lamp with dimmer control and USB-C charging port." },
  { id: 2, name: "Ceramic Pour-Over Set", category: "Kitchen", price: 54, stock: 8, image: "☕", description: "Hand-thrown ceramic dripper and carafe for the perfect morning ritual." },
  { id: 3, name: "Linen Throw Blanket", category: "Home", price: 72, stock: 23, image: "🛋️", description: "Pre-washed Belgian linen in undyed natural tones. Machine washable." },
  { id: 4, name: "Mechanical Keyboard", category: "Tech", price: 149, stock: 6, image: "⌨️", description: "75% layout, hot-swap switches, PBT keycaps with per-key RGB." },
  { id: 5, name: "Walnut Phone Stand", category: "Tech", price: 38, stock: 19, image: "📱", description: "Solid black walnut, oil-finished. Works with any phone width 60–90mm." },
  { id: 6, name: "Glass Water Bottle", category: "Kitchen", price: 29, stock: 31, image: "🫙", description: "Borosilicate glass with silicone sleeve. 600ml, leak-proof lid." },
  { id: 7, name: "Desk Organizer", category: "Home", price: 44, stock: 11, image: "🗂️", description: "Powder-coated steel with modular trays. Holds pens, cards, and cables." },
  { id: 8, name: "Noise-Cancel Buds", category: "Tech", price: 199, stock: 4, image: "🎧", description: "Hybrid ANC, 28h battery, multipoint pairing. Charging case included." },
];

const CATEGORIES = ["All", "Tech", "Kitchen", "Home", "Lighting"];

// ─── CART CONTEXT & REDUCER ─────────────────────────────────────────────────
const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const exists = state.find(i => i.id === action.product.id);
      if (exists) return state.map(i => i.id === action.product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.product, qty: 1 }];
    }
    case "REMOVE": return state.filter(i => i.id !== action.id);
    case "QTY": return state.map(i => i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i);
    case "CLEAR": return [];
    default: return state;
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = n => "$" + n.toFixed(2);
const total = items => items.reduce((s, i) => s + i.price * i.qty, 0);

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  // Layout
  app: { fontFamily: "'Inter', system-ui, sans-serif", minHeight: "100vh", background: "#F7F6F3", color: "#1A1A18" },
  nav: { background: "#1A1A18", color: "#F7F6F3", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 },
  navBrand: { fontWeight: 700, fontSize: 18, letterSpacing: "-0.5px", cursor: "pointer" },
  navRight: { display: "flex", gap: 8, alignItems: "center" },
  navBtn: (active) => ({ background: active ? "#F7F6F3" : "transparent", color: active ? "#1A1A18" : "#F7F6F3", border: "1px solid", borderColor: active ? "#F7F6F3" : "#444", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13, fontWeight: 500 }),
  cartBadge: { background: "#E8632B", color: "#fff", borderRadius: "50%", fontSize: 11, fontWeight: 700, width: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: 4 },
  main: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px" },
  // Products
  filters: { display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", alignItems: "center" },
  filterBtn: (active) => ({ background: active ? "#1A1A18" : "#fff", color: active ? "#F7F6F3" : "#1A1A18", border: "1px solid #D5D3CE", borderRadius: 20, padding: "6px 16px", cursor: "pointer", fontSize: 13, fontWeight: 500 }),
  searchBox: { flex: 1, maxWidth: 280, border: "1px solid #D5D3CE", borderRadius: 20, padding: "7px 16px", fontSize: 13, outline: "none", background: "#fff" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 },
  card: { background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #ECEAE5", display: "flex", flexDirection: "column" },
  cardImg: { background: "#F0EEE9", height: 140, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 },
  cardBody: { padding: "16px", flex: 1, display: "flex", flexDirection: "column" },
  cardCat: { fontSize: 11, fontWeight: 600, color: "#8C8A84", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 4 },
  cardName: { fontWeight: 600, fontSize: 15, marginBottom: 6, color: "#1A1A18" },
  cardDesc: { fontSize: 13, color: "#6B6963", lineHeight: 1.5, flex: 1, marginBottom: 12 },
  cardFooter: { display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" },
  price: { fontWeight: 700, fontSize: 16 },
  stockLow: { fontSize: 11, color: "#E8632B", fontWeight: 600 },
  addBtn: (oos) => ({ background: oos ? "#D5D3CE" : "#1A1A18", color: oos ? "#8C8A84" : "#F7F6F3", border: "none", borderRadius: 7, padding: "8px 14px", cursor: oos ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }),
  // Cart
  cartWrap: { maxWidth: 640, margin: "0 auto" },
  cartRow: { background: "#fff", border: "1px solid #ECEAE5", borderRadius: 10, padding: "16px", display: "flex", gap: 16, alignItems: "center", marginBottom: 12 },
  cartEmoji: { fontSize: 36, minWidth: 48, textAlign: "center" },
  cartInfo: { flex: 1 },
  cartName: { fontWeight: 600, fontSize: 14 },
  cartPrice: { fontSize: 13, color: "#6B6963", marginTop: 2 },
  qtyWrap: { display: "flex", alignItems: "center", gap: 8, marginTop: 8 },
  qtyBtn: { background: "#F0EEE9", border: "none", borderRadius: 5, width: 28, height: 28, cursor: "pointer", fontWeight: 700, fontSize: 15 },
  qtyNum: { fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: "center" },
  removeBtn: { background: "none", border: "none", color: "#C0392B", cursor: "pointer", fontSize: 20, lineHeight: 1 },
  summary: { background: "#fff", border: "1px solid #ECEAE5", borderRadius: 10, padding: 20, marginTop: 20 },
  summaryRow: { display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 14 },
  summaryTotal: { display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 17, borderTop: "1px solid #ECEAE5", paddingTop: 12, marginTop: 4 },
  // Checkout
  form: { maxWidth: 560, margin: "0 auto" },
  formGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 600, color: "#6B6963", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.4px" },
  input: { width: "100%", border: "1px solid #D5D3CE", borderRadius: 8, padding: "10px 12px", fontSize: 14, outline: "none", background: "#fff", boxSizing: "border-box" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  // Admin
  adminGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 },
  statCard: (color) => ({ background: color, borderRadius: 10, padding: "16px 20px", color: "#fff" }),
  statNum: { fontSize: 28, fontWeight: 800 },
  statLabel: { fontSize: 12, opacity: 0.85, marginTop: 2 },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden", border: "1px solid #ECEAE5" },
  th: { background: "#F0EEE9", padding: "10px 14px", fontSize: 12, fontWeight: 700, textAlign: "left", color: "#6B6963", textTransform: "uppercase", letterSpacing: "0.4px" },
  td: { padding: "12px 14px", fontSize: 14, borderBottom: "1px solid #ECEAE5" },
  badge: (color) => ({ background: color + "22", color: color, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }),
  // Shared
  pageTitle: { fontSize: 22, fontWeight: 700, marginBottom: 24, letterSpacing: "-0.5px" },
  primaryBtn: { background: "#1A1A18", color: "#F7F6F3", border: "none", borderRadius: 8, padding: "12px 24px", cursor: "pointer", fontSize: 15, fontWeight: 600, width: "100%" },
  secondaryBtn: { background: "#fff", color: "#1A1A18", border: "1px solid #D5D3CE", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontWeight: 600 },
  toast: { position: "fixed", bottom: 24, right: 24, background: "#1A1A18", color: "#F7F6F3", padding: "12px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, zIndex: 999, boxShadow: "0 4px 20px rgba(0,0,0,0.2)" },
  empty: { textAlign: "center", padding: "60px 0", color: "#8C8A84" },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  success: { textAlign: "center", padding: "48px 0", maxWidth: 400, margin: "0 auto" },
};

// ─── TOAST COMPONENT ─────────────────────────────────────────────────────────
function Toast({ msg }) {
  if (!msg) return null;
  return <div style={S.toast}>✓ {msg}</div>;
}

// ─── PRODUCTS PAGE ────────────────────────────────────────────────────────────
function ProductsPage({ products }) {
  const { dispatch, cart } = useContext(CartContext);
  const [cat, setCat] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = products.filter(p =>
    (cat === "All" || p.category === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const inCart = (id) => cart.find(i => i.id === id);

  return (
    <div>
      <div style={S.filters}>
        <input style={S.searchBox} placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} />
        {CATEGORIES.map(c => (
          <button key={c} style={S.filterBtn(cat === c)} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={S.empty}><div style={S.emptyIcon}>🔍</div><div>No products found</div></div>
      ) : (
        <div style={S.grid}>
          {filtered.map(p => {
            const oos = p.stock === 0;
            const already = inCart(p.id);
            return (
              <div key={p.id} style={S.card}>
                <div style={S.cardImg}>{p.image}</div>
                <div style={S.cardBody}>
                  <div style={S.cardCat}>{p.category}</div>
                  <div style={S.cardName}>{p.name}</div>
                  <div style={S.cardDesc}>{p.description}</div>
                  <div style={S.cardFooter}>
                    <div>
                      <div style={S.price}>{fmt(p.price)}</div>
                      {p.stock <= 5 && !oos && <div style={S.stockLow}>Only {p.stock} left</div>}
                      {oos && <div style={S.stockLow}>Out of stock</div>}
                    </div>
                    <button
                      style={S.addBtn(oos)}
                      disabled={oos}
                      onClick={() => dispatch({ type: "ADD", product: p })}
                    >
                      {already ? "Add more" : "Add to cart"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── CART PAGE ────────────────────────────────────────────────────────────────
function CartPage({ setPage }) {
  const { cart, dispatch } = useContext(CartContext);
  const subtotal = total(cart);
  const shipping = subtotal > 0 ? (subtotal >= 100 ? 0 : 8.99) : 0;
  const tax = subtotal * 0.08;

  if (cart.length === 0) return (
    <div style={S.empty}>
      <div style={S.emptyIcon}>🛒</div>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Your cart is empty</div>
      <div style={{ fontSize: 13, color: "#8C8A84", marginBottom: 20 }}>Add something from the shop</div>
      <button style={{ ...S.secondaryBtn, display: "inline-block" }} onClick={() => setPage("shop")}>Browse products</button>
    </div>
  );

  return (
    <div style={S.cartWrap}>
      <div style={S.pageTitle}>Cart ({cart.length} item{cart.length !== 1 ? "s" : ""})</div>
      {cart.map(item => (
        <div key={item.id} style={S.cartRow}>
          <div style={S.cartEmoji}>{item.image}</div>
          <div style={S.cartInfo}>
            <div style={S.cartName}>{item.name}</div>
            <div style={S.cartPrice}>{fmt(item.price)} each</div>
            <div style={S.qtyWrap}>
              <button style={S.qtyBtn} onClick={() => dispatch({ type: "QTY", id: item.id, qty: item.qty - 1 })}>−</button>
              <span style={S.qtyNum}>{item.qty}</span>
              <button style={S.qtyBtn} onClick={() => dispatch({ type: "QTY", id: item.id, qty: item.qty + 1 })}>+</button>
              <span style={{ fontSize: 13, color: "#6B6963", marginLeft: 8 }}>{fmt(item.price * item.qty)}</span>
            </div>
          </div>
          <button style={S.removeBtn} onClick={() => dispatch({ type: "REMOVE", id: item.id })}>×</button>
        </div>
      ))}
      <div style={S.summary}>
        <div style={S.summaryRow}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
        <div style={S.summaryRow}><span>Shipping</span><span>{shipping === 0 ? "Free" : fmt(shipping)}</span></div>
        <div style={S.summaryRow}><span>Tax (8%)</span><span>{fmt(tax)}</span></div>
        {subtotal < 100 && subtotal > 0 && (
          <div style={{ fontSize: 12, color: "#E8632B", marginBottom: 8 }}>
            Add {fmt(100 - subtotal)} more for free shipping!
          </div>
        )}
        <div style={S.summaryTotal}><span>Total</span><span>{fmt(subtotal + shipping + tax)}</span></div>
      </div>
      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button style={S.secondaryBtn} onClick={() => setPage("shop")}>← Continue shopping</button>
        <button style={{ ...S.primaryBtn }} onClick={() => setPage("checkout")}>Checkout →</button>
      </div>
    </div>
  );
}

// ─── CHECKOUT PAGE ────────────────────────────────────────────────────────────
function CheckoutPage({ setPage, setToast }) {
  const { cart, dispatch } = useContext(CartContext);
  const [done, setDone] = useState(false);
  const [fields, setFields] = useState({ name: "", email: "", address: "", city: "", zip: "", card: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState({});

  const set = (k, v) => setFields(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!fields.name.trim()) e.name = "Required";
    if (!fields.email.includes("@")) e.email = "Valid email required";
    if (!fields.address.trim()) e.address = "Required";
    if (!fields.city.trim()) e.city = "Required";
    if (fields.zip.length < 5) e.zip = "5-digit ZIP";
    if (fields.card.replace(/\s/g, "").length < 16) e.card = "16-digit card number";
    if (!fields.expiry.match(/\d{2}\/\d{2}/)) e.expiry = "MM/YY format";
    if (fields.cvv.length < 3) e.cvv = "3 digits";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    dispatch({ type: "CLEAR" });
    setDone(true);
  };

  if (done) return (
    <div style={S.success}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Order placed!</div>
      <div style={{ color: "#6B6963", marginBottom: 24 }}>Thanks {fields.name}! Your order is confirmed. A receipt will be sent to {fields.email}.</div>
      <button style={S.primaryBtn} onClick={() => setPage("shop")}>Back to shop</button>
    </div>
  );

  if (cart.length === 0) return (
    <div style={S.empty}>
      <div style={S.emptyIcon}>🛒</div>
      <div>Nothing to check out</div>
      <button style={{ ...S.secondaryBtn, marginTop: 16, display: "inline-block" }} onClick={() => setPage("shop")}>Go shopping</button>
    </div>
  );

  const subtotal = total(cart);
  const shipping = subtotal >= 100 ? 0 : 8.99;
  const orderTotal = subtotal + shipping + subtotal * 0.08;

  const inp = (key, placeholder, extra = {}) => (
    <div style={S.formGroup}>
      <label style={S.label}>{key}</label>
      <input
        style={{ ...S.input, borderColor: errors[key] ? "#C0392B" : "#D5D3CE" }}
        placeholder={placeholder}
        value={fields[key]}
        onChange={e => { set(key, e.target.value); setErrors(er => ({ ...er, [key]: null })); }}
        {...extra}
      />
      {errors[key] && <div style={{ color: "#C0392B", fontSize: 12, marginTop: 4 }}>{errors[key]}</div>}
    </div>
  );

  return (
    <div style={S.form}>
      <div style={S.pageTitle}>Checkout</div>
      <div style={{ background: "#F0EEE9", borderRadius: 10, padding: "12px 16px", marginBottom: 24, fontSize: 14 }}>
        {cart.map(i => <span key={i.id}>{i.image} {i.name} ×{i.qty}{"  "}</span>)}
        <strong style={{ float: "right" }}>{fmt(orderTotal)}</strong>
      </div>

      <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Shipping info</div>
      {inp("name", "Full name")}
      {inp("email", "Email address", { type: "email" })}
      {inp("address", "Street address")}
      <div style={S.row2}>
        {inp("city", "City")}
        {inp("zip", "ZIP code", { maxLength: 5 })}
      </div>

      <div style={{ fontWeight: 700, marginBottom: 16, marginTop: 8, fontSize: 16 }}>Payment</div>
      {inp("card", "1234 5678 9012 3456", { maxLength: 19 })}
      <div style={S.row2}>
        {inp("expiry", "MM/YY", { maxLength: 5 })}
        {inp("cvv", "CVV", { maxLength: 4 })}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <button style={S.secondaryBtn} onClick={() => setPage("cart")}>← Back</button>
        <button style={S.primaryBtn} onClick={handleSubmit}>Place order — {fmt(orderTotal)}</button>
      </div>
    </div>
  );
}

// ─── ADMIN PAGE ───────────────────────────────────────────────────────────────
function AdminPage({ products, setProducts }) {
  const [editId, setEditId] = useState(null);
  const [editField, setEditField] = useState({});
  const [newProduct, setNewProduct] = useState(null);

  const totalRevenue = products.reduce((s, p) => s + p.price * (20 - p.stock), 0);
  const lowStock = products.filter(p => p.stock <= 5).length;

  const startEdit = (p) => { setEditId(p.id); setEditField({ ...p }); };
  const saveEdit = () => {
    setProducts(ps => ps.map(p => p.id === editId ? { ...editField, price: +editField.price, stock: +editField.stock } : p));
    setEditId(null);
  };

  const addProduct = () => {
    const id = Math.max(...products.map(p => p.id)) + 1;
    setProducts(ps => [...ps, { ...newProduct, id, price: +newProduct.price, stock: +newProduct.stock, image: "📦" }]);
    setNewProduct(null);
  };

  const deleteProduct = (id) => setProducts(ps => ps.filter(p => p.id !== id));

  return (
    <div>
      <div style={S.pageTitle}>Admin Dashboard</div>

      <div style={S.adminGrid}>
        <div style={S.statCard("#1A1A18")}><div style={S.statNum}>{products.length}</div><div style={S.statLabel}>Total products</div></div>
        <div style={S.statCard("#E8632B")}><div style={S.statNum}>{lowStock}</div><div style={S.statLabel}>Low stock alerts</div></div>
        <div style={S.statCard("#2E7D32")}><div style={S.statNum}>${(totalRevenue / 1000).toFixed(1)}k</div><div style={S.statLabel}>Est. revenue</div></div>
        <div style={S.statCard("#1565C0")}><div style={S.statNum}>{products.reduce((s, p) => s + p.stock, 0)}</div><div style={S.statLabel}>Units in stock</div></div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Product inventory</div>
        <button style={{ ...S.secondaryBtn, fontSize: 13 }} onClick={() => setNewProduct({ name: "", category: "Tech", price: "", stock: "", description: "" })}>+ Add product</button>
      </div>

      {newProduct && (
        <div style={{ background: "#fff", border: "1px solid #D5D3CE", borderRadius: 10, padding: 16, marginBottom: 16, display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 8, alignItems: "end" }}>
          <input style={S.input} placeholder="Product name" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} />
          <input style={S.input} placeholder="Category" value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))} />
          <input style={S.input} placeholder="Price" type="number" value={newProduct.price} onChange={e => setNewProduct(p => ({ ...p, price: e.target.value }))} />
          <input style={S.input} placeholder="Stock" type="number" value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: e.target.value }))} />
          <input style={{ ...S.input, gridColumn: "1 / -1" }} placeholder="Description" value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} />
          <button style={S.primaryBtn} onClick={addProduct}>Add</button>
          <button style={{ ...S.secondaryBtn, gridColumn: "2 / -1" }} onClick={() => setNewProduct(null)}>Cancel</button>
        </div>
      )}

      <table style={S.table}>
        <thead>
          <tr>
            {["", "Name", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td style={S.td}>{p.image}</td>
              <td style={S.td}>
                {editId === p.id
                  ? <input style={{ ...S.input, padding: "6px 10px" }} value={editField.name} onChange={e => setEditField(f => ({ ...f, name: e.target.value }))} />
                  : <strong>{p.name}</strong>}
              </td>
              <td style={S.td}>
                {editId === p.id
                  ? <input style={{ ...S.input, padding: "6px 10px" }} value={editField.category} onChange={e => setEditField(f => ({ ...f, category: e.target.value }))} />
                  : p.category}
              </td>
              <td style={S.td}>
                {editId === p.id
                  ? <input style={{ ...S.input, padding: "6px 10px", width: 70 }} type="number" value={editField.price} onChange={e => setEditField(f => ({ ...f, price: e.target.value }))} />
                  : fmt(p.price)}
              </td>
              <td style={S.td}>
                {editId === p.id
                  ? <input style={{ ...S.input, padding: "6px 10px", width: 60 }} type="number" value={editField.stock} onChange={e => setEditField(f => ({ ...f, stock: e.target.value }))} />
                  : p.stock}
              </td>
              <td style={S.td}>
                <span style={S.badge(p.stock === 0 ? "#C0392B" : p.stock <= 5 ? "#E8632B" : "#2E7D32")}>
                  {p.stock === 0 ? "Out of stock" : p.stock <= 5 ? "Low stock" : "In stock"}
                </span>
              </td>
              <td style={S.td}>
                {editId === p.id
                  ? <><button style={{ ...S.secondaryBtn, padding: "5px 12px", fontSize: 12, marginRight: 6 }} onClick={saveEdit}>Save</button><button style={{ ...S.secondaryBtn, padding: "5px 12px", fontSize: 12 }} onClick={() => setEditId(null)}>Cancel</button></>
                  : <><button style={{ ...S.secondaryBtn, padding: "5px 12px", fontSize: 12, marginRight: 6 }} onClick={() => startEdit(p)}>Edit</button><button style={{ ...S.secondaryBtn, padding: "5px 12px", fontSize: 12, color: "#C0392B", borderColor: "#C0392B" }} onClick={() => deleteProduct(p.id)}>Delete</button></>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("shop");
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [toast, setToast] = useState("");

  // Intercept ADD to show toast
  const dispatchWithToast = (action) => {
    if (action.type === "ADD") {
      setToast(`${action.product.name} added to cart`);
      setTimeout(() => setToast(""), 2000);
    }
    dispatch(action);
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const navItems = [
    { key: "shop", label: "Shop" },
    { key: "cart", label: "Cart" },
    { key: "checkout", label: "Checkout" },
    { key: "admin", label: "Admin" },
  ];

  return (
    <CartContext.Provider value={{ cart, dispatch: dispatchWithToast }}>
      <div style={S.app}>
        <nav style={S.nav}>
          <div style={S.navBrand} onClick={() => setPage("shop")}>Forma Store</div>
          <div style={S.navRight}>
            {navItems.map(n => (
              <button key={n.key} style={S.navBtn(page === n.key)} onClick={() => setPage(n.key)}>
                {n.label}
                {n.key === "cart" && cartCount > 0 && <span style={S.cartBadge}>{cartCount}</span>}
              </button>
            ))}
          </div>
        </nav>
        <main style={S.main}>
          {page === "shop" && <ProductsPage products={products} />}
          {page === "cart" && <CartPage setPage={setPage} />}
          {page === "checkout" && <CheckoutPage setPage={setPage} setToast={setToast} />}
          {page === "admin" && <AdminPage products={products} setProducts={setProducts} />}
        </main>
        <Toast msg={toast} />
      </div>
    </CartContext.Provider>
  );
}
