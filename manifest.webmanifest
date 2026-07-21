(() => {
"use strict";

const ONLINE_SERVICES = [
  {id:"wash-dry-fold",name:"Wash, Dry & Fold",price:65,unit:"per kilo",icon:"🧺",description:"Complete wash, dry and fold service."},
  {id:"wash-only",name:"Wash Only",price:40,unit:"per kilo",icon:"🫧",description:"Washing service only."},
  {id:"dry-only",name:"Dry Only",price:40,unit:"per kilo",icon:"♨️",description:"Drying service only."},
  {id:"comforter",name:"Comforter",price:180,unit:"per piece",icon:"🛏️",description:"For comforters and thick blankets."},
  {id:"bedsheet",name:"Bed Sheet Set",price:100,unit:"per set",icon:"🛌",description:"Bed sheet, pillowcase and cover set."},
  {id:"curtain",name:"Curtain",price:120,unit:"per panel",icon:"🪟",description:"Curtain washing service."},
  {id:"shoes",name:"Shoes Cleaning",price:150,unit:"per pair",icon:"👟",description:"Basic shoe cleaning service."},
  {id:"ironing",name:"Ironing",price:25,unit:"per piece",icon:"👔",description:"Pressing and ironing service."},
  {id:"pickup",name:"Pickup & Delivery",price:80,unit:"service fee",icon:"🛵",description:"Pickup and delivery service."}
];

let onlineCart = [];

function peso(v){
  return new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP"}).format(Number(v||0));
}
function renderOnlineServices(){
  const grid=document.getElementById("onlineServiceGrid");
  if(!grid)return;
  grid.innerHTML=ONLINE_SERVICES.map(s=>{
    const inCart=onlineCart.some(i=>i.id===s.id);
    return `<button type="button" class="online-service-card ${inCart?"added":""}" data-service-id="${s.id}">
      <div class="icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <p>${s.description}</p>
      <div class="price"><span>${peso(s.price)} / ${s.unit}</span><span class="tap-add">TAP TO ADD</span></div>
    </button>`;
  }).join("");
  grid.querySelectorAll("[data-service-id]").forEach(btn=>{
    btn.addEventListener("click",()=>addServiceToCart(btn.dataset.serviceId));
  });
}
function addServiceToCart(id){
  const service=ONLINE_SERVICES.find(s=>s.id===id);
  if(!service)return;
  const existing=onlineCart.find(i=>i.id===id);
  if(existing)existing.qty+=1;
  else onlineCart.push({...service,qty:1});
  renderOnlineCart();
  renderOnlineServices();
}
function changeOnlineQty(id,delta){
  const item=onlineCart.find(i=>i.id===id);
  if(!item)return;
  item.qty+=delta;
  if(item.qty<=0)onlineCart=onlineCart.filter(i=>i.id!==id);
  renderOnlineCart();
  renderOnlineServices();
}
function removeOnlineItem(id){
  onlineCart=onlineCart.filter(i=>i.id!==id);
  renderOnlineCart();
  renderOnlineServices();
}
function renderOnlineCart(){
  const box=document.getElementById("onlineCartItems");
  if(!box)return;
  if(!onlineCart.length){
    box.innerHTML='<div class="online-cart-empty">Wala pang napiling service. Pindutin ang service card sa taas.</div>';
  }else{
    box.innerHTML=onlineCart.map(i=>`<div class="online-cart-item">
      <div><h4>${i.icon} ${i.name}</h4><small>${peso(i.price)} / ${i.unit}</small></div>
      <div class="qty-control">
        <button type="button" data-minus="${i.id}">−</button>
        <b>${i.qty}</b>
        <button type="button" data-plus="${i.id}">+</button>
      </div>
      <button type="button" class="remove-cart-item" data-remove="${i.id}">REMOVE</button>
    </div>`).join("");
    box.querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>changeOnlineQty(b.dataset.minus,-1));
    box.querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>changeOnlineQty(b.dataset.plus,1));
    box.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>removeOnlineItem(b.dataset.remove));
  }
  const qty=onlineCart.reduce((a,i)=>a+i.qty,0);
  const total=onlineCart.reduce((a,i)=>a+i.qty*i.price,0);
  const count=document.getElementById("cartCount");
  const qtyEl=document.getElementById("onlineCartQty");
  const totalEl=document.getElementById("onlineCartTotal");
  const dataEl=document.getElementById("cartData");
  if(count)count.textContent=qty;
  if(qtyEl)qtyEl.textContent=qty;
  if(totalEl)totalEl.textContent=peso(total);
  if(dataEl)dataEl.value=JSON.stringify({items:onlineCart,total});
}
function setupOnlineCart(){
  renderOnlineServices();
  renderOnlineCart();
  const clear=document.getElementById("clearOnlineCartBtn");
  if(clear)clear.onclick=()=>{onlineCart=[];renderOnlineCart();renderOnlineServices()};
}


function setupCookieConsent(){
 const key="ate-annas-cookie-consent-v1",banner=$("#cookieBanner");
 if(!banner)return;
 if(!localStorage.getItem(key))banner.classList.remove("hidden");
 $("#acceptCookiesBtn").onclick=()=>{localStorage.setItem(key,"accepted");banner.classList.add("hidden")};
 $("#rejectCookiesBtn").onclick=()=>{localStorage.setItem(key,"essential");banner.classList.add("hidden")};
}

