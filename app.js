(() => {
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const money=n=>new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP"}).format(Number(n||0));
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const uid=p=>p+"-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7);
const day=d=>new Date(d).toISOString().slice(0,10);
const month=d=>new Date(d).toISOString().slice(0,7);
const KEY="ate-annas-laundry-pos-v2-data";
const nowLocal=()=>{const d=new Date(),o=d.getTimezoneOffset();return new Date(d-o*60000).toISOString().slice(0,16)};
const plusHours=h=>{const d=new Date();d.setHours(d.getHours()+h);const o=d.getTimezoneOffset();return new Date(d-o*60000).toISOString().slice(0,16)};

const defaults={
 settings:{storeName:"ATE ANNAS LAUNDRY",address:"Buting, Pasig City",contact:"0917-857-5757",footer:"Thank you! Please present this claim stub upon release.",adminPin:"1234",cashierPin:"0000",bookingWhatsapp:"639178575757",bookingArea:"Buting, Pasig City and nearby areas",bookingMinimum:150,bookingAdminKey:""},
 customers:[{id:"c1",name:"Walk-in Customer",contact:"",address:""}],
 services:[
  {id:"s1",name:"Wash, Dry & Fold",type:"kg",rate:45,minimum:4,active:true},
  {id:"s2",name:"Wash Only",type:"kg",rate:30,minimum:4,active:true},
  {id:"s3",name:"Dry Only",type:"kg",rate:25,minimum:4,active:true},
  {id:"s4",name:"Comforter",type:"piece",rate:180,minimum:1,active:true},
  {id:"s5",name:"Bedsheet",type:"piece",rate:70,minimum:1,active:true},
  {id:"s6",name:"Ironing",type:"piece",rate:15,minimum:1,active:true},
  {id:"s7",name:"Pickup / Delivery",type:"flat",rate:50,minimum:1,active:true}
 ],
 orders:[],payments:[],expenses:[],currentUser:null
};
let db=load(),activeUser=null,currentItems=[],openedOrderId=null;
function load(){try{const x=JSON.parse(localStorage.getItem(KEY));return x?{...structuredClone(defaults),...x,settings:{...defaults.settings,...x.settings}}:structuredClone(defaults)}catch{return structuredClone(defaults)}}
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function toast(m){const t=$("#toast");t.textContent=m;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2200)}
function login(){const u=$("#loginUser").value.trim().toLowerCase(),p=$("#loginPin").value;const role=u==="admin"&&p===db.settings.adminPin?"Admin":u==="cashier"&&p===db.settings.cashierPin?"Cashier":null;if(!role)return toast("Invalid username or PIN");activeUser={username:u,role};db.currentUser=activeUser;save();$("#loginView").classList.add("hidden");$("#appView").classList.remove("hidden");navigate("dashboard");$("#currentUser").innerHTML=`<b>${role}</b><br><small>${u}</small>`;applyRole();renderAll()}
function logout(){activeUser=null;db.currentUser=null;save();$("#appView").classList.add("hidden");$("#loginView").classList.remove("hidden")}
function applyRole(){const admin=activeUser?.role==="Admin";$$('[data-page="services"],[data-page="expenses"],[data-page="reports"],[data-page="settings"]').forEach(b=>b.classList.toggle("hidden",!admin))}
function navigate(p){$$(".sidebar nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===p));$$(".page").forEach(x=>x.classList.toggle("active",x.id==="page-"+p));$("#pageTitle").textContent={dashboard:"Dashboard",tracker:"Order Tracker",booking:"Online Booking",new:"New Order",orders:"Orders",customers:"Customers",services:"Services",payments:"Payments",expenses:"Expenses",reports:"Reports",settings:"Settings"}[p];$(".sidebar").classList.remove("open");renderAll()}
function serviceCharge(s,qty){qty=Number(qty);if(s.type==="kg")return Math.max(qty,Number(s.minimum||0))*Number(s.rate);if(s.type==="piece")return Math.max(qty,Number(s.minimum||1))*Number(s.rate);return Number(s.rate)}
function orderTotals(){const subtotal=currentItems.reduce((a,i)=>{const s=db.services.find(x=>x.id===i.serviceId);return a+serviceCharge(s,i.qty)},0),discount=Math.max(0,Number($("#orderDiscount").value||0)),fee=Math.max(0,Number($("#deliveryFee").value||0));return{subtotal,discount,fee,total:Math.max(0,subtotal-discount+fee)}}
function renderServiceButtons(){$("#serviceButtons").innerHTML=db.services.filter(s=>s.active).map(s=>`<button class="service-btn" data-service="${s.id}"><b>${esc(s.name)}</b><span>${s.type==="kg"?"Per kilo":s.type==="piece"?"Per piece":"Flat rate"}</span><strong>${money(s.rate)}</strong></button>`).join("");$$("[data-service]").forEach(b=>b.onclick=()=>openServiceItem(b.dataset.service))}
function openServiceItem(id){const s=db.services.find(x=>x.id===id);$("#serviceItemId").value=id;$("#serviceItemTitle").textContent=s.name;$("#qtyLabel").classList.toggle("hidden",s.type==="flat");$("#serviceQty").value=s.type==="kg"?s.minimum||1:1;$("#serviceRemarks").value="";$("#serviceItemDialog").showModal()}
function addServiceItem(e){e.preventDefault();const id=$("#serviceItemId").value,s=db.services.find(x=>x.id===id),qty=s.type==="flat"?1:Number($("#serviceQty").value||0);if(qty<=0)return toast("Enter valid quantity");currentItems.push({id:uid("item"),serviceId:id,qty,remarks:$("#serviceRemarks").value.trim()});$("#serviceItemDialog").close();renderOrderItems()}
function renderOrderItems(){const t=orderTotals();$("#orderItems").innerHTML=currentItems.length?currentItems.map(i=>{const s=db.services.find(x=>x.id===i.serviceId),amount=serviceCharge(s,i.qty);return`<div class="order-item"><div><b>${esc(s.name)}</b><br><small>${s.type==="flat"?"Flat rate":i.qty+" "+(s.type==="kg"?"kg":"pc")} ${i.remarks?"· "+esc(i.remarks):""}</small></div><b>${money(amount)}</b><button data-remove-item="${i.id}">×</button></div>`}).join(""):`<div class="empty">Tap a service to add it to the order.</div>`;$("#orderSubtotal").textContent=money(t.subtotal);$("#orderTotal").textContent=money(t.total);$$("[data-remove-item]").forEach(b=>b.onclick=()=>{currentItems=currentItems.filter(i=>i.id!==b.dataset.removeItem);renderOrderItems()})}
function clearOrder(){currentItems=[];$("#orderCustomer").value="c1";$("#orderContact").value="";$("#trackerSearch").oninput=renderTracker;$("#trackerRefreshBtn").onclick=renderTracker;$("#receivedDate").value=nowLocal();$("#dueDate").value=plusHours(24);$("#deliveryType").value="Walk-in";$("#deliveryAddress").value="";$("#orderNotes").value="";$("#orderPriority").value="Normal";$("#orderStatus").value="Received";$("#orderDiscount").value=0;$("#deliveryFee").value=0;renderOrderItems()}
function saveOrder(){const cid=$("#orderCustomer").value,c=db.customers.find(x=>x.id===cid),t=orderTotals();if(!c)return toast("Select a customer");if(!currentItems.length)return toast("Add at least one service");if($("#deliveryType").value!=="Walk-in"&&!$("#deliveryAddress").value.trim())return toast("Address is required");const id=uid("ord"),code="LA-"+new Date().toISOString().replace(/\D/g,"").slice(2,14);db.orders.unshift({id,code,customerId:cid,contact:c.contact,received:new Date($("#receivedDate").value).toISOString(),due:new Date($("#dueDate").value).toISOString(),deliveryType:$("#deliveryType").value,address:$("#deliveryAddress").value.trim(),notes:$("#orderNotes").value.trim(),priority:$("#orderPriority").value,status:$("#orderStatus").value,items:structuredClone(currentItems),subtotal:t.subtotal,discount:t.discount,deliveryFee:t.fee,total:t.total,createdBy:activeUser.username,createdAt:new Date().toISOString()});save();clearOrder();renderAll();toast("Laundry order saved")}
function customerStats(id){const orders=db.orders.filter(o=>o.customerId===id);return{count:orders.length,total:orders.reduce((a,o)=>a+o.total,0)}}
function renderCustomers(){const q=$("#customersSearch").value.toLowerCase();$("#customersTable").innerHTML=db.customers.filter(c=>c.id!=="c1"&&JSON.stringify(c).toLowerCase().includes(q)).map(c=>{const st=customerStats(c.id);return`<tr><td><b>${esc(c.name)}</b></td><td>${esc(c.contact)}</td><td>${esc(c.address)}</td><td>${st.count}</td><td>${money(st.total)}</td><td><button data-edit-customer="${c.id}">Edit</button></td></tr>`}).join("");$("#orderCustomer").innerHTML=db.customers.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join("");const selected=db.customers.find(c=>c.id===$("#orderCustomer").value)||db.customers[0];$("#orderContact").value=selected?.contact||"";$$("[data-edit-customer]").forEach(b=>b.onclick=()=>openCustomer(db.customers.find(c=>c.id===b.dataset.editCustomer)))}
function openCustomer(c=null){$("#customerDialogTitle").textContent=c?"Edit Customer":"Add Customer";$("#customerId").value=c?.id||"";$("#cName").value=c?.name||"";$("#cContact").value=c?.contact||"";$("#cAddress").value=c?.address||"";$("#customerDialog").showModal()}
function saveCustomer(e){e.preventDefault();const id=$("#customerId").value||uid("c"),c={id,name:$("#cName").value.trim(),contact:$("#cContact").value.trim(),address:$("#cAddress").value.trim()};const ix=db.customers.findIndex(x=>x.id===id);if(ix>=0)db.customers[ix]=c;else db.customers.push(c);save();$("#customerDialog").close();renderAll();$("#orderCustomer").value=id;$("#orderContact").value=c.contact;toast("Customer saved")}
function renderServices(){const q=$("#servicesSearch").value.toLowerCase();$("#servicesTable").innerHTML=db.services.filter(s=>JSON.stringify(s).toLowerCase().includes(q)).map(s=>`<tr><td><b>${esc(s.name)}</b></td><td>${s.type==="kg"?"Per kilo":s.type==="piece"?"Per piece":"Flat rate"}</td><td>${money(s.rate)}</td><td>${s.minimum}</td><td>${s.active?"Yes":"No"}</td><td><button data-edit-service="${s.id}">Edit</button></td></tr>`).join("");$$("[data-edit-service]").forEach(b=>b.onclick=()=>openService(db.services.find(s=>s.id===b.dataset.editService)))}
function openService(s=null){$("#serviceDialogTitle").textContent=s?"Edit Service":"Add Service";$("#serviceId").value=s?.id||"";$("#sName").value=s?.name||"";$("#sType").value=s?.type||"kg";$("#sRate").value=s?.rate??"";$("#sMinimum").value=s?.minimum??0;$("#sActive").checked=s?.active??true;$("#serviceDialog").showModal()}
function saveService(e){e.preventDefault();const id=$("#serviceId").value||uid("s"),s={id,name:$("#sName").value.trim(),type:$("#sType").value,rate:Number($("#sRate").value),minimum:Number($("#sMinimum").value||0),active:$("#sActive").checked};const ix=db.services.findIndex(x=>x.id===id);if(ix>=0)db.services[ix]=s;else db.services.push(s);save();$("#serviceDialog").close();renderAll();toast("Service saved")}
function paidFor(orderId){return db.payments.filter(p=>p.orderId===orderId).reduce((a,p)=>a+p.amount,0)}
function orderBadge(o){const overdue=new Date(o.due)<new Date()&&!["Ready","Released"].includes(o.status);if(overdue)return'<span class="badge overdue">OVERDUE</span>';if(o.status==="Ready")return'<span class="badge ready">READY</span>';if(o.status==="Released")return'<span class="badge">RELEASED</span>';return`<span class="badge process">${esc(o.status)}</span>`}
function renderOrders(){const q=$("#ordersSearch").value.toLowerCase(),f=$("#ordersStatusFilter").value,now=new Date();$("#countReceived").textContent=db.orders.filter(o=>o.status==="Received").length;$("#countProcess").textContent=db.orders.filter(o=>["Washing","Drying","Folding"].includes(o.status)).length;$("#countReady").textContent=db.orders.filter(o=>o.status==="Ready").length;$("#countOverdue").textContent=db.orders.filter(o=>new Date(o.due)<now&&!["Ready","Released"].includes(o.status)).length;$("#ordersTable").innerHTML=db.orders.filter(o=>(!f||o.status===f)&&JSON.stringify(o).toLowerCase().includes(q)).map(o=>{const c=db.customers.find(x=>x.id===o.customerId),bal=Math.max(0,o.total-paidFor(o.id));return`<tr><td><b>${esc(o.code)}</b><br><small>${esc(o.deliveryType)}</small></td><td>${esc(c?.name||"Unknown")}<br><small>${esc(o.contact)}</small></td><td>${new Date(o.received).toLocaleString()}</td><td>${new Date(o.due).toLocaleString()}</td><td>${orderBadge(o)}</td><td>${money(o.total)}</td><td>${money(bal)}</td><td><button data-view-order="${o.id}">View</button></td></tr>`}).join("");$$("[data-view-order]").forEach(b=>b.onclick=()=>showOrder(b.dataset.viewOrder))}
function showOrder(id){openedOrderId=id;const o=db.orders.find(x=>x.id===id),c=db.customers.find(x=>x.id===o.customerId),paid=paidFor(id),bal=Math.max(0,o.total-paid);$("#orderDetails").innerHTML=`<div class="claim"><h2>${esc(db.settings.storeName)}</h2><p>${esc(db.settings.address)}</p><p>${esc(db.settings.contact)}</p><hr><p><b>${esc(o.code)}</b><br>${new Date(o.createdAt).toLocaleString()}</p><hr><p><b>${esc(c?.name||"Unknown")}</b><br>${esc(o.contact)}<br>${esc(o.address||"")}</p><hr>${o.items.map(i=>{const s=db.services.find(x=>x.id===i.serviceId);return`<p style="text-align:left">${esc(s?.name||"Service")} — ${i.qty} ${s?.type==="kg"?"kg":s?.type==="piece"?"pc":""}<span style="float:right">${money(serviceCharge(s,i.qty))}</span></p>`}).join("")}<hr><p style="text-align:left">Subtotal <span style="float:right">${money(o.subtotal)}</span></p><p style="text-align:left">Discount <span style="float:right">-${money(o.discount)}</span></p><p style="text-align:left">Delivery <span style="float:right">${money(o.deliveryFee)}</span></p><p style="text-align:left"><b>TOTAL</b><span style="float:right"><b>${money(o.total)}</b></span></p><p style="text-align:left">Paid <span style="float:right">${money(paid)}</span></p><p style="text-align:left">Balance <span style="float:right">${money(bal)}</span></p><hr><p>Due: ${new Date(o.due).toLocaleString()}<br>Priority: ${esc(o.priority||"Normal")}<br>Status: ${esc(o.status)}</p><hr><p>${esc(db.settings.footer)}</p><label>Status<select id="detailStatus"><option>Received</option><option>Washing</option><option>Drying</option><option>Folding</option><option>Ready</option><option>Released</option></select></label><button id="updateStatusBtn" class="primary full" style="margin-top:10px">Update Status</button></div>`;$("#detailStatus").value=o.status;$("#updateStatusBtn").onclick=()=>{o.status=$("#detailStatus").value;save();renderAll();showOrder(id);toast("Status updated")};$("#orderDialog").showModal()}
function openPayment(){const o=db.orders.find(x=>x.id===openedOrderId),bal=Math.max(0,o.total-paidFor(o.id));if(bal<=0)return toast("Order is fully paid");$("#paymentOrderId").value=o.id;$("#paymentBalance").textContent=money(bal);$("#paymentAmount").value=bal.toFixed(2);$("#paymentReference").value="";$("#paymentDialog").showModal()}
function savePayment(e){e.preventDefault();const oid=$("#paymentOrderId").value,o=db.orders.find(x=>x.id===oid),bal=Math.max(0,o.total-paidFor(oid)),amt=Number($("#paymentAmount").value||0),method=$("#paymentMethod").value,ref=$("#paymentReference").value.trim();if(amt<=0||amt>bal)return toast("Enter valid amount");if(method!=="Cash"&&!ref)return toast("Reference number required");db.payments.unshift({id:uid("pay"),orderId:oid,date:new Date().toISOString(),method,reference:ref,amount:amt,user:activeUser.username});save();$("#paymentDialog").close();renderAll();showOrder(oid);toast("Payment saved")}
function renderPayments(){const td=day(new Date()),today=db.payments.filter(p=>day(p.date)===td);$("#paymentsToday").textContent=money(today.reduce((a,p)=>a+p.amount,0));$("#paymentsBalance").textContent=money(db.orders.reduce((a,o)=>a+Math.max(0,o.total-paidFor(o.id)),0));$("#paymentsCash").textContent=money(today.filter(p=>p.method==="Cash").reduce((a,p)=>a+p.amount,0));$("#paymentsDigital").textContent=money(today.filter(p=>p.method!=="Cash").reduce((a,p)=>a+p.amount,0));$("#paymentsTable").innerHTML=db.payments.map(p=>{const o=db.orders.find(x=>x.id===p.orderId),c=db.customers.find(x=>x.id===o?.customerId);return`<tr><td>${new Date(p.date).toLocaleString()}</td><td>${esc(o?.code||"")}</td><td>${esc(c?.name||"")}</td><td>${esc(p.method)}</td><td>${esc(p.reference||"")}</td><td>${money(p.amount)}</td></tr>`}).join("")}
function renderExpenses(){const q=$("#expensesSearch").value.toLowerCase(),td=day(new Date()),tm=month(new Date());$("#expensesToday").textContent=money(db.expenses.filter(e=>e.date===td).reduce((a,e)=>a+e.amount,0));$("#expensesMonth").textContent=money(db.expenses.filter(e=>e.date.startsWith(tm)).reduce((a,e)=>a+e.amount,0));$("#expensesTable").innerHTML=db.expenses.filter(e=>JSON.stringify(e).toLowerCase().includes(q)).map(e=>`<tr><td>${esc(e.date)}</td><td>${esc(e.category)}</td><td>${esc(e.description)}</td><td>${money(e.amount)}</td><td><button data-del-expense="${e.id}" class="danger">Delete</button></td></tr>`).join("");$$("[data-del-expense]").forEach(b=>b.onclick=()=>{if(confirm("Delete this expense?")){db.expenses=db.expenses.filter(e=>e.id!==b.dataset.delExpense);save();renderAll()}})}
function saveExpense(e){e.preventDefault();db.expenses.unshift({id:uid("exp"),date:$("#expenseDate").value,category:$("#expenseCategory").value,description:$("#expenseDescription").value.trim(),amount:Number($("#expenseAmount").value)});save();$("#expenseDialog").close();renderAll();toast("Expense saved")}
function renderReports(){const td=day(new Date()),orders=db.orders.filter(o=>day(o.createdAt)===td),sales=orders.reduce((a,o)=>a+o.total,0),expenses=db.expenses.filter(e=>e.date===td).reduce((a,e)=>a+e.amount,0);$("#reportSalesToday").textContent=money(sales);$("#reportOrdersToday").textContent=orders.length;$("#reportNetToday").textContent=money(sales-expenses);$("#reportAverage").textContent=money(orders.length?sales/orders.length:0);const statuses={};db.orders.forEach(o=>statuses[o.status]=(statuses[o.status]||0)+1);const max=Math.max(1,...Object.values(statuses));$("#statusBreakdown").innerHTML=Object.entries(statuses).map(([k,v])=>`<div class="bar-row"><span>${esc(k)}</span><div class="bar"><i style="width:${v/max*100}%"></i></div><b>${v}</b></div>`).join("")||"<p>No orders yet.</p>";const services={};db.orders.flatMap(o=>o.items).forEach(i=>{const s=db.services.find(x=>x.id===i.serviceId);services[s?.name||"Service"]=(services[s?.name||"Service"]||0)+Number(i.qty)});const top=Object.entries(services).sort((a,b)=>b[1]-a[1]).slice(0,8),m=Math.max(1,...top.map(x=>x[1]));$("#topServices").innerHTML=top.map(([k,v])=>`<div class="bar-row"><span>${esc(k)}</span><div class="bar"><i style="width:${v/m*100}%"></i></div><b>${v}</b></div>`).join("")||"<p>No services yet.</p>"}
function renderSettings(){const s=db.settings;$("#storeName").value=s.storeName;$("#storeAddress").value=s.address;$("#storeContact").value=s.contact;$("#receiptFooter").value=s.footer;$("#adminPin").value=s.adminPin;$("#cashierPin").value=s.cashierPin}
function saveSettings(){Object.assign(db.settings,{storeName:$("#storeName").value,address:$("#storeAddress").value,contact:$("#storeContact").value,footer:$("#receiptFooter").value});save();toast("Settings saved")}
function savePins(){if($("#adminPin").value.length<4||$("#cashierPin").value.length<4)return toast("PIN must be at least 4 digits");db.settings.adminPin=$("#adminPin").value;db.settings.cashierPin=$("#cashierPin").value;save();toast("PINs updated")}
function backup(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:"application/json"}));a.download=`ate-annas-laundry-backup-${day(new Date())}.json`;a.click();URL.revokeObjectURL(a.href)}
function restore(file){const r=new FileReader();r.onload=()=>{try{db=JSON.parse(r.result);save();renderAll();toast("Backup restored")}catch{toast("Invalid backup file")}};r.readAsText(file)}


