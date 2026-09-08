export const eventNames = { SIGNAL: '形成信号', SELL_PUT: '卖出 Put', SELL_CALL: '卖出 Call', PUT_ASSIGNED: 'Put 接货', CALL_ASSIGNED: 'Call 股票交割', EXPIRED: '期权价外到期', DIVIDEND: '收到股息', CASH_INTEREST: '现金利息', ORDER_SKIPPED: '跳过开仓', NO_CANDIDATE: '没有合适合约' };
export const stateNames = { CASH: '持有现金', SHORT_PUT: '现金担保卖 Put', STOCK: '持有 100 股', COVERED_CALL: '股票 + 备兑 Call' };
export function escapeHTML(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
export function pct(n, signed = false) { return `${signed && n > 0 ? '+' : ''}${(n * 100).toFixed(2)}%`; }
export function money(n, signed = false) { return `${n < 0 ? '−' : signed && n > 0 ? '+' : ''}$${Math.abs(n).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`; }
export function drawdowns(values, initial) { let peak = initial; return values.map(v => { peak = Math.max(peak, v); return v / peak - 1; }); }
export function decodeDaily(payload) { return payload.daily.map(values => Object.fromEntries(payload.columns.map((key, i) => [key, values[i]]))); }
export function nearestDay(days, date) { let lo = 0, hi = days.length - 1; while(lo < hi) { const mid = Math.ceil((lo + hi) / 2); if(days[mid].date <= date) lo = mid; else hi = mid - 1; } return lo; }
export function filterEvents(events, filter) { const groups = {trades:['SELL_PUT','SELL_CALL'],assignments:['PUT_ASSIGNED','CALL_ASSIGNED'],signals:['SIGNAL'],dividends:['DIVIDEND']}; return groups[filter] ? events.filter(e => groups[filter].includes(e.action)) : events; }
export function pageEvents(events, page, size = 20) { const total = Math.max(1, Math.ceil(events.length / size)); const current = Math.max(0, Math.min(page, total - 1)); return {rows: events.slice(current * size, (current + 1) * size), current, total}; }
export function seriesForChart(days, initial, mode, showFull) { return ['equity','buy_hold_100', ...(showFull ? ['buy_hold'] : [])].map(key => ({key, values: mode === 'drawdown' ? drawdowns(days.map(d => d[key]), initial) : days.map(d => d[key] / initial - 1)})); }
export function validateData(info, payload) {
  const days = decodeDaily(payload);
  if (info.evidence !== 'MODEL-ONLY' || days.length !== info.sessions || days[0]?.date !== info.actual_start || days.at(-1)?.date !== info.actual_end) throw new Error('研究快照的日期或数据等级不一致');
  if (Math.abs(days.at(-1).equity - info.metrics.equity.final_equity) > .001) throw new Error('期末净值与摘要不一致');
  for (let i = 0; i < days.length; i++) { const d = days[i]; if (i && d.date <= days[i-1].date) throw new Error('交易日顺序异常'); if (![d.equity,d.cash,d.shares,d.spot,d.option_liability].every(Number.isFinite) || Math.abs(d.equity - d.cash - d.shares*d.spot + d.option_liability) > .001) throw new Error('逐日净值无法对账'); }
  for(const cycle of payload.cycles) { const pnl = cycle.events.reduce((sum,e) => sum + e.cash_flow, 0); if(Math.abs(pnl - cycle.cash_pnl) > .001) throw new Error('接货循环无法对账'); }
  return days;
}
