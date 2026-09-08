import {eventNames, stateNames, escapeHTML as esc, pct, money, nearestDay, filterEvents, pageEvents, seriesForChart, validateData} from './research-core.mjs?v=20260908';

const $ = id => document.getElementById(id);
const state = {manifest: null, info: null, payload: null, days: [], day: 0, page: 0, request: 0, scale: null, cache: new Map()};
const colorClass = n => n > 0 ? 'positive' : n < 0 ? 'negative' : '';
const colors = {equity: '#2d5f9a', buy_hold_100: '#16736b', buy_hold: '#b2843c'};
const sessionFormatter = new Intl.DateTimeFormat('zh-CN', {year:'numeric',month:'long',day:'numeric',timeZone:'UTC'});

function status(message, error = false) { const el = $('load-status'); el.textContent = message; el.hidden = !message; el.classList.toggle('error', error); }
function setButtons(id) { for (const button of $('scenario-buttons').querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.id === id)); }
async function loadScenario(id) {
  const request = ++state.request;
  const info = state.manifest.scenarios.find(s => s.id === id);
  if (!info) return;
  setButtons(id); status('正在读取这组实验的交易账本…'); $('research').setAttribute('aria-busy','true');
  try {
    let payload = state.cache.get(id);
    if (!payload) {
      const response = await fetch(`./data/${id}.json?v=${info.data_sha256.slice(0,12)}`);
      if (!response.ok) throw new Error('数据请求未成功');
      const bytes = await response.arrayBuffer();
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      const hash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
      if (hash !== info.data_sha256) throw new Error('数据文件与摘要的指纹不一致，请刷新');
      payload = JSON.parse(new TextDecoder().decode(bytes));
      validateData(info, payload); state.cache.set(id, payload);
    }
    if (request !== state.request) return;
    const priorDate = state.days[state.day]?.date;
    state.info = info; state.payload = payload; state.days = validateData(info, payload); state.page = 0;
    state.day = priorDate ? nearestDay(state.days, priorDate) : state.days.length - 1;
    renderScenario(); $('research').hidden = false; status(''); renderChart(); selectDay(state.day);
  } catch (error) {
    if (request !== state.request) return;
    setButtons(state.info?.id);
    status(`这组实验暂时无法显示。${error.message}。请重新选择场景或刷新页面。`, true);
  } finally { if (request === state.request) $('research').setAttribute('aria-busy','false'); }
}

function renderScenario() {
  const info = state.info, m = info.metrics.equity, counts = info.event_counts;
  $('scenario-kind').textContent = info.kind;
  $('scenario-name').textContent = info.name;
  $('scenario-description').textContent = info.description;
  const metrics = [['总收益',pct(m.total_return),'包含股票盈亏与期末负债'],['年化收益',pct(m.cagr),'按实际日历年数折算'],['最大回撤',pct(m.max_drawdown),'相对此前最高净值'],['完整接货循环',`${state.payload.cycles.length} 轮`,`${counts.SELL_PUT || 0} 次卖 Put · ${counts.SELL_CALL || 0} 次卖 Call`]];
  $('metrics').innerHTML = metrics.map(([label,value,note])=>`<div class="metric"><p class="metric-label">${label}</p><p class="metric-value">${value}</p><p class="metric-note">${note}</p></div>`).join('');
  $('comparison-body').innerHTML = [['equity',info.name],['buy_hold_100','100 股 SPY + 剩余现金'],['buy_hold','满仓整股 SPY + 零头现金']].map(([key,name])=>{const m=info.metrics[key];return `<tr class="${key==='equity'?'highlight':''}"><td>${esc(name)}</td><td>${pct(m.total_return)}</td><td>${pct(m.cagr)}</td><td>${pct(m.max_drawdown)}</td><td>${money(m.final_equity)}</td></tr>`;}).join('');
  $('annual-body').innerHTML = state.payload.annual.map(row=>`<tr><td>${esc(row.year)}</td>${['equity','buy_hold_100','buy_hold'].map(k=>`<td class="${colorClass(Number(row[k]))}">${pct(Number(row[k]),true)}</td>`).join('')}</tr>`).join('');
  $('day-slider').max = state.days.length - 1;
  $('selected-date').min = info.actual_start; $('selected-date').max = info.actual_end;
  $('cycle-select').innerHTML = state.payload.cycles.map((c,i)=>`<option value="${i}">第 ${i+1} 轮 · ${c.start} → ${c.end}</option>`).join('') || '<option>暂无已完成接货循环</option>';
  $('cycle-select').disabled = !state.payload.cycles.length;
  renderCycle(0); renderEvents(); renderParameters();
  $('download-events').href = `./data/${info.id}-events.csv`;
  $('download-equity').href = `./data/${info.id}-equity.csv`;
  $('provenance').innerHTML = `<p>研究快照：${esc(state.manifest.as_of)} · ${info.sessions} 个交易日 · ${esc(info.evidence)}</p>` + info.input_hashes.map(p=>`<p>${esc(p.file)}</p><div class="hash">SHA-256 ${esc(p.sha256)}</div>`).join('') + `<p>当前页面数据</p><div class="hash">SHA-256 ${esc(info.data_sha256)}</div>`;
}