function nextStatus(status){
  const flow=["Received","Washing","Drying","Folding","Ready","Released"];
  const i=flow.indexOf(status);
  return i>=0&&i<flow.length-1?flow[i+1]:null;
}
function prevStatus(status){
  const flow=["Received","Washing","Drying","Folding","Ready","Released"];
  const i=flow.indexOf(status);
  return i>0?flow[i-1]:null;
}
function renderTracker(){
  const flow=["Received","Washing","Drying","Folding","Ready","Released"];
  const q=($("#trackerSearch")?.value||"").toLowerCase();
  $("#kanbanBoard").innerHTML=flow.map((status,idx)=>{
    const list=db.orders.filter(o=>o.status===status).filter(o=>{
      const c=db.customers.find(x=>x.id===o.customerId);
      return [o.code,c?.name,o.contact,o.priority].join(" ").toLowerCase().includes(q);
    });
    return `<section class="kanban-column">
      <div class="kanban-head"><b>${esc(status)}</b><span>${list.length}</span></div>
      <div class="kanban-list">${list.length?list.map(o=>{
        const c=db.customers.find(x=>x.id===o.customerId);
        const bal=Math.max(0,o.total-paidFor(o.id));
        const priority=(o.priority||"Normal");
        const cls=priority.toLowerCase();
        const next=nextStatus(o.status),prev=prevStatus(o.status);
        return `<article class="kanban-card ${cls}">
          <div class="code"><span>${esc(o.code)}</span><span class="priority ${cls}">${esc(priority)}</span></div>
          <div class="customer"><b>${esc(c?.name||"Unknown")}</b></div>
          <div class="meta">Due ${new Date(o.due).toLocaleString()}</div>
          <div class="meta">Balance ${money(bal)}</div>
          <div class="progress-strip"><i style="width:${((idx+1)/flow.length)*100}%"></i></div>
          <div class="card-actions">
            <button data-track-view="${o.id}">View</button>
            ${next?`<button class="primary" data-track-next="${o.id}">${esc(next)} →</button>`:"<button disabled>Completed</button>"}
            ${prev?`<button data-track-prev="${o.id}">← Back</button>`:""}
            <button data-track-priority="${o.id}">Priority</button>
          </div>
        </article>`;
      }).join(""):`<div class="empty">No orders</div>`}</div>
    </section>`;
  }).join("");
  $$("[data-track-view]").forEach(b=>b.onclick=()=>showOrder(b.dataset.trackView));
  $$("[data-track-next]").forEach(b=>b.onclick=()=>{const o=db.orders.find(x=>x.id===b.dataset.trackNext);o.status=nextStatus(o.status);save();renderAll();toast("Order moved to "+o.status)});
  $$("[data-track-prev]").forEach(b=>b.onclick=()=>{const o=db.orders.find(x=>x.id===b.dataset.trackPrev);o.status=prevStatus(o.status);save();renderAll();toast("Order moved back to "+o.status)});
  $$("[data-track-priority]").forEach(b=>b.onclick=()=>{const o=db.orders.find(x=>x.id===b.dataset.trackPriority);const order=["Normal","Rush","VIP"];o.priority=order[(order.indexOf(o.priority||"Normal")+1)%order.length];save();renderAll();toast("Priority: "+o.priority)});
}


