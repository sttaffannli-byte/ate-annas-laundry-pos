import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, ShoppingBag, Users, Package, BarChart3, Settings,
  Plus, Search, CreditCard, Printer, Save, Truck, Clock3, Shirt,
  Wallet, LogOut, Bell, ChevronRight, CheckCircle2, CircleDollarSign,
  CalendarDays, Boxes, UserRoundCog, ReceiptText, Menu, X
} from 'lucide-react';
import './styles.css';

const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

const defaultServices = [
  { id: 1, name: 'Wash • Dry • Fold', unit: 'kg', price: 85, icon: '🧺' },
  { id: 2, name: 'Wash Only', unit: 'kg', price: 55, icon: '💧' },
  { id: 3, name: 'Dry Clean', unit: 'pc', price: 180, icon: '👔' },
  { id: 4, name: 'Comforter', unit: 'pc', price: 280, icon: '🛏️' },
  { id: 5, name: 'Curtain', unit: 'kg', price: 120, icon: '🪟' },
  { id: 6, name: 'Shoes', unit: 'pair', price: 250, icon: '👟' },
  { id: 7, name: 'Ironing', unit: 'pc', price: 25, icon: '👕' },
  { id: 8, name: 'Express Service', unit: 'order', price: 150, icon: '⚡' }
];

const seedOrders = [
  { id: 'L-1001', customer: 'Maria Santos', phone: '09171234567', status: 'Washing', total: 340, paid: 340, due: 'Today 3:00 PM', items: 4 },
  { id: 'L-1002', customer: 'Jose Cruz', phone: '09981234567', status: 'Ready', total: 560, paid: 300, due: 'Today 5:30 PM', items: 2 },
  { id: 'L-1003', customer: 'Anne Reyes', phone: '09221234567', status: 'Drying', total: 255, paid: 255, due: 'Tomorrow 10:00 AM', items: 3 }
];

const statusColors = {
  Received: 'blue', Washing: 'cyan', Drying: 'orange', Folding: 'purple', Ready: 'green', Released: 'gray', Cancelled: 'red'
};