function renderChart() {
  if (!state.days.length || $('research').hidden) return;
  const svg = $('equity-chart'), width = Math.max(300, svg.parentElement.clientWidth), height = width < 550 ? 280 : 330;
  const left=54, right=14, top=22, bottom=35, innerW=width-left-right, innerH=height-top-bottom;
  const mode = $('chart-mode').value, full = $('show-full').checked;
  const series = seriesForChart(state.days, state.info.config.initial_cash, mode, full);
  let min=0,max=0;
  for(const s of series) for(const value of s.values) {min=Math.min(min,value);max=Math.max(max,value);}
  const padding = Math.max(.02,(max-min)*.08); min-=padding; max+=padding;
  const x = i=>left+i/(state.days.length-1)*innerW, y = value=>top+(max-value)/(max-min)*innerH;
  state.scale = {width,left,innerW,x,y,series,top,bottom:height-bottom};
  let markup='<title id="chart-title">'+esc(state.info.name)+(mode==='equity'?'累计收益':'历史回撤')+'</title><desc id="chart-desc">每个点来自已保存的逐日回测账本；下方日期滑块提供键盘和触屏查看。</desc>';
  for(let i=0;i<=4;i++){const value=min+(max-min)*i/4, yy=y(value);markup+=`<line class="chart-grid" x1="${left}" y1="${yy}" x2="${width-right}" y2="${yy}"/><text class="axis-text" x="${left-9}" y="${yy+5}" text-anchor="end">${(value*100).toFixed(0)}%</text>`;}
  const yearStep = width<550?2:1;
  for(let year=2018;year<=2025;year+=yearStep){const index=nearestDay(state.days,`${year}-01-03`);markup+=`<text class="axis-text" x="${x(index)}" y="${height-8}" text-anchor="${year===2018?'start':'middle'}">${year}</text>`;}
  for(const s of [...series].reverse()){const path=s.values.map((value,i)=>`${i?'L':'M'}${x(i).toFixed(2)},${y(value).toFixed(2)}`).join(' ');markup+=`<path class="curve" stroke="${colors[s.key]}" d="${path}"/>`;}
  markup+=`<line id="chart-cursor" class="cursor-line" x1="0" x2="0" y1="${top}" y2="${height-bottom}"/>`;
  for(const s of series)markup+=`<circle id="point-${s.key}" r="4" fill="${colors[s.key]}" stroke="white" stroke-width="2"/>`;
  svg.setAttribute('viewBox',`0 0 ${width} ${height}`);svg.innerHTML=markup;
  $('full-legend').hidden=!full;
  positionCursor();
}
function positionCursor(){if(!state.scale)return;const {x,y,series}=state.scale;const xx=x(state.day);$('chart-cursor')?.setAttribute('x1',xx);$('chart-cursor')?.setAttribute('x2',xx);for(const s of series){const point=$(`point-${s.key}`);point?.setAttribute('cx',xx);point?.setAttribute('cy',y(s.values[state.day]));}}
function selectDay(index) {
  if (!state.days.length) return;
  state.day = Math.max(0,Math.min(Math.round(index),state.days.length-1));
  const d=state.days[state.day], initial=state.info.config.initial_cash;
  $('day-slider').value=state.day; $('day-slider').setAttribute('aria-valuetext',`${d.date}，账户净值 ${money(d.equity)}`);
  $('selected-date').value=d.date; $('previous-day').disabled=state.day===0; $('next-day').disabled=state.day===state.days.length-1;
  $('day-detail').innerHTML=`<div><small>${sessionFormatter.format(new Date(d.date+'T00:00:00Z'))}</small><strong class="day-state">${stateNames[d.state]||esc(d.state)}</strong></div><div><small>Wheel 净值</small><strong>${money(d.equity)}</strong></div><div><small>Wheel 累计收益</small><strong>${pct(d.equity/initial-1,true)}</strong></div><div><small>100 股 + 现金</small><strong>${pct(d.buy_hold_100/initial-1,true)}</strong></div><div><small>已占用担保金</small><strong>${money(d.collateral)}</strong></div>`;
  $('equation').innerHTML=`<div>现金<strong>${money(d.cash)}</strong></div><div>股票市值 · ${d.shares} 股<strong>+ ${money(d.shares*d.spot)}</strong></div><div>期权负债 · ask 估值<strong>− ${money(d.option_liability)}</strong></div><div>${d.date}<strong>SPY ${money(d.spot)}</strong></div><div class="total"><span>账户净值</span><strong>${money(d.equity)}</strong></div>`;
  positionCursor();
}