function renderBookingAdmin(){
  const s=db.settings;
  const link=new URL("/booking.html",location.origin).href;
  $("#publicBookingLink").value=link;
  $("#bookingWhatsapp").value=s.bookingWhatsapp||"";
  $("#bookingArea").value=s.bookingArea||"";
  $("#bookingMinimum").value=Number(s.bookingMinimum||0);
  $("#bookingAdminKey").value=s.bookingAdminKey||"";

  $("#copyBookingLinkBtn").onclick=async()=>{
    try{await navigator.clipboard.writeText(link);toast("Booking link copied")}
    catch{$("#publicBookingLink").select();document.execCommand("copy");toast("Booking link copied")}
  };
  $("#openBookingPageBtn").onclick=()=>window.open(link,"_blank");
  $("#shareBookingBtn").onclick=async()=>{
    if(navigator.share){
      await navigator.share({title:"ATE ANNAS Laundry Pickup & Delivery",text:"Book your laundry pickup or delivery online.",url:link});
    }else{
      try{await navigator.clipboard.writeText(link);toast("Booking link copied")}
      catch{toast("Copy the booking link manually")}
    }
  };
}
function saveBookingSettings(){
  const number=$("#bookingWhatsapp").value.replace(/\D/g,"");
  if(number.length<10)return toast("Enter a valid WhatsApp number");
  db.settings.bookingWhatsapp=number;
  db.settings.bookingArea=$("#bookingArea").value.trim();
  db.settings.bookingMinimum=Math.max(0,Number($("#bookingMinimum").value||0));
  db.settings.bookingAdminKey=$("#bookingAdminKey").value.trim();
  save();
  renderBookingAdmin();
  toast("Online booking settings saved");
}
function onlineBadge(status){
  const cls=status==="Received"?"online-new":status==="Imported"?"online-imported":"online-cancelled";
  return `<span class="badge ${cls}">${esc(status)}</span>`;
}
function findServiceForBooking(b){
  const exact=db.services.find(s=>s.active&&s.name.toLowerCase()===String(b.service_name||"").toLowerCase());
  return exact||db.services.find(s=>s.active)||null;
}
function importOnlineBooking(b){
  if(db.orders.some(o=>o.onlineBookingId===b.id))return false;
  let customer=db.customers.find(c=>c.contact===b.mobile);
  if(!customer){
    customer={id:uid("c"),name:b.customer_name,contact:b.mobile,address:b.address};
    db.customers.unshift(customer);
  }
  const service=findServiceForBooking(b);
  if(!service)throw new Error("No active service configured");
  const qty=Math.max(Number(b.quantity||1),Number(service.minimum||0));
  const subtotal=serviceCharge(service,qty);
  const due=new Date(`${b.preferred_date}T${String(b.preferred_time||"08:00").slice(0,5)}:00`);
  if(Number.isNaN(due.getTime()))due.setTime(Date.now()+86400000);
  const order={
    id:uid("ord"),code:"LA-"+new Date().toISOString().replace(/\D/g,"").slice(2,14),
    onlineBookingId:b.id,onlineBookingCode:b.booking_code,customerId:customer.id,contact:b.mobile,
    received:new Date(b.created_at).toISOString(),due:due.toISOString(),deliveryType:b.request_type,
    address:b.address,notes:[b.notes,b.promo_code?`Promo: ${b.promo_code}`:"",`ONLINE BOOKING: ${b.booking_code}`].filter(Boolean).join("\n"),
    priority:"Normal",status:"Received",items:[{serviceId:service.id,qty}],
    subtotal,discount:0,deliveryFee:0,total:subtotal,createdBy:"ONLINE",createdAt:new Date(b.created_at).toISOString()
  };
  db.orders.unshift(order);
  save();
  return true;
}