function App() {
  const [active, setActive] = useState('POS');
  const [drawer, setDrawer] = useState(false);
  const [orders, setOrders] = useState(() => JSON.parse(localStorage.getItem('laundry_orders') || 'null') || seedOrders);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [payment, setPayment] = useState('Cash');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => localStorage.setItem('laundry_orders', JSON.stringify(orders)), [orders]);
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2400); return () => clearTimeout(t); } }, [toast]);

  const subtotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const total = subtotal;
  const todaySales = orders.reduce((s, o) => s + Number(o.paid || 0), 0);
  const pending = orders.filter(o => o.status !== 'Released').length;
  const ready = orders.filter(o => o.status === 'Ready').length;

  function addService(service) {
    setCart(c => {
      const found = c.find(x => x.id === service.id);
      return found ? c.map(x => x.id === service.id ? { ...x, qty: x.qty + 1 } : x) : [...c, { ...service, qty: 1 }];
    });
  }
  function updateQty(id, delta) {
    setCart(c => c.map(x => x.id === id ? { ...x, qty: Math.max(0, x.qty + delta) } : x).filter(x => x.qty > 0));
  }
  function saveOrder() {
    if (!customer.name || !customer.phone || !cart.length) return setToast('Complete customer and order details.');
    const order = {
      id: `L-${1000 + orders.length + 1}`,
      customer: customer.name,
      phone: customer.phone,
      status: 'Received', total, paid: total, payment,
      due: 'Today 6:00 PM', items: cart.reduce((s, x) => s + x.qty, 0)
    };
    setOrders([order, ...orders]);
    setCart([]); setCustomer({ name: '', phone: '' });
    setToast(`Order ${order.id} saved.`);
  }

  const nav = [
    ['Dashboard', LayoutDashboard], ['POS', ShoppingBag], ['Orders', ReceiptText], ['Customers', Users],
    ['Inventory', Package], ['Reports', BarChart3], ['Staff', UserRoundCog], ['Settings', Settings]
  ];

  const filteredOrders = orders.filter(o => `${o.id} ${o.customer} ${o.phone}`.toLowerCase().includes(search.toLowerCase()));

  return <div className="app-shell">
    <aside className={`sidebar ${drawer ? 'open' : ''}`}>
      <div className="brand"><div className="brand-logo">LP</div><div><b>LaundryPOS</b><span>Pro Cloud</span></div></div>
      <button className="close-drawer" onClick={() => setDrawer(false)}><X /></button>
      <nav>{nav.map(([label, Icon]) => <button key={label} className={active === label ? 'active' : ''} onClick={() => {setActive(label); setDrawer(false)}}><Icon size={22}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><div className="user-mini"><div className="avatar">A</div><div><b>Admin</b><span>Owner</span></div></div><LogOut size={20}/></div>
    </aside>

    <main>
      <header className="topbar">
        <button className="menu-btn" onClick={() => setDrawer(true)}><Menu/></button>
        <div><h1>{active}</h1><p>Tuesday, July 21, 2026</p></div>
        <div className="top-actions"><button><Bell/></button><div className="online"><span></span>Online</div></div>
      </header>

      {active === 'Dashboard' && <Dashboard sales={todaySales} pending={pending} ready={ready} orders={orders} />}
      {active === 'POS' && <POS services={defaultServices} cart={cart} addService={addService} updateQty={updateQty} customer={customer} setCustomer={setCustomer} subtotal={subtotal} total={total} payment={payment} setPayment={setPayment} saveOrder={saveOrder} />}
      {active === 'Orders' && <Orders orders={filteredOrders} search={search} setSearch={setSearch} setOrders={setOrders} />}
      {active === 'Customers' && <Customers orders={orders} />}
      {active === 'Inventory' && <Inventory />}
      {active === 'Reports' && <Reports orders={orders} />}
      {active === 'Staff' && <Staff />}
      {active === 'Settings' && <SettingsPage />}
    </main>
    {drawer && <div className="overlay" onClick={() => setDrawer(false)} />}
    {toast && <div className="toast"><CheckCircle2 size={20}/>{toast}</div>}
  </div>;
}

function Stat({icon: Icon, label, value, sub}) { return <div className="stat-card"><div className="stat-icon"><Icon/></div><div><span>{label}</span><strong>{value}</strong><small>{sub}</small></div></div> }

function Dashboard({sales,pending,ready,orders}) {
  return <section className="page">
    <div className="stats-grid">
      <Stat icon={CircleDollarSign} label="Today's Sales" value={money.format(sales)} sub="Live sales total"/>
      <Stat icon={ShoppingBag} label="Active Orders" value={pending} sub="All open orders"/>
      <Stat icon={CheckCircle2} label="Ready for Pickup" value={ready} sub="Notify customers"/>
      <Stat icon={Users} label="Customers" value={new Set(orders.map(o=>o.phone)).size} sub="Registered today"/>
    </div>
    <div className="dashboard-grid">
      <div className="panel"><div className="panel-head"><h3>Order Workflow</h3><button>View all <ChevronRight size={16}/></button></div><div className="workflow">
        {['Received','Washing','Drying','Folding','Ready'].map(s => <div key={s}><span className={`dot ${statusColors[s]}`}></span><b>{orders.filter(o=>o.status===s).length}</b><small>{s}</small></div>)}
      </div></div>
      <div className="panel"><div className="panel-head"><h3>Today's Pickup</h3><CalendarDays/></div>{orders.slice(0,4).map(o=><div className="pickup-row" key={o.id}><div><b>{o.customer}</b><span>{o.id} • {o.due}</span></div><span className={`status ${statusColors[o.status]}`}>{o.status}</span></div>)}</div>
    </div>
  </section>
}

function POS({services,cart,addService,updateQty,customer,setCustomer,subtotal,total,payment,setPayment,saveOrder}) {
  return <section className="page pos-layout">
    <div className="pos-left">
      <div className="panel customer-card"><div className="panel-head"><h3>Customer</h3><button className="soft-btn"><Search size={18}/>Search</button></div><div className="form-row"><label>Customer name<input value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} placeholder="Enter customer name"/></label><label>Mobile number<input value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} placeholder="09XXXXXXXXX" inputMode="numeric"/></label></div></div>
      <div className="panel"><div className="panel-head"><h3>Select Service</h3><span>Tap to add</span></div><div className="services-grid">{services.map(s=><button key={s.id} className="service-card" onClick={()=>addService(s)}><span>{s.icon}</span><b>{s.name}</b><small>{money.format(s.price)} / {s.unit}</small></button>)}</div></div>
    </div>
    <div className="cart-panel panel"><div className="panel-head"><h3>Current Order</h3><span>{cart.length} services</span></div>
      <div className="cart-list">{!cart.length ? <div className="empty"><Shirt size={48}/><b>No service selected</b><span>Tap a service to start</span></div> : cart.map(x=><div className="cart-item" key={x.id}><div><b>{x.name}</b><span>{money.format(x.price)} / {x.unit}</span></div><div className="qty"><button onClick={()=>updateQty(x.id,-1)}>-</button><strong>{x.qty}</strong><button onClick={()=>updateQty(x.id,1)}>+</button></div><b>{money.format(x.price*x.qty)}</b></div>)}</div>
      <div className="summary"><div><span>Subtotal</span><b>{money.format(subtotal)}</b></div><div><span>Discount</span><b>{money.format(0)}</b></div><div className="grand"><span>Total</span><b>{money.format(total)}</b></div></div>
      <div className="payments">{['Cash','GCash','Maya','Bank'].map(p=><button key={p} className={payment===p?'selected':''} onClick={()=>setPayment(p)}><Wallet size={18}/>{p}</button>)}</div>
      <div className="checkout-actions"><button className="secondary"><Printer/>Print</button><button className="primary" onClick={saveOrder}><Save/>Save & Pay</button></div>
    </div>
  </section>
}

