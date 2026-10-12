import type { ReactNode } from 'react';
export const uiVersion: string;
export function FamilyBar(props: {product:string;name:string;logo?:string;homeHref?:string;onHome?:()=>void;locale?:string;languageControl?:ReactNode;accountControl?:ReactNode;account?:{name:string;signOutLabel:string;onSignOut:()=>void};status?:string;actions?:ReactNode;appearanceControl?:ReactNode}): ReactNode;
export function ProductNav(props: {items:{id:string;label:string;icon?:string;count?:string|number}[];selected:string;onSelect:(id:string)=>void;locale?:string;label?:string}): ReactNode;

export function CompactControl(props:{kind:"language"|"appearance"|"account";children:ReactNode;title?:string}): ReactNode;