let realtimeLastBookingId=localStorage.getItem("ate-annas-last-online-booking")||"";
let realtimePopupTimer=null;

function playRealtimeBookingSound(){
  try{
    const AudioCtx=window.AudioContext||window.webkitAudioContext;
    if(!AudioCtx)return;
    const ctx=new AudioCtx();
    const now=ctx.currentTime;
    [660,880,1040].forEach((freq,i)=>{
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      osc.type="sine";
      osc.frequency.value=freq;
      gain.gain.setValueAtTime(0.0001,now+i*.14);
      gain.gain.exponentialRampToValueAtTime(.18,now+i*.14+.02);
      gain.gain.exponentialRampToValueAtTime(.0001,now+i*.14+.12);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now+i*.14);
      osc.stop(now+i*.14+.14);
    });
    setTimeout(()=>ctx.close(),800);
  }catch{}
}
function showRealtimeBookingPopup(booking){
  const popup=$("#realtimeBookingPopup");
  if(!popup)return;
  $("#realtimeBookingText").textContent=`${booking.customer_name} · ${booking.request_type} · ${booking.preferred_date} ${booking.preferred_time}`;
  popup.classList.remove("hidden");
  playRealtimeBookingSound();
  clearTimeout(realtimePopupTimer);
  realtimePopupTimer=setTimeout(()=>popup.classList.add("hidden"),10000);
}
function updateRealtimeIndicator(){
  const el=$("#realtimeStatus");
  if(!el)return;
  const active=navigator.onLine&&!!activeUser;
  el.classList.toggle("active",active);
  el.classList.toggle("paused",!active);
  el.innerHTML=active?'<i></i> REALTIME ON':'<i></i> REALTIME PAUSED';
}

