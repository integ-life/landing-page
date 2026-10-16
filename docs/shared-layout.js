import './vendor/integ-ui-0.6.0/static.js';
const header = document.querySelector('header.site-header, header.masthead');
if (header) {
  const bar = document.createElement('integ-family-bar');
  bar.setAttribute('product',location.pathname.startsWith('/investment/') ? 'investment' : 'home');
  bar.setAttribute('locale',document.documentElement.lang || 'en');
  const actions = header.querySelector('.header-actions') || document.createElement('div');
  if (!actions.parentElement) { const back = header.querySelector('.back-link'); if (back) actions.append(back); }
  actions.setAttribute('data-il-actions','');
  actions.querySelector('.app-link')?.setAttribute('data-il-compact','account');
  actions.querySelectorAll('select').forEach(control => control.setAttribute('data-il-compact','language'));
  actions.querySelectorAll('a').forEach(link=>link.classList.add('il-control'));
  bar.append(actions);
  header.replaceWith(bar);
  new MutationObserver(()=>bar.setAttribute('locale',document.documentElement.lang || 'en')).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
}
