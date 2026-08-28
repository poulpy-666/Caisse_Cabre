'use client';

import { useMemo, useState } from 'react';

const tickets = [
  ['Tarif plein', 20],
  ['Moins de 12 ans', 12],
  ['Moins de 3 ans', 0],
  ['Invitation', 0],
  ['PMR', 20],
];

const cashValues = [50,20,10,5,2,1,0.5,0.2,0.1,0.05,0.02,0.01];

const money = n => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(n || 0);

function NumberField({value,onChange,step='1',min='0'}) {
  return <input className="num" type="number" min={min} step={step} value={value} onChange={e=>onChange(Math.max(0, Number(e.target.value)||0))}/>;
}

export default function Home() {
  const [dark,setDark] = useState(false);
  const [eventName,setEventName] = useState('');
  const [date,setDate] = useState(new Date().toISOString().slice(0,10));
  const [opening,setOpening] = useState(Object.fromEntries(cashValues.map(v=>[v,0])));
  const [closing,setClosing] = useState(Object.fromEntries(cashValues.map(v=>[v,0])));
  const [qty,setQty] = useState(Object.fromEntries(tickets.map(([n])=>[n,0])));
  const [payments,setPayments] = useState({
    tpe:0, web:0, cheque:0, ancv:0, connect:0, autre:0
  });
  const [closed,setClosed] = useState(false);

  const openingCash = useMemo(()=>cashValues.reduce((s,v)=>s+v*opening[v],0),[opening]);
  const closingCash = useMemo(()=>cashValues.reduce((s,v)=>s+v*closing[v],0),[closing]);
  const ca = useMemo(()=>tickets.reduce((s,[n,p])=>s+p*qty[n],0),[qty]);
  const paymentsTotal = closingCash-openingCash + Object.values(payments).reduce((a,b)=>a+b,0);
  const cashSales = closingCash-openingCash;
  const difference = paymentsTotal-ca;
  const expectedCash = openingCash+cashSales;

  const setCount=(setter,key,value)=>setter(prev=>({...prev,[key]:value}));

  function reset() {
    setOpening(Object.fromEntries(cashValues.map(v=>[v,0])));
    setClosing(Object.fromEntries(cashValues.map(v=>[v,0])));
    setQty(Object.fromEntries(tickets.map(([n])=>[n,0])));
    setPayments({tpe:0,web:0,cheque:0,ancv:0,connect:0,autre:0});
    setClosed(false);
  }

  return (
    <main className={dark?'dark':''}>
      <div className="wrap">
        <header>
          <div>
            <div className="eyebrow">BILLETTERIE ASSOCIATIVE</div>
            <h1>Clôture de caisse</h1>
            <p>Ouverture → comptage → fermeture → contrôle.</p>
          </div>
          <button className="theme" onClick={()=>setDark(!dark)} aria-label="Changer de thème">{dark?'☀️':'🌙'}</button>
        </header>

        <section className="card">
          <h2>1. Ouverture de caisse</h2>
          <div className="grid2">
            <label>Manifestation<input value={eventName} onChange={e=>setEventName(e.target.value)} placeholder="Nom de la manifestation"/></label>
            <label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
          </div>
          <h3>Fond de caisse</h3>
          <div className="cashgrid">{cashValues.map(v=><div className="cashrow" key={'o'+v}><span>{money(v)}</span><NumberField value={opening[v]} onChange={x=>setCount(setOpening,v,x)}/><strong>{money(v*opening[v])}</strong></div>)}</div>
          <div className="totalline"><span>Fond de caisse initial</span><strong>{money(openingCash)}</strong></div>
        </section>

        <section className="card">
          <h2>2. Billetterie</h2>
          <p className="muted">Saisis uniquement le nombre de billets vendus.</p>
          <div className="ticketgrid">{tickets.map(([n,p])=><div className="ticket" key={n}><div><strong>{n}</strong><span>{money(p)}</span></div><NumberField value={qty[n]} onChange={x=>setCount(setQty,n,x)}/><b>{money(p*qty[n])}</b></div>)}</div>
          <div className="caBox"><span>CA billetterie</span><strong>{money(ca)}</strong></div>
        </section>

        <section className="card">
          <h2>3. Fermeture — espèces</h2>
          <p className="muted">Compte les espèces présentes dans la caisse.</p>
          <div className="cashgrid">{cashValues.map(v=><div className="cashrow" key={'c'+v}><span>{money(v)}</span><NumberField value={closing[v]} onChange={x=>setCount(setClosing,v,x)}/><strong>{money(v*closing[v])}</strong></div>)}</div>
          <div className="totalline"><span>Espèces en caisse</span><strong>{money(closingCash)}</strong></div>
          <div className="info">Espèces issues de la billetterie : <strong>{money(cashSales)}</strong> (espèces finales − fond initial)</div>
        </section>

        <section className="card">
          <h2>4. Autres moyens de paiement</h2>
          <div className="paymentgrid">
            <label>CB Guichet — TPE<NumberField step="0.01" value={payments.tpe} onChange={x=>setCount(setPayments,'tpe',x)}/></label>
            <label>CB Web<NumberField step="0.01" value={payments.web} onChange={x=>setCount(setPayments,'web',x)}/></label>
            <label>Chèques<NumberField step="0.01" value={payments.cheque} onChange={x=>setCount(setPayments,'cheque',x)}/></label>
            <label>Chèques-Vacances ANCV<NumberField step="0.01" value={payments.ancv} onChange={x=>setCount(setPayments,'ancv',x)}/></label>
            <label>Chèques-Vacances Connect<NumberField step="0.01" value={payments.connect} onChange={x=>setCount(setPayments,'connect',x)}/></label>
            <label>Autre<NumberField step="0.01" value={payments.autre} onChange={x=>setCount(setPayments,'autre',x)}/></label>
          </div>
        </section>

        <section className="result">
          <div><span>CA billetterie</span><strong>{money(ca)}</strong></div>
          <div><span>Total encaissé</span><strong>{money(paymentsTotal)}</strong></div>
          <div className={Math.abs(difference)<0.005?'ok':'bad'}><span>Écart</span><strong>{money(difference)}</strong></div>
          <div className="actions"><button className="primary" onClick={()=>setClosed(true)}>Clôturer la caisse</button><button onClick={reset}>Nouvelle caisse</button>{closed&&<button onClick={()=>window.print()}>Imprimer</button>}</div>
          {closed&&<div className="closed">✓ Caisse clôturée — {eventName || 'Manifestation'} — {date}</div>}
        </section>
      </div>
    </main>
  );
}