async function bookingApi(path="",options={}){
  const key=db.settings.bookingAdminKey||"";
  const headers={"Content-Type":"application/json",...(options.headers||{})};
  if(key)headers["x-admin-key"]=key;
  const res=await fetch("/api/bookings"+path,{...options,headers});
  const data=await res.json().catch(()=>({}));
  if(!res.ok)throw new Error(data.error||`Booking API error ${res.status}`);
  return data;
}
async function syncOnlineBookings(silent=false){
  if(!navigator.onLine){if(!silent)toast("Internet connection required");return}
  const text=$("#bookingSyncText");
  try{
    text.textContent="Syncing online bookings…";
    const data=await bookingApi("?limit=100");
    const rows=data.bookings||[];
    const newest=rows[0];
    if(newest&&realtimeLastBookingId&&newest.id!==realtimeLastBookingId){
      showRealtimeBookingPopup(newest);
    }
    if(newest){
      realtimeLastBookingId=newest.id;
      localStorage.setItem("ate-annas-last-online-booking",newest.id);
    }
    let imported=0;
    for(const b of rows.filter(x=>x.status==="Received")){
      if(importOnlineBooking(b)){
        imported++;
        await bookingApi("/"+encodeURIComponent(b.id),{method:"PATCH",body:JSON.stringify({status:"Imported"})});
        b.status="Imported";
      }
    }
    $("#onlineReceivedCount").textContent=rows.filter(x=>x.status==="Received").length;
    $("#onlineImportedCount").textContent=rows.filter(x=>x.status==="Imported").length;
    $("#onlineCancelledCount").textContent=rows.filter(x=>x.status==="Cancelled").length;
    $("#onlineBookingsTable").innerHTML=rows.map(b=>`<tr>
      <td><b>${esc(b.booking_code)}</b><br><small>${new Date(b.created_at).toLocaleString()}</small></td>
      <td>${esc(b.customer_name)}<br><small>${esc(b.mobile)}</small></td>
      <td>${esc(b.request_type)}<br><small>${esc(b.address)}</small></td>
      <td>${esc(b.preferred_date)}<br><small>${esc(b.preferred_time)}</small></td>
      <td>${esc(b.service_name)}<br><small>Qty ${esc(String(b.quantity))}</small></td>
      <td>${onlineBadge(b.status)}</td>
      <td><button data-online-cancel="${b.id}" ${b.status==="Cancelled"?"disabled":""}>Cancel</button></td>
    </tr>`).join("")||'<tr><td colspan="7" class="empty">No online bookings yet.</td></tr>';
    $$("[data-online-cancel]").forEach(btn=>btn.onclick=async()=>{
      if(!confirm("Cancel this online booking?"))return;
      try{await bookingApi("/"+encodeURIComponent(btn.dataset.onlineCancel),{method:"PATCH",body:JSON.stringify({status:"Cancelled"})});await syncOnlineBookings()}
      catch(e){toast(e.message)}
    });
    text.textContent=`Realtime sync ${new Date().toLocaleTimeString()}${imported?` · ${imported} automatically received`:""}`;
    if(imported){renderAll();toast(`${imported} online booking received automatically`)}
    else if(!silent)toast("Online bookings synchronized");
  }catch(e){
    text.textContent="Sync failed: "+e.message;
    if(!silent)toast(e.message);
  }
}

