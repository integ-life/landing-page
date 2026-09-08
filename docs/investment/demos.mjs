import {escapeHTML as esc,money,pct,nearestDay,stateNames,eventNames} from './research-core.mjs?v=20260908';
import {strategies,profitParts,demoSeries,nextMonthIndex,validateDemo} from './demo-core.mjs?v=20260908-v2';

const $=id=>document.getElementById(id);
const state={manifest:null,caseId:'crash_2020',fundingId:'reserve',data:null,days:[],index:0,page:0,request:0,timer:null};
const cache=new Map();
const names={...eventNames,CONTRIBUTION:'追加本金',DCA_BUY:'定期买入 SPY',DCA_DIVIDEND:'SPY 股息'};
const tone=n=>n<-.005?'demo-negative':n>.005?'demo-positive':'';
const signed=n=>`<span class="${tone(n)}">${money(n,true)}</span>`;
function stop(){clearInterval(state.timer);state.timer=null;$('demo-play').textContent='逐月播放';$('demo-play').setAttribute('aria-pressed','false');}
function renderCases(){
  $('demo-cases').innerHTML=state.manifest.cases.map(c=>`<button class="scenario-button" data-case="${esc(c.id)}" aria-pressed="${c.id===state.caseId}"><strong>${esc(c.title)}</strong><span class="scenario-type">${c.start.slice(0,7)} — ${c.end.slice(0,7)}</span></button>`).join('');
}
function renderOverview(){
  $('demo-overview-label').textContent=state.fundingId==='reserve'?'当前均采用：预留 $100,000，SPY 分 12 个月建仓；无新增本金。':'当前均采用：初始 $100,000，次月起每月同时追加 $1,000。';
  $('demo-overview').innerHTML=state.manifest.cases.map(c=>{
    const run=state.manifest.runs.find(r=>r.case_id===c.id&&r.funding_id===state.fundingId);
    return `<tr class="${c.id===state.caseId?'demo-selected-row':''}"><th><button class="demo-table-button" data-case="${esc(c.id)}">${esc(c.title)}</button><span class="demo-cell-sub">${c.start.slice(0,7)} — ${c.end.slice(0,7)}</span></th>${strategies.map(({id})=>`<td>${signed(run.stats[id].net_pnl)}<span class="demo-cell-sub">最大回撤 ${pct(run.stats[id].max_drawdown)}</span></td>`).join('')}</tr>`;
  }).join('');
}
async function selectCase(caseId=state.caseId,fundingId=state.fundingId){
  stop();state.caseId=caseId;state.fundingId=fundingId;const request=++state.request;
  renderCases();$('demo-status').hidden=false;$('demo-status').textContent='正在读取并核对案例账本…';$('demo-content').hidden=true;
  try{
    const info=state.manifest.runs.find(r=>r.case_id===caseId&&r.funding_id===fundingId);
    if(!info)throw new Error('未找到案例');
    let data=cache.get(info.id);
    if(!data){
      const response=await fetch(`./data/demos/${info.id}.json?v=${info.sha256.slice(0,12)}`);
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const buffer=await response.arrayBuffer();
      const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))].map(n=>n.toString(16).padStart(2,'0')).join('');
      if(hash!==info.sha256)throw new Error('数据指纹不一致，请刷新');
      data=JSON.parse(new TextDecoder().decode(buffer));validateDemo(data);cache.set(info.id,data);
    }
    if(request!==state.request)return;
    state.data=data;state.days=validateDemo(data);state.index=nearestDay(state.days,data.stats.wheel.worst_pnl_date);state.page=0;
    $('demo-status').hidden=true;$('demo-content').hidden=false;
    $('demo-question').textContent=data.case.question;
    $('demo-context').textContent=`${data.start} — ${data.end} · ${state.days.length.toLocaleString()} 个交易日。${data.case.context}`;
    $('demo-funding-note').textContent=`期末三边累计投入均为 ${money(data.stats.wheel.contributed)}。Wheel 最多持有 100 股；月供不会增加合约张数。下方大数字为期末结果，日期账本初始停在标准 Wheel 累计盈亏最低的一天。`;
    $('demo-end-metrics').innerHTML=strategies.map(({id,name})=>{const s=data.stats[id];return `<article><h3>${name}</h3><div class="demo-profit">${money(s.net_pnl,true)}<small>期末累计投资盈亏</small></div><p>期末净值 <strong>${money(s.final_equity)}</strong></p><p>时间加权收益 <strong>${pct(s.total_return,true)}</strong> · 最大回撤 <strong>${pct(s.max_drawdown)}</strong></p><p>累计盈亏最低 ${money(s.worst_pnl,true)}<br>${s.worst_pnl_date} · 连续亏损最长 ${s.longest_losing_streak_sessions} 个交易日</p><p>最大回撤后恢复前高：<strong>${s.recovery_date??'窗口内尚未恢复'}</strong></p><p>平均股票市值占比 <strong>${pct(s.average_stock_exposure)}</strong></p></article>`;}).join('');
    $('demo-milestones').innerHTML=data.milestones.map(m=>`<button data-date="${m.date}" title="${esc(m.detail)}">${esc(m.label)}<span>${m.date}</span></button>`).join('');
    $('demo-slider').max=state.days.length-1;$('demo-date').min=data.start;$('demo-date').max=data.end;
    for(const [id,suffix] of [['demo-download-monthly','-monthly.csv'],['demo-download-daily','-daily.csv'],['demo-download-json','.json']])$(id).href=`./data/demos/${info.id}${suffix}`;
    renderOverview();renderMonths();renderDay();
  }catch(error){if(request===state.request){$('demo-status').hidden=false;$('demo-status').textContent=`演示暂未加载：${error.message}。请刷新页面重试。`;}}
}
function renderChart(){
  if(!state.data||$('demo-content').hidden)return;
  const svg=$('demo-chart'),mode=$('demo-chart-mode').value,series=demoSeries(state.days,mode);
  $('demo-principal-key').hidden=mode!=='equity';
  const width=Math.max(340,svg.parentElement.clientWidth),height=width<600?270:330,left=mode==='drawdown'?53:65,right=16,top=20,bottom=38;
  const all=series.flatMap(s=>s.values);let min=Math.min(0,...all),max=Math.max(0,...all);
  const padding=(max-min||1)*.07;min-=padding;max+=padding;
  const x=i=>left+i/(state.days.length-1)*(width-left-right),y=v=>top+(max-v)/(max-min)*(height-top-bottom);
  let out=`<title>${esc(state.data.case.title)} · ${esc($('demo-chart-mode').selectedOptions[0].text)}</title><desc>三种策略同一资金计划。拖动下方日期查看准确数值，曲线包括模型期权负债和股票浮动盈亏。</desc>`;
  for(let i=0;i<5;i++){
    const value=min+(max-min)*i/4,py=y(value),label=mode==='drawdown'?pct(value):`${value<0?'−':''}$${(Math.abs(value)/1000).toFixed(1)}k`;
    out+=`<line x1="${left}" x2="${width-right}" y1="${py}" y2="${py}" stroke="#e6ebef"/><text x="${left-8}" y="${py+4}" text-anchor="end" fill="#596975" font-size="11">${label}</text>`;
  }
  if(mode!=='equity')out+=`<line x1="${left}" x2="${width-right}" y1="${y(0)}" y2="${y(0)}" stroke="#9daab3" stroke-dasharray="3 4"/>`;
  for(const s of series){const path=s.values.map((v,i)=>`${i?'L':'M'}${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(' ');out+=`<path d="${path}" fill="none" stroke="${s.color}" stroke-width="${s.id==='principal'?1.5:2.2}" ${s.id==='principal'?'stroke-dasharray="5 4"':''}/>`;}
  const px=x(state.index);out+=`<line x1="${px}" x2="${px}" y1="${top}" y2="${height-bottom}" stroke="#162b3a" stroke-dasharray="3 3"/>`;
  for(const s of series)out+=`<circle cx="${px}" cy="${y(s.values[state.index])}" r="4" fill="${s.color}" stroke="white" stroke-width="1.5"/>`;
  for(const [i,anchor] of [[0,'start'],[Math.floor((state.days.length-1)/2),'middle'],[state.days.length-1,'end']])out+=`<text x="${x(i)}" y="${height-9}" text-anchor="${anchor}" fill="#596975" font-size="11">${state.days[i].date}</text>`;
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.innerHTML=out;
}
function renderDay(){
  const d=state.days[state.index];if(!d)return;
  $('demo-slider').value=state.index;$('demo-date').value=d.date;
  $('demo-prev-day').disabled=state.index===0;$('demo-next-day').disabled=state.index===state.days.length-1;
  for(const button of $('demo-milestones').querySelectorAll('button'))button.setAttribute('aria-pressed',button.dataset.date===d.date);
  const milestone=state.data.milestones.filter(m=>m.date===d.date).map(m=>m.detail).join(' ');
  $('demo-day').innerHTML=`<div class="demo-day-heading"><h3>${d.date}</h3><p>SPY ${money(d.spot)} · 累计投入本金 ${money(d.contributed)}${d.deposit?` · 今日追加 ${money(d.deposit)}`:''}</p></div>${milestone?`<p class="muted" style="font-size:.875rem;margin-bottom:12px">${esc(milestone)}</p>`:''}<div class="demo-day-grid">${strategies.map(({id,name})=>`<article><h4>${name} · 截至当日盈亏</h4><strong class="${tone(d[`${id}_net_pnl`])}">${money(d[`${id}_net_pnl`],true)}</strong><p>账户净值 ${money(d[`${id}_equity`])}<br>持股 ${d[`${id}_shares`]} 股 · 现金 ${money(d[`${id}_cash`])}<br>${id==='dca'?`累计股息 ${money(d.dca_dividends)}`:esc(stateNames[d[`${id}_state`]])}</p></article>`).join('')}</div>`;
  renderLedger();renderChart();
}
function renderLedger(){
  const d=state.days[state.index],key=$('demo-ledger-rule').value;if(!d)return;
  const labels=['累计开仓权利金（已扣费）','股票已实现盈亏','仍持有股票的浮动盈亏','累计股息与现金利息','减：未平仓期权负债'];
  const parts=profitParts(d,key);
  $('demo-ledger').innerHTML=parts.map((value,i)=>`<div><span>${labels[i]}</span><strong class="${tone(value)}">${money(value,true)}</strong></div>`).join('')+`<div class="demo-total"><span>合计 = 净值 − 累计本金</span><strong class="${tone(d[`${key}_net_pnl`])}">${money(d[`${key}_net_pnl`],true)}</strong></div>`;
  const lines=[];
  for(const id of [key,'dca']){
    const events=state.data.events[id].filter(e=>e.date===d.date);
    if(events.length)lines.push(`<p><strong>${strategies.find(s=>s.id===id).name} 当日：</strong>${events.map(e=>`${esc(names[e.action]??e.action)}${e.quantity?` ${e.quantity} 股`:''}${e.strike?` · K ${money(e.strike)}`:''}${Number.isFinite(e.cash_flow)&&e.cash_flow!==0?` · 现金 ${money(e.cash_flow,true)}`:''}`).join('；')}</p>`);
  }
  $('demo-day-events').innerHTML=lines.join('')||'<p>这一天没有新的成交或资金事件；股票与期权的估值仍会改变账户盈亏。</p>';
}
function renderMonths(){
  const rows=state.data.monthly,total=Math.ceil(rows.length/12);state.page=Math.max(0,Math.min(state.page,total-1));
  $('demo-monthly').innerHTML=rows.slice(state.page*12,(state.page+1)*12).map(m=>`<tr><th><button class="demo-table-button" data-date="${m.date}">${m.month}</button></th><td>${money(m.deposit)}<span class="demo-cell-sub">${money(m.contributed)}</span></td>${strategies.map(({id})=>`<td>${signed(m[`${id}_profit`])}<span class="demo-cell-sub">（累计 ${money(m[`${id}_cumulative`],true)}）</span></td>`).join('')}</tr>`).join('');
  $('demo-month-page').textContent=`${state.page+1} / ${total} 页 · 共 ${rows.length} 个月`;$('demo-month-prev').disabled=state.page===0;$('demo-month-next').disabled=state.page===total-1;
}
function seek(index){stop();state.index=Math.max(0,Math.min(state.days.length-1,index));renderDay();}
$('demos').addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.case)selectCase(button.dataset.case);
  else if(button.dataset.date)seek(nearestDay(state.days,button.dataset.date));
});
for(const input of document.querySelectorAll('input[name="demo-funding"]'))input.addEventListener('change',()=>selectCase(state.caseId,input.value));
$('demo-slider').addEventListener('input',event=>seek(Number(event.target.value)));
$('demo-date').addEventListener('change',event=>{if(event.target.value)seek(nearestDay(state.days,event.target.value));});
$('demo-prev-day').addEventListener('click',()=>seek(state.index-1));$('demo-next-day').addEventListener('click',()=>seek(state.index+1));
$('demo-chart-mode').addEventListener('change',renderChart);$('demo-ledger-rule').addEventListener('change',renderLedger);
$('demo-month-prev').addEventListener('click',()=>{state.page--;renderMonths();});$('demo-month-next').addEventListener('click',()=>{state.page++;renderMonths();});
$('demo-play').addEventListener('click',()=>{
  if(state.timer){stop();return;}
  if(state.index===state.days.length-1)state.index=0;
  $('demo-play').textContent='暂停播放';$('demo-play').setAttribute('aria-pressed','true');renderDay();
  state.timer=setInterval(()=>{state.index=nextMonthIndex(state.days,state.index);renderDay();if(state.index===state.days.length-1)stop();},1400);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
new ResizeObserver(renderChart).observe($('demo-chart').parentElement);
try{
  const response=await fetch('./data/demos/manifest.json',{cache:'no-cache'});if(!response.ok)throw new Error(`HTTP ${response.status}`);
  state.manifest=await response.json();
  if(state.manifest.evidence!=='MODEL-ONLY'||state.manifest.cases.length!==6||state.manifest.runs.length!==12)throw new Error('演示目录不完整');
  await selectCase();
}catch(error){$('demo-status').textContent=`演示暂未加载：${error.message}。请刷新页面重试。`;}
