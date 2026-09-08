import {decodeDaily} from './research-core.mjs?v=20260908';

export const strategies = [{id:'wheel',name:'标准 Wheel',color:'#2d5f9a'},{id:'floor',name:'Call 接货价下限',color:'#16736b'},{id:'dca',name:'SPY 定投',color:'#9b632b'}];
export function profitParts(day, key='wheel') {
  return [day[`${key}_premiums`],day[`${key}_stock_realized`],day[`${key}_stock_unrealized`],day[`${key}_dividends`]+day[`${key}_interest`],-day[`${key}_option_liability`]];
}
export function demoSeries(days, mode) {
  if(!['net_pnl','equity','drawdown'].includes(mode)) throw new Error('Unknown chart mode');
  return [...strategies.map(s=>({...s,values:days.map(d=>d[`${s.id}_${mode}`])})),...(mode==='equity'?[{id:'principal',name:'累计本金',color:'#85929c',values:days.map(d=>d.contributed)}]:[])];
}
export function nextMonthIndex(days, index) {
  const month=days[index].date.slice(0,7);
  const next=days.findIndex((d,i)=>i>index && d.date.slice(0,7)!==month);
  if(next<0) return days.length-1;
  if(next-1>index) return next-1;
  const nextMonth=days[next].date.slice(0,7);
  const after=days.findIndex((d,i)=>i>next && d.date.slice(0,7)!==nextMonth);
  return after<0?days.length-1:after-1;
}
export function validateDemo(payload) {
  const fail=message=>{throw new Error(message);};
  const close=(a,b)=>Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a-b)<.001;
  if(payload.schema!==1 || payload.evidence!=='MODEL-ONLY') fail('演示数据等级不一致');
  const days=decodeDaily(payload);
  if(!days.length || days[0].date!==payload.start || days.at(-1).date!==payload.end) fail('演示日期不完整');
  let principal=payload.funding.initial_cash;
  const previous=Object.fromEntries(strategies.map(s=>[s.id,{equity:principal,unit:1,peak:1}]));
  for(let i=0;i<days.length;i++) {
    const d=days[i];
    if(i && d.date<=days[i-1].date) fail('演示日期顺序错误');
    if(!Number.isFinite(d.deposit)||d.deposit<0) fail('入金无效');
    principal+=d.deposit;
    if(!close(principal,d.contributed)) fail('本金对账失败');
    for(const {id} of strategies) {
      const eq=d[`${id}_equity`], cash=d[`${id}_cash`], shares=d[`${id}_shares`], liability=id==='dca'?0:d[`${id}_option_liability`];
      if(!close(eq,cash+shares*d.spot-liability)||!close(eq-principal,d[`${id}_net_pnl`])) fail('账户或利润对账失败');
      if(cash<-.001||shares<0||!Number.isInteger(shares)||(id!=='dca'&&shares>100)) fail('持仓数量或现金异常');
      if(id!=='dca'&&!close(profitParts(d,id).reduce((a,b)=>a+b,0),d[`${id}_net_pnl`])) fail('盈亏拆解不一致');
      const p=previous[id],unit=p.unit*(eq-d.deposit)/p.equity,peak=Math.max(p.peak,unit);
      if(!close(unit-1,d[`${id}_twr`])||!close(unit/peak-1,d[`${id}_drawdown`])) fail('入金调整收益不一致');
      previous[id]={equity:eq,unit,peak};
    }
  }
  for(const {id} of strategies) {
    if(!close(payload.stats[id].net_pnl,days.at(-1)[`${id}_net_pnl`])) fail('期末统计不一致');
    let equity=payload.funding.initial_cash, total=0;
    for(const m of payload.monthly) {
      const monthDays=days.filter(d=>d.date.slice(0,7)===m.month),last=monthDays.at(-1);
      const flow=monthDays.reduce((sum,d)=>sum+d.deposit,0);
      if(!last||!close(m.deposit,flow)||!close(m[`${id}_profit`],last[`${id}_equity`]-equity-flow)||!close(m[`${id}_cumulative`],last[`${id}_net_pnl`])) fail('月度账本不一致');
      total+=m[`${id}_profit`];equity=last[`${id}_equity`];
    }
    if(!close(total,payload.stats[id].net_pnl)) fail('月度累计不一致');
  }
  return days;
}