function renderDashboard(){
  const now=new Date(), today=day(now);
  const todayOrders=db.orders.filter(o=>day(o.createdAt)===today);
  const todayPayments=db.payments.filter(p=>day(p.date)===today);
  const ready=db.orders.filter(o=>o.status==="Ready");
  const overdue=db.orders.filter(o=>new Date(o.due)<now&&!["Ready","Released"].includes(o.status));

  $("#dashOrdersToday").textContent=todayOrders.length;
  $("#dashSalesToday").textContent=money(todayPayments.reduce((a,p)=>a+p.amount,0));
  $("#dashReady").textContent=ready.length;
  $("#dashOverdue").textContent=overdue.length;

  const statuses=["Received","Washing","Drying","Folding","Ready","Released"];
  $("#statusBoard").innerHTML=statuses.map(status=>{
    const count=db.orders.filter(o=>o.status===status).length;
    return `<button class="status-tile" data-dashboard-status="${status}"><span>${esc(status)}</span><b>${count}</b></button>`;
  }).join("");

  $$("[data-dashboard-status]").forEach(b=>b.onclick=()=>{
    $("#ordersStatusFilter").value=b.dataset.dashboardStatus;
    navigate("orders");
  });

  const due=db.orders
    .filter(o=>o.status!=="Released")
    .sort((a,b)=>new Date(a.due)-new Date(b.due))
    .slice(0,8);

  $("#dueSoonList").innerHTML=due.length?due.map(o=>{
    const c=db.customers.find(x=>x.id===o.customerId);
    const isOverdue=new Date(o.due)<now&&!["Ready","Released"].includes(o.status);
    const cls=isOverdue?"overdue":o.status==="Ready"?"ready":"";
    const label=isOverdue?"OVERDUE":o.status==="Ready"?"READY":"DUE SOON";
    return `<button class="due-item ${cls}" data-view-order="${o.id}">
      <b>${esc(o.code)} · ${esc(c?.name||"Unknown")}</b>
      <div>${label}</div>
      <div class="meta">${new Date(o.due).toLocaleString()} · ${esc(o.status)}</div>
    </button>`;
  }).join(""):`<div class="empty">No active orders.</div>`;

  const recent=db.orders.slice(0,8);
  $("#dashboardRecentOrders").innerHTML=recent.map(o=>{
    const c=db.customers.find(x=>x.id===o.customerId);
    const bal=Math.max(0,o.total-paidFor(o.id));
    return `<tr>
      <td><b>${esc(o.code)}</b></td>
      <td>${esc(c?.name||"Unknown")}</td>
      <td>${new Date(o.due).toLocaleString()}</td>
      <td>${orderBadge(o)}</td>
      <td>${money(bal)}</td>
      <td><button data-view-order="${o.id}">View</button></td>
    </tr>`;
  }).join("");

  $$("[data-view-order]").forEach(b=>b.onclick=()=>showOrder(b.dataset.viewOrder));
}

