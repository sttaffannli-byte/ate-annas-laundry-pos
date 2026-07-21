const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const clean=(v,max=500)=>String(v??"").trim().slice(0,max);
const authorized=(context)=> {
  const configured=context.env.ADMIN_API_KEY;
  return configured && context.request.headers.get("x-admin-key")===configured;
};

export async function onRequestPost(context){
  try{
    const body=await context.request.json();
    const required=["customer_name","mobile","address","request_type","preferred_date","preferred_time","service_name"];
    for(const key of required)if(!clean(body[key]))return json({error:`Missing ${key}`},400);
    const id=crypto.randomUUID();
    const bookingCode="BK-"+new Date().toISOString().replace(/\D/g,"").slice(2,14)+"-"+Math.random().toString(36).slice(2,5).toUpperCase();
    const now=new Date().toISOString();
    await context.env.DB.prepare(`INSERT INTO online_bookings
      (id,booking_code,customer_name,mobile,address,request_type,preferred_date,preferred_time,service_name,quantity,estimated_amount,promo_code,notes,status,created_at,updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'Received',?,?)`)
      .bind(id,bookingCode,clean(body.customer_name,120),clean(body.mobile,40),clean(body.address,500),clean(body.request_type,40),
        clean(body.preferred_date,20),clean(body.preferred_time,50),clean(body.service_name,120),
        Math.max(0.1,Number(body.quantity||1)),Math.max(0,Number(body.estimated_amount||0)),
        clean(body.promo_code,80),clean(body.notes,1000),now,now).run();
    return json({ok:true,booking:{id,booking_code:bookingCode,status:"Received",created_at:now}},201);
  }catch(error){return json({error:"Unable to save booking",detail:String(error.message||error)},500)}
}
export async function onRequestGet(context){
  if(!authorized(context))return json({error:"Unauthorized admin sync key"},401);
  const url=new URL(context.request.url);
  const limit=Math.min(200,Math.max(1,Number(url.searchParams.get("limit")||100)));
  const result=await context.env.DB.prepare("SELECT * FROM online_bookings ORDER BY created_at DESC LIMIT ?").bind(limit).all();
  return json({bookings:result.results||[]});
}
