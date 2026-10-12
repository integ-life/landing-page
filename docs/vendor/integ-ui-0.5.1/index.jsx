import { useEffect, useId, useRef, useState } from 'react';
import { shellLabels, productGroups } from './labels.js';
import { logos } from './logos.js';
import { iconMarkup, controlTitle } from './icons.js';
export const uiVersion = '0.5.0';
const themeKey = 'integ-ui.appearance';
function readTheme() { try { const value=localStorage.getItem(themeKey); return ['light','dark','system'].includes(value) ? value : 'system'; } catch { return 'system'; } }
function useAppearance(enabled = true) {
  const [theme,setTheme]=useState(readTheme);
  useEffect(()=>{
    if (!enabled) return;
    const media=window.matchMedia?.('(prefers-color-scheme: dark)');
    const apply=()=>{document.documentElement.dataset.integTheme=theme==='system' ? (media?.matches?'dark':'light') : theme;};
    apply(); media?.addEventListener('change',apply);
    return()=>media?.removeEventListener('change',apply);
  },[theme,enabled]);
  useEffect(()=>{const update=event=>{if(event.key===themeKey)setTheme(readTheme());};window.addEventListener('storage',update);return()=>window.removeEventListener('storage',update);},[]);
  return [theme,value=>{setTheme(value);try{localStorage.setItem(themeKey,value);}catch{/* Origin storage may be disabled. */}}];
}
function Modal({open,onClose,title,closeLabel,children}) {
  const ref=useRef(null), titleId=useId();
  useEffect(()=>{
    if(!open)return;
    const previous=document.activeElement;
    ref.current?.showModal();
    return()=>{ref.current?.close();if(previous instanceof HTMLElement && previous.isConnected)previous.focus();};
  },[open]);
  return <dialog ref={ref} className="il-dialog" aria-labelledby={titleId} onCancel={onClose} onClose={onClose} onClick={event=>{if(event.target===ref.current){const box=ref.current.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)onClose();}}}>
    <div className="il-dialog-head"><h2 id={titleId}>{title}</h2><button type="button" className="il-control" onClick={onClose} aria-label={closeLabel}>×</button></div>{children}
  </dialog>;
}
function Icon({kind}) { return <span className="il-icon" aria-hidden="true" dangerouslySetInnerHTML={{__html:iconMarkup(kind)}}/>; }
export function CompactControl({kind,children,title}) {
  return <div className={`il-icon-slot il-icon-slot--${kind}`} title={title} onPointerEnter={event=>{if(!title)event.currentTarget.title=controlTitle(event.currentTarget);}} onFocusCapture={event=>{if(!title)event.currentTarget.title=controlTitle(event.currentTarget);}}><Icon kind={kind}/>{children}</div>;
}
export function FamilyBar({product,name,logo=logos[product],homeHref='/',onHome,locale='en',languageControl,account,accountControl,status,actions,appearanceControl}) {
  const labels=shellLabels(locale), [theme,setTheme]=useAppearance(appearanceControl === undefined);
  const [productsOpen,setProductsOpen]=useState(false), [accountOpen,setAccountOpen]=useState(false);
  return <>
    <header className="il-family-bar" data-ui-version={uiVersion}>
      <div className="il-identity"><button type="button" className="il-control il-switch" aria-haspopup="dialog" aria-expanded={productsOpen} aria-label={labels.products} title={`${name} · ${labels.products}`} onClick={()=>setProductsOpen(true)}><img src={logo} alt="" width="28" height="28"/></button></div>
      <div className="il-bar-actions">{actions}{languageControl&&<CompactControl kind="language">{languageControl}</CompactControl>}{appearanceControl === undefined ? <CompactControl kind="appearance" title={`${labels.appearance}: ${labels[theme]}`}><label className="il-appearance"><span className="il-sr-only">{labels.appearance}</span><select aria-label={labels.appearance} value={theme} onChange={event=>setTheme(event.target.value)}><option value="system">{labels.system}</option><option value="light">{labels.light}</option><option value="dark">{labels.dark}</option></select></label></CompactControl> : appearanceControl&&<CompactControl kind="appearance" title={labels.appearance}>{appearanceControl}</CompactControl>}{accountControl&&<CompactControl kind="account">{accountControl}</CompactControl>}{account&&<button type="button" className="il-control il-account" aria-haspopup="dialog" aria-expanded={accountOpen} aria-label={labels.account} title={`${labels.account} · ${account.name}`} onClick={()=>setAccountOpen(true)}><Icon kind="account"/><span className="il-session-dot" aria-hidden="true"/></button>}</div>
    </header>
    <Modal open={productsOpen} onClose={()=>setProductsOpen(false)} title={labels.products} closeLabel={labels.close}><a className="il-current-product" href={homeHref} onClick={event=>{setProductsOpen(false);if(onHome){event.preventDefault();onHome();}}}><img src={logo} alt="" width="28" height="28"/><strong>{name}</strong><span aria-hidden="true">↗</span></a>{status&&<p className="il-status">{status}</p>}<nav className="il-product-groups" aria-label={labels.products}>{productGroups(locale).map(group=><section className="il-product-group" key={group.id} aria-label={group.label}><h3>{group.label}</h3><div className="il-product-list">{group.products.map(item=><a key={item.id} href={item.href} aria-current={item.id===product?'page':undefined}><img src={item.logo} alt="" width="40" height="40"/><span className="il-product-copy"><strong>{item.name}</strong><small>{item.description}</small></span></a>)}</div></section>)}</nav><a className="il-home-link" href="https://integ.life/">{labels.home} ↗</a></Modal>
    {account&&<Modal open={accountOpen} onClose={()=>setAccountOpen(false)} title={labels.account} closeLabel={labels.close}><p className="il-account-label">{account.name}</p><a className="il-home-link" href="https://auth.integ.life/" target="_blank" rel="noopener noreferrer">{labels.manageAccount} ↗</a><button className="il-control il-signout" type="button" onClick={()=>{setAccountOpen(false);account.onSignOut();}}>{account.signOutLabel}</button></Modal>}
  </>;
}
export function ProductNav({items,selected,onSelect,locale='en',label}) {
  const labels=shellLabels(locale), [open,setOpen]=useState(false);
  const list=<nav className="il-nav" aria-label={label||labels.navigation}>{items.map(item=><button key={item.id} type="button" aria-current={item.id===selected?'page':undefined} onClick={()=>{setOpen(false);onSelect(item.id);}}>{item.icon&&<span className="il-nav-icon" aria-hidden="true">{item.icon}</span>}<span>{item.label}</span>{item.count!==undefined&&<small>{item.count}</small>}</button>)}</nav>;
  return <><aside className="il-sidebar"><p className="il-nav-label">{label||labels.navigation}</p>{list}<a className="il-home-link" href="https://integ.life/">Integ.Life ↗</a></aside><div className="il-mobile-nav"><button type="button" className="il-control" aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}><span aria-hidden="true">☰</span> {items.find(item=>item.id===selected)?.label || labels.navigation}</button></div><Modal open={open} onClose={()=>setOpen(false)} title={label||labels.navigation} closeLabel={labels.close}>{list}</Modal></>;
}