function renderAll(){renderDashboard();renderTracker();renderBookingAdmin();renderCustomers();renderServiceButtons();renderOrderItems();renderServices();renderOrders();renderPayments();renderExpenses();renderReports();renderSettings()}

let deferredInstallPrompt=null;

function updateNetworkStatus(){
  const online=navigator.onLine;
  const box=$("#networkStatus"), label=$("#networkLabel"), hint=$("#networkHint"), banner=$("#offlineBanner");
  if(!box)return;
  box.classList.toggle("online",online);
  box.classList.toggle("offline",!online);
  label.textContent=online?"ONLINE":"OFFLINE";
  hint.textContent=online?"Connected and syncing":"Saved locally on this tablet";
  banner.classList.toggle("hidden",online);
  document.documentElement.dataset.network=online?"online":"offline";
  if(!online) toast("Offline mode: POS will continue working");
}
function setupNetworkMonitoring(){
  window.addEventListener("online",()=>{updateNetworkStatus();updateRealtimeIndicator();toast("Back online")});
  window.addEventListener("offline",()=>{updateNetworkStatus();updateRealtimeIndicator()});
  updateNetworkStatus();

  window.addEventListener("beforeinstallprompt",e=>{
    e.preventDefault();
    deferredInstallPrompt=e;
    const btn=$("#installAppBtn");
    if(btn)btn.classList.remove("hidden");
  });

  const btn=$("#installAppBtn");
  if(btn)btn.onclick=async()=>{
    if(!deferredInstallPrompt)return toast("Install option is not available yet");
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt=null;
    btn.classList.add("hidden");
  };

  window.addEventListener("appinstalled",()=>{
    toast("Laundry POS installed on this tablet");
    const b=$("#installAppBtn");
    if(b)b.classList.add("hidden");
  });
}