const $=s=>document.querySelector(s);
const KEY="ate-annas-laundry-pos-v2-data";
const money=n=>new Intl.NumberFormat("en-PH",{style:"currency",currency:"PHP"}).format(Number(n||0));
let selectedService=null,lastMessage="";
const fallback={
 settings:{storeName:"ATE ANNAS LAUNDRY",bookingWhatsapp:"639178575757",bookingArea:"Buting, Pasig City and nearby areas",bookingMinimum:150},
 services:[
  {id:"s1",name:"Wash, Dry & Fold",type:"kg",rate:45,minimum:4,active:true},
  {id:"s2",name:"Wash Only",type:"kg",rate:30,minimum:4,active:true},
  {id:"s3",name:"Dry Only",type:"kg",rate:25,minimum:4,active:true},
  {id:"s4",name:"Comforter",type:"piece",rate:180,minimum:1,active:true},
  {id:"s6",name:"Ironing",type:"piece",rate:15,minimum:1,active:true}
 ]
};
function load(){try{return JSON.parse(localStorage.getItem(KEY))||fallback}catch{return fallback}}
const db=load(),settings={...fallback.settings,...(db.settings||{})},services=(db.services||fallback.services).filter(s=>s.active&&s.name!=="Pickup / Delivery");
function updateNetwork(){const n=$("#customerNetwork"),online=navigator.onLine;n.classList.toggle("online",online);n.classList.toggle("offline",!online);n.querySelector("b").textContent=online?"ONLINE":"OFFLINE"}
function render(){
 $("#bookingStoreName").textContent=settings.storeName;
 $("#bookingAreaText").textContent="Service area: "+(settings.bookingArea||"Please contact the store.");
 $("#summaryMinimum").textContent=money(settings.bookingMinimum||0);
 $("#publicServices").innerHTML=services.map(s=>`<button type="button" class="service-option" data-id="${s.id}"><b>${s.name}</b><span>${s.type==="kg"?"Per kilo":s.type==="piece"?"Per piece":"Flat rate"} · Minimum ${s.minimum||0}</span><strong>${money(s.rate)}</strong></button>`).join("");
 document.querySelectorAll(".service-option").forEach(b=>b.onclick=()=>{selectedService=services.find(s=>s.id===b.dataset.id);document.querySelectorAll(".service-option").forEach(x=>x.classList.toggle("active",x===b));updateSummary()});
 if(services[0])document.querySelector(".service-option").click();
 const d=new Date();d.setDate(d.getDate()+1);$("#bDate").value=d.toISOString().slice(0,10);$("#bDate").min=new Date().toISOString().slice(0,10);
}
function estimate(){if(!selectedService)return 0;const q=Number($("#bQty").value||0);if(selectedService.type==="flat")return Number(selectedService.rate);return Math.max(q,Number(selectedService.minimum||0))*Number(selectedService.rate)}
function updateSummary(){$("#summaryService").textContent=selectedService?.name||"—";$("#summaryAmount").textContent=money(estimate())}
$("#bQty").addEventListener("input",updateSummary);
$("#bookingForm").addEventListener("submit",async e=>{
 e.preventDefault();
 if(!onlineCart.length){alert("Pumili muna ng kahit isang laundry service.");document.getElementById("onlineServiceGrid")?.scrollIntoView({behavior:"smooth"});return;}
 if(!navigator.onLine){alert("You are offline. Please connect to the internet before sending the booking request.");return}
 if(!selectedService)return;
 const submit=e.submitter||$("#bookingForm").querySelector('button[type="submit"]');
 submit.disabled=true;submit.textContent="SENDING…";
 const type=document.querySelector('input[name="type"]:checked').value;
 const payload={
  customer_name:$("#bName").value.trim(),mobile:$("#bMobile").value.trim(),address:$("#bAddress").value.trim(),
  request_type:type,preferred_date:$("#bDate").value,preferred_time:$("#bTime").value,
  service_name:selectedService.name,quantity:Number($("#bQty").value||1),estimated_amount:estimate(),
  promo_code:$("#bPromo").value.trim(),cartItems:onlineCart.map(i=>({serviceId:i.id,name:i.name,qty:i.qty,price:i.price,unit:i.unit,lineTotal:i.qty*i.price})),estimatedTotal:onlineCart.reduce((a,i)=>a+i.qty*i.price,0),notes:$("#bNotes").value.trim()
 };
 try{
   const res=await fetch("/api/bookings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error||"Unable to submit booking");
   const code=data.booking.booking_code;
   lastMessage=`ONLINE LAUNDRY BOOKING\n\nRequest Code: ${code}\nCustomer: ${payload.customer_name}\nMobile: ${payload.mobile}\nAddress: ${payload.address}\nRequest: ${payload.request_type}\nSchedule: ${payload.preferred_date} ${payload.preferred_time}\nService: ${payload.service_name}\nEstimated Qty: ${payload.quantity}\nEstimated Amount: ${money(payload.estimated_amount)}\n\nYour booking was received automatically by ATE ANNAS Laundry.`;
   $("#requestCode").textContent=code;
   $("#successDialog").querySelector("p:nth-of-type(2)").textContent="Your booking was received automatically by ATE ANNAS Laundry.";
   $("#sendWhatsappBtn").textContent="SEND COPY TO WHATSAPP";
   $("#successDialog").showModal();
   $("#bookingForm").reset();
 }catch(err){alert(err.message)}
 finally{submit.disabled=false;submit.textContent="SEND BOOKING REQUEST"}
});
$("#sendWhatsappBtn").onclick=()=>{const num=String(settings.bookingWhatsapp||"").replace(/\D/g,"");if(!num){alert("The store WhatsApp number is not configured.");return}location.href=`https://wa.me/${num}?text=${encodeURIComponent(lastMessage)}`};
$("#closeSuccessBtn").onclick=()=>$("#successDialog").close();
window.addEventListener("online",updateNetwork);window.addEventListener("offline",updateNetwork);
setupCookieConsent();setupOnlineCart();updateNetwork();render();
})();