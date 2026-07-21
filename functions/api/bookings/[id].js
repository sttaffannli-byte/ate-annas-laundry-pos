const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{"content-type":"application/json;charset=UTF-8","cache-control":"no-store"}});
const clean=(v,max=500)=>String(v??"").trim().slice(0,max);
const authorized=(context)=> {
  const configured=context.env.ADMIN_API_KEY;
  return configured && context.request.headers.get("x-admin-key")===configured;
};

export async function onRequestGet(context){
  if(!authorized(context))return json({error:"Unauthorized"},401);
  const row=await context.env.DB.prepare("SELECT * FROM online_bookings WHERE id=?").bind(context.params.id).first();
  return row?json({booking:row}):json({error:"Booking not found"},404);
}
export async function onRequestPatch(context){
  if(!authorized(context))return json({error:"Unauthorized admin sync key"},401);
  const body=await context.request.json();
  const allowed=["Received","Imported","Cancelled"];
  if(!allowed.includes(body.status))return json({error:"Invalid status"},400);
  const result=await context.env.DB.prepare("UPDATE online_bookings SET status=?,updated_at=? WHERE id=?")
    .bind(body.status,new Date().toISOString(),context.params.id).run();
  return result.meta?.changes?json({ok:true,status:body.status}):json({error:"Booking not found"},404);
}