function bind(){
 $("#loginBtn").onclick=login;$("#loginPin").onkeydown=e=>e.key==="Enter"&&login();$("#logoutBtn").onclick=logout;$("#menuBtn").onclick=()=>$(".sidebar").classList.toggle("open");$$(".sidebar nav button").forEach(b=>b.onclick=()=>navigate(b.dataset.page));$("#goNewOrderBtn").onclick=()=>navigate("new");$("#goOrdersBtn").onclick=()=>navigate("orders");
 $("#trackerSearch").oninput=renderTracker;$("#trackerRefreshBtn").onclick=renderTracker;$("#receivedDate").value=nowLocal();$("#dueDate").value=plusHours(24);$("#orderCustomer").onchange=()=>{const c=db.customers.find(x=>x.id===$("#orderCustomer").value);$("#orderContact").value=c?.contact||"";if(!$("#deliveryAddress").value)$("#deliveryAddress").value=c?.address||""};
 $("#quickCustomerBtn").onclick=()=>openCustomer();$("#addCustomerBtn").onclick=()=>openCustomer();$("#saveCustomerDialogBtn").onclick=saveCustomer;$("#customersSearch").oninput=renderCustomers;
 $("#addServiceBtn").onclick=()=>openService();$("#saveServiceDialogBtn").onclick=saveService;$("#servicesSearch").oninput=renderServices;$("#addServiceItemBtn").onclick=addServiceItem;
 $("#orderDiscount").oninput=renderOrderItems;$("#deliveryFee").oninput=renderOrderItems;$("#clearOrderBtn").onclick=clearOrder;$("#saveOrderBtn").onclick=saveOrder;$("#ordersSearch").oninput=renderOrders;$("#ordersStatusFilter").onchange=renderOrders;
 $("#closeOrderBtn").onclick=()=>$("#orderDialog").close();$("#printClaimBtn").onclick=()=>window.print();$("#paymentBtn").onclick=openPayment;$("#paymentMethod").onchange=e=>$("#paymentReferenceWrap").classList.toggle("hidden",e.target.value==="Cash");$("#savePaymentBtn").onclick=savePayment;
 $("#addExpenseBtn").onclick=()=>{$("#expenseDate").value=day(new Date());$("#expenseDescription").value="";$("#expenseAmount").value="";$("#expenseDialog").showModal()};$("#saveExpenseBtn").onclick=saveExpense;$("#expensesSearch").oninput=renderExpenses;
 $("#closeRealtimePopupBtn").onclick=()=>$("#realtimeBookingPopup").classList.add("hidden");$("#saveBookingSettingsBtn").onclick=saveBookingSettings;$("#syncBookingsBtn").onclick=()=>syncOnlineBookings();$("#saveSettingsBtn").onclick=saveSettings;$("#savePinsBtn").onclick=savePins;$("#backupBtn").onclick=backup;$("#restoreInput").onchange=e=>e.target.files[0]&&restore(e.target.files[0]);$("#resetDemoBtn").onclick=()=>{if(confirm("Reset all laundry data?")){db=structuredClone(defaults);save();clearOrder();renderAll();toast("Demo data restored")}}
}
bind();setupNetworkMonitoring();updateRealtimeIndicator();clearOrder();setTimeout(()=>syncOnlineBookings(true),1500);setInterval(()=>{updateRealtimeIndicator();if(activeUser&&navigator.onLine)syncOnlineBookings(true)},5000);setInterval(()=>$("#clock").textContent=new Date().toLocaleString(),1000);if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js").catch(()=>{});
})();