function Orders({orders,search,setSearch,setOrders}) {
  function nextStatus(id){const seq=['Received','Washing','Drying','Folding','Ready','Released']; setOrders(list=>list.map(o=>{if(o.id!==id)return o; const i=seq.indexOf(o.status); return {...o,status:seq[Math.min(i+1,seq.length-1)]}}));}
  return <section className="page"><div className="panel"><div className="panel-head order-head"><h3>All Laundry Orders</h3><div className="searchbox"><Search size={18}/><input placeholder="Search receipt, customer, phone" value={search} onChange={e=>setSearch(e.target.value)}/></div></div><div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Due</th><th>Total</th><th>Balance</th><th>Action</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><b>{o.id}</b><span>{o.items} items</span></td><td><b>{o.customer}</b><span>{o.phone}</span></td><td><span className={`status ${statusColors[o.status]}`}>{o.status}</span></td><td>{o.due}</td><td>{money.format(o.total)}</td><td>{money.format(o.total-o.paid)}</td><td><button className="soft-btn" onClick={()=>nextStatus(o.id)}>Next status</button></td></tr>)}</tbody></table></div></div></section>
}

function Customers({orders}) { const map=[...new Map(orders.map(o=>[o.phone,o])).values()]; return <section className="page"><div className="panel"><div className="panel-head"><h3>Customer Directory</h3><button className="primary small"><Plus/>New Customer</button></div><div className="card-grid">{map.map(c=><div className="customer-tile" key={c.phone}><div className="avatar big">{c.customer[0]}</div><div><b>{c.customer}</b><span>{c.phone}</span><small>{orders.filter(o=>o.phone===c.phone).length} orders</small></div></div>)}</div></div></section> }

function Inventory(){ const items=[['Detergent',72,'kg'],['Fabric Conditioner',35,'L'],['Bleach',18,'L'],['Plastic Bags',240,'pcs'],['Tags',420,'pcs'],['Receipt Paper',16,'rolls']]; return <section className="page"><div className="panel"><div className="panel-head"><h3>Inventory Stock</h3><button className="primary small"><Plus/>Stock In</button></div><div className="card-grid">{items.map(([n,q,u])=><div className="inventory-card" key={n}><Boxes/><div><b>{n}</b><strong>{q} {u}</strong><span className={q<20?'low':''}>{q<20?'Low stock':'Stock healthy'}</span></div></div>)}</div></div></section> }

function Reports({orders}){ const sales=orders.reduce((s,o)=>s+o.paid,0); return <section className="page"><div className="stats-grid"><Stat icon={CircleDollarSign} label="Gross Sales" value={money.format(sales)} sub="Current data"/><Stat icon={ReceiptText} label="Transactions" value={orders.length} sub="All orders"/><Stat icon={CreditCard} label="Receivables" value={money.format(orders.reduce((s,o)=>s+o.total-o.paid,0))} sub="Unpaid balance"/><Stat icon={BarChart3} label="Average Order" value={money.format(orders.length?sales/orders.length:0)} sub="Per receipt"/></div><div className="panel chart"><h3>Sales Overview</h3><div className="bars">{[55,78,48,90,66,82,73].map((h,i)=><div key={i}><span style={{height:`${h}%`}}></span><small>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i]}</small></div>)}</div></div></section> }

function Staff(){ return <section className="page"><div className="panel"><div className="panel-head"><h3>Staff & Roles</h3><button className="primary small"><Plus/>Add Staff</button></div><div className="card-grid">{[['Admin','Owner'],['Cashier 1','Cashier'],['Laundry Staff','Operator'],['Rider 1','Delivery']].map(([n,r])=><div className="customer-tile" key={n}><div className="avatar big">{n[0]}</div><div><b>{n}</b><span>{r}</span><small>Active</small></div></div>)}</div></div></section> }

function SettingsPage(){ return <section className="page"><div className="panel settings"><h3>Store Settings</h3><label>Shop Name<input defaultValue="LaundryPOS Pro"/></label><label>Branch Address<input defaultValue="Buting, Pasig City"/></label><label>Contact Number<input defaultValue="0917 000 0000"/></label><label>Receipt Footer<textarea defaultValue="Thank you for choosing us!"/></label><button className="primary"><Save/>Save Settings</button></div></section> }

createRoot(document.getElementById('root')).render(<App />);
