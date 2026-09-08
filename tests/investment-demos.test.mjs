import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {strategies,profitParts,demoSeries,nextMonthIndex,validateDemo} from '../docs/investment/demo-core.mjs';
const read=id=>JSON.parse(fs.readFileSync(new URL(`../docs/investment/data/demos/${id}.json`,import.meta.url)));
const manifest=read('manifest');
test('all twelve independent cases reconcile daily assets, funding, TWR and monthly profits',()=>{
  for(const info of manifest.runs){const p=read(info.id);const days=validateDemo(p);assert.deepEqual(p.stats,info.stats);assert.equal(days.at(-1).contributed,100000+(p.funding.id==='monthly'?(p.monthly.length-1)*1000:0));}
});
test('2020 crash illustrates premium receipts despite a material account loss',()=>{
  const p=read('crash_2020-reserve'),days=validateDemo(p),day=days.find(d=>d.date==='2020-03-23');
  assert(day.wheel_premiums>0);assert(day.wheel_net_pnl<-7000);
  assert(Math.abs(profitParts(day).reduce((a,b)=>a+b,0)-day.wheel_net_pnl)<1e-7);
  assert.equal(p.stats.wheel.recovery_date,'2020-05-18');
  assert(p.stats.wheel.net_pnl>20000);
});
test('monthly contributions are actually booked but never counted as investment profit',()=>{
  const reserve=read('long_run-reserve'),monthly=read('long_run-monthly');
  assert.equal(monthly.stats.wheel.contributed,195000);
  assert(Math.abs(monthly.stats.wheel.final_equity-reserve.stats.wheel.final_equity-95000)<1e-6);
  assert(Math.abs(monthly.stats.wheel.net_pnl-reserve.stats.wheel.net_pnl)<1e-6);
  assert.notEqual(monthly.stats.wheel.total_return,reserve.stats.wheel.total_return);
  const days=validateDemo(monthly);
  assert.equal(demoSeries(days,'equity').at(-1).values.at(-1),195000);
  assert.equal(demoSeries(days,'net_pnl')[0].values.at(-1),monthly.stats.wheel.net_pnl);
});
test('long case preserves existing Wheel result, while an independently restarted 2020 case has its own holdings',()=>{
  const original=JSON.parse(fs.readFileSync(new URL('../docs/investment/data/manifest.json',import.meta.url)));
  const baseline=original.scenarios.find(s=>s.id==='baseline');
  const long=read('long_run-reserve');assert(Math.abs(long.stats.wheel.final_equity-baseline.metrics.equity.final_equity)<.001);
  const short=validateDemo(read('crash_2020-reserve'));
  assert.equal(short[0].wheel_equity,100000);assert.equal(short[0].wheel_shares,0);
  const continued=validateDemo(long).find(d=>d.date===short[0].date);
  assert.notEqual(continued.wheel_equity,short[0].wheel_equity);
});
test('2022 example retains losses across year boundary and all unexpired liabilities',()=>{
  const p=read('bear_2022-reserve'),days=validateDemo(p),first2023=days.find(d=>d.date.startsWith('2023'));
  assert(first2023.wheel_net_pnl<0);assert(p.stats.wheel.longest_losing_streak_sessions>200);
  assert(days.at(-1).wheel_option_liability>0);assert.equal(p.ending_options.wheel.expiry,'2024-01-05');
});
test('tampered deposits, decomposition and monthly summaries are rejected',()=>{
  for(const change of [p=>p.daily[2][p.columns.indexOf('deposit')]+=1000,p=>p.daily[20][p.columns.indexOf('wheel_premiums')]+=50,p=>p.monthly[0].dca_profit+=100]){
    const p=read('crash_2020-reserve');change(p);assert.throws(()=>validateDemo(p));
  }
});
test('monthly playback visits current month-end first, advances and stops at final session',()=>{
  const days=[{date:'2020-01-02'},{date:'2020-01-31'},{date:'2020-02-03'},{date:'2020-02-28'},{date:'2020-03-02'}];
  assert.equal(nextMonthIndex(days,0),1);assert.equal(nextMonthIndex(days,1),3);assert.equal(nextMonthIndex(days,3),4);assert.equal(nextMonthIndex(days,4),4);
});
test('drawdown chart matches reported worst drawdown for every strategy and funding plan',()=>{
  for(const funding of ['reserve','monthly']){
    const p=read(`crash_2020-${funding}`),days=validateDemo(p),series=demoSeries(days,'drawdown');
    for(const {id} of strategies)assert(Math.abs(Math.min(...series.find(s=>s.id===id).values)-p.stats[id].max_drawdown)<1e-10);
  }
});