function contractLabel(e){return e.right?`SPY ${e.right==='P'?'Put':'Call'} · $${e.strike} · ${e.expiry}`:'—';}
function eventNote(e){
  if(e.action==='SELL_PUT'||e.action==='SELL_CALL')return `行权价 $${e.strike}，${e.expiry} 到期；成交 ${money(e.fill_price)}/股 × 100，手续费 ${money(e.commission)}。信号日 ${e.signal_date}。`;
  if(e.action==='PUT_ASSIGNED')return `按 $${e.strike} × 100 股买入 SPY。现金变为股票，不应把整笔买入金额视作亏损。`;
  if(e.action==='CALL_ASSIGNED')return `按 $${e.strike} × 100 股卖出 SPY，回到现金状态。`;
  if(e.action==='DIVIDEND')return '除息日前已持有的股票获得股息；本轮简化为除息日入账。';
  if(e.action==='EXPIRED')return `${e.right==='P'?'Put':'Call'} 价外到期，期权负债归零，${e.right==='P'?'现金':'股票'}继续保留。`;
  return e.reason?esc(e.reason):'';
}
function renderCycle(index){
  const cycle=state.payload?.cycles[index];
  if(!cycle){$('cycle-pnl').textContent='尚无已完成循环';$('cycle-timeline').replaceChildren();$('cycle-summary').textContent='此场景的全部事件仍可在下方账本查看。';return;}
  const stockEvents=cycle.events.filter(e=>['PUT_ASSIGNED','CALL_ASSIGNED'].includes(e.action));
  const credits=cycle.events.filter(e=>['SELL_PUT','SELL_CALL'].includes(e.action)).reduce((s,e)=>s+e.cash_flow,0);
  const dividends=cycle.events.filter(e=>e.action==='DIVIDEND').reduce((s,e)=>s+e.cash_flow,0);
  const stockPNL=stockEvents.reduce((s,e)=>s+e.cash_flow,0);
  $('cycle-pnl').innerHTML=`本轮已实现现金净损益<strong class="${colorClass(cycle.cash_pnl)}">${money(cycle.cash_pnl,true)}</strong>`;
  $('cycle-summary').innerHTML=`净权利金 <strong>${money(credits)}</strong> + 股票买卖差额 <strong class="${colorClass(stockPNL)}">${money(stockPNL,true)}</strong> + 股息 <strong>${money(dividends)}</strong> = 本轮净损益。`;
  $('cycle-timeline').innerHTML=cycle.events.map(e=>`<li><span class="date">${e.date}</span><div><strong class="event-title">${esc(eventNames[e.action]||e.action)}</strong><p class="event-note">${eventNote(e)}</p></div><div class="event-cash ${colorClass(e.cash_flow)}">${money(e.cash_flow,true)}<small>现金变化</small></div></li>`).join('');
}
function renderEvents(){if(!state.payload)return;const events=filterEvents(state.payload.events,$('event-filter').value), page=pageEvents(events,state.page);state.page=page.current;$('events-body').innerHTML=page.rows.map(e=>`<tr><td>${esc(e.date)}</td><td>${esc(eventNames[e.action]||e.action)}</td><td>${esc(contractLabel(e))}</td><td class="${colorClass(e.cash_flow)}">${money(e.cash_flow,true)}</td><td>${e.shares_after}</td></tr>`).join('')||'<tr><td colspan="5">此场景没有这类事件</td></tr>';$('events-page').textContent=`${page.current+1} / ${page.total} 页 · ${events.length} 条事件`;$('events-prev').disabled=page.current===0;$('events-next').disabled=page.current===page.total-1;}
function renderParameters(){const c=state.info.config,m=state.info.model;const values=[['初始资金',money(c.initial_cash)],['标的 / 乘数','SPY / 每张 100 股'],['目标到期日',`${c.target_dte} 天（${c.min_dte}–${c.max_dte} 天内）`],['目标绝对 Delta',c.target_delta.toFixed(2)],['Call 接货价下限',c.call_cost_floor?'启用':'不启用'],['模型波动率倍数',`${Math.round(m.vol_scale*100)}%`],['每张手续费',money(c.commission)],['bid 外滑点',`${money(c.slippage)}/股`],['模型半价差',`${pct(m.half_spread_pct)}，最低 $0.01`],['现金年利率',pct(c.cash_rate)],['模型定价利率',pct(m.rate)],['期末处理','ask 记负债，不强制平仓']];$('parameters').innerHTML=values.map(([k,v])=>`<div>${esc(k)}<strong>${esc(v)}</strong></div>`).join('');}

