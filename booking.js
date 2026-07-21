(() => {
"use strict";

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
 if(!navigator.onLine){alert("You are offline. Please connect to the internet before sending the booking request.");return}
 if(!selectedService)return;
 const submit=e.submitter||$("#bookingForm").querySelector('button[type="submit"]');
 submit.disabled=true;submit.textContent="SENDING…";
 const type=document.querySelector('input[name="type"]:checked').value;
 const payload={
  customer_name:$("#bName").value.trim(),mobile:$("#bMobile").value.trim(),address:$("#bAddress").value.trim(),
  request_type:type,preferred_date:$("#bDate").value,preferred_time:$("#bTime").value,
  service_name:selectedService.name,quantity:Number($("#bQty").value||1),estimated_amount:estimate(),
  promo_code:$("#bPromo").value.trim(),notes:$("#bNotes").value.trim()
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
setupCookieConsent();updateNetwork();render();
})();