$('scenario-buttons').addEventListener('click',e=>{const b=e.target.closest('button[data-id]');if(b)loadScenario(b.dataset.id);});
$('day-slider').addEventListener('input',e=>selectDay(Number(e.target.value)));
$('selected-date').addEventListener('change',e=>{if(e.target.value&&state.days.length)selectDay(nearestDay(state.days,e.target.value));});
$('previous-day').addEventListener('click',()=>selectDay(state.day-1));$('next-day').addEventListener('click',()=>selectDay(state.day+1));
$('chart-mode').addEventListener('change',renderChart);$('show-full').addEventListener('change',renderChart);
$('cycle-select').addEventListener('change',e=>renderCycle(Number(e.target.value)));
$('event-filter').addEventListener('change',()=>{state.page=0;renderEvents();});
$('events-prev').addEventListener('click',()=>{state.page--;renderEvents();});$('events-next').addEventListener('click',()=>{state.page++;renderEvents();});
$('equity-chart').addEventListener('pointermove',e=>{if(!state.scale||e.pointerType==='touch')return;const rect=e.currentTarget.getBoundingClientRect();const xx=(e.clientX-rect.left)/rect.width*state.scale.width;selectDay((xx-state.scale.left)/state.scale.innerW*(state.days.length-1));});
$('equity-chart').addEventListener('click',e=>{if(!state.scale)return;const rect=e.currentTarget.getBoundingClientRect();selectDay(((e.clientX-rect.left)/rect.width*state.scale.width-state.scale.left)/state.scale.innerW*(state.days.length-1));});
new ResizeObserver(()=>renderChart()).observe($('equity-chart').parentElement);

async function start(){try{const r=await fetch('./data/manifest.json',{cache:'no-cache'});if(!r.ok)throw new Error('暂时无法读取研究目录');state.manifest=await r.json();if(state.manifest.schema!==1||state.manifest.evidence!=='MODEL-ONLY')throw new Error('研究目录版本不匹配');$('scenario-buttons').innerHTML=state.manifest.scenarios.map(s=>`<button type="button" class="scenario-button" data-id="${esc(s.id)}" aria-pressed="false"><span class="scenario-type">${esc(s.kind)}</span><strong>${esc(s.name)}</strong><span class="scenario-stat">总收益 ${pct(s.metrics.equity.total_return)} · 模型</span></button>`).join('');await loadScenario('baseline');}catch(error){status(`${error.message}，请稍后刷新。`,true);}}
start();
