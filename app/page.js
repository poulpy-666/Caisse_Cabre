'use client';

import { useMemo, useState } from 'react';
import { supabase } from './lib/supabase';

const tickets = [
  ['Tarif plein', 20],
  ['Moins de 12 ans', 12],
  ['Moins de 3 ans', 0],
  ['Invitation', 0],
  ['PMR', 20],
];

const cashValues = [
  50, 20, 10, 5,
  2, 1,
  0.5, 0.2, 0.1,
  0.05, 0.02, 0.01
];

const ancvValues = [10, 20, 25, 50];

const money = n =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(n || 0);

function NumberField({
  value,
  onChange,
  step = '1',
  min = '0'
}) {
  return (
    <input
      className="num"
      type="number"
      min={min}
      step={step}
      value={value}
      onChange={e =>
        onChange(
          Math.max(
            0,
            Number(e.target.value) || 0
          )
        )
      }
    />
  );
}

function createEmptyMultiple() {
  return {
    amount: 0,
    allocations: {
      cash: 0,
      tpe: 0,
      web: 0,
      cheque: 0,
      ancv: 0,
      connect: 0,
      autre: 0
    }
  };
}

export default function Home() {
  const [dark, setDark] = useState(false);

  const [eventName, setEventName] = useState('');

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  /* =========================
     OUVERTURE
  ========================= */

  const [opening, setOpening] = useState(
    Object.fromEntries(
      cashValues.map(v => [v, 0])
    )
  );

  /* =========================
     FERMETURE
  ========================= */

  const [closing, setClosing] = useState(
    Object.fromEntries(
      cashValues.map(v => [v, 0])
    )
  );

  /* =========================
     BILLETS
  ========================= */

  const [qty, setQty] = useState(
    Object.fromEntries(
      tickets.map(([name]) => [name, 0])
    )
  );

  /* =========================
     ANCV
  ========================= */

  const [ancv, setAncv] = useState(
    Object.fromEntries(
      ancvValues.map(v => [v, 0])
    )
  );

  /* =========================
     AUTRES PAIEMENTS
  ========================= */

  const [payments, setPayments] = useState({
    tpe: 0,
    web: 0,
    cheque: 0,
    connect: 0,
    autre: 0
  });

  const [paymentsValidated, setPaymentsValidated] =
    useState(false);

  /* =========================
     PAIEMENTS MULTIPLES
  ========================= */

  const [multipleDraft, setMultipleDraft] =
    useState(null);

  const [multiplePayments, setMultiplePayments] =
    useState([]);

  /* =========================
     CAISSE
  ========================= */

  const [closed, setClosed] = useState(false);
  const [saving, setSaving] = useState(false);

  /* =========================
     CALCULS ESPÈCES
  ========================= */

  const openingCash = useMemo(
    () =>
      cashValues.reduce(
        (sum, value) =>
          sum + value * opening[value],
        0
      ),
    [opening]
  );

  const closingCash = useMemo(
    () =>
      cashValues.reduce(
        (sum, value) =>
          sum + value * closing[value],
        0
      ),
    [closing]
  );

  const cashBills = useMemo(
    () =>
      [50, 20, 10, 5].reduce(
        (sum, value) =>
          sum + value * closing[value],
        0
      ),
    [closing]
  );

  const cashCoins = useMemo(
    () =>
      [
        2,
        1,
        0.5,
        0.2,
        0.1,
        0.05,
        0.02,
        0.01
      ].reduce(
        (sum, value) =>
          sum + value * closing[value],
        0
      ),
    [closing]
  );

  const cashSales =
    closingCash - openingCash;

  /* =========================
     CA
  ========================= */

  const ca = useMemo(
    () =>
      tickets.reduce(
        (sum, [name, price]) =>
          sum + price * qty[name],
        0
      ),
    [qty]
  );

  /* =========================
     ANCV DIRECT
  ========================= */

  const ancvDirectTotal = useMemo(
    () =>
      ancvValues.reduce(
        (sum, value) =>
          sum + value * ancv[value],
        0
      ),
    [ancv]
  );

  /* =========================
     PAIEMENTS MULTIPLES
  ========================= */

  const multipleCash = useMemo(
    () =>
      multiplePayments.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.allocations.cash || 0
          ),
        0
      ),
    [multiplePayments]
  );

  const multipleTpe = useMemo(
    () =>
      multiplePayments.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.allocations.tpe || 0
          ),
        0
      ),
    [multiplePayments]
  );

  const multipleWeb = useMemo(
    () =>
      multiplePayments.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.allocations.web || 0
          ),
        0
      ),
    [multiplePayments]
  );

  const multipleCheque = useMemo(
    () =>
      multiplePayments.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.allocations.cheque || 0
          ),
        0
      ),
    [multiplePayments]
  );

  const multipleAncv = useMemo(
    () =>
      multiplePayments.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.allocations.ancv || 0
          ),
        0
      ),
    [multiplePayments]
  );

  const multipleConnect = useMemo(
    () =>
      multiplePayments.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.allocations.connect || 0
          ),
        0
      ),
    [multiplePayments]
  );

  const multipleAutre = useMemo(
    () =>
      multiplePayments.reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.allocations.autre || 0
          ),
        0
      ),
    [multiplePayments]
  );

  const ancvTotal =
    ancvDirectTotal + multipleAncv;

  const paymentsTotal =
    cashSales +
    payments.tpe +
    payments.web +
    payments.cheque +
    ancvDirectTotal +
    payments.connect +
    payments.autre +
    multipleTpe +
    multipleWeb +
    multipleCheque +
    multipleAncv +
    multipleConnect +
    multipleAutre;

  const difference =
    paymentsTotal - ca;

  /* =========================
     PAIEMENT MULTIPLE EN COURS
  ========================= */

  const multipleAllocated =
    multipleDraft
      ? Object.values(
          multipleDraft.allocations
        ).reduce(
          (sum, value) =>
            sum + Number(value || 0),
          0
        )
      : 0;

  const multipleIsValid =
    multipleDraft &&
    Number(multipleDraft.amount || 0) > 0 &&
    Math.abs(
      multipleAllocated -
        Number(multipleDraft.amount || 0)
    ) < 0.005;

  /* =========================
     OUTILS
  ========================= */

  const setCount = (
    setter,
    key,
    value
  ) => {
    setter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  function reset() {
    setOpening(
      Object.fromEntries(
        cashValues.map(v => [v, 0])
      )
    );

    setClosing(
      Object.fromEntries(
        cashValues.map(v => [v, 0])
      )
    );

    setQty(
      Object.fromEntries(
        tickets.map(([name]) => [
          name,
          0
        ])
      )
    );

    setAncv(
      Object.fromEntries(
        ancvValues.map(v => [v, 0])
      )
    );

    setPayments({
      tpe: 0,
      web: 0,
      cheque: 0,
      connect: 0,
      autre: 0
    });

    setPaymentsValidated(false);

    setMultipleDraft(null);
    setMultiplePayments([]);

    setClosed(false);
    setSaving(false);
  }

  function startMultiple() {
    if (multipleDraft) return;

    setMultipleDraft(
      createEmptyMultiple()
    );
  }

  function updateMultipleAmount(value) {
    setMultipleDraft(prev => ({
      ...prev,
      amount: value
    }));
  }

  function updateMultipleAllocation(
    type,
    value
  ) {
    setMultipleDraft(prev => ({
      ...prev,
      allocations: {
        ...prev.allocations,
        [type]: value
      }
    }));
  }

  function validateMultiple() {
    if (!multipleDraft) return;

    const amount =
      Number(
        multipleDraft.amount || 0
      );

    const allocated =
      Object.values(
        multipleDraft.allocations
      ).reduce(
        (sum, value) =>
          sum + Number(value || 0),
        0
      );

    if (amount <= 0) {
      alert(
        'Indique le montant de la transaction.'
      );
      return;
    }

    if (
      Math.abs(
        amount - allocated
      ) > 0.005
    ) {
      alert(
        `La répartition doit correspondre exactement au montant de la transaction.\n\nTransaction : ${money(
          amount
        )}\nRéparti : ${money(
          allocated
        )}`
      );
      return;
    }

    setMultiplePayments(prev => [
      ...prev,
      {
        id:
          Date.now() +
          Math.random(),
        amount,
        allocations: {
          ...multipleDraft.allocations
        }
      }
    ]);

    setMultipleDraft(null);
  }

  function editMultiple(id) {
    const payment =
      multiplePayments.find(
        p => p.id === id
      );

    if (!payment) return;

    setMultipleDraft({
      amount: payment.amount,
      allocations: {
        ...payment.allocations
      }
    });

    setMultiplePayments(prev =>
      prev.filter(
        p => p.id !== id
      )
    );
  }

  function removeMultiple(id) {
    setMultiplePayments(prev =>
      prev.filter(
        p => p.id !== id
      )
    );
  }

  async function closeCash() {
    if (multipleDraft) {
      alert(
        'Termine ou annule le paiement multiple en cours.'
      );
      return;
    }

    if (!paymentsValidated) {
      alert(
        'Valide les moyens de paiement avant de clôturer la caisse.'
      );
      return;
    }

    setSaving(true);

    const caisseData = {
      event_name: eventName || null,
      date,

      ca_data: {
        tickets,
        quantities: qty,
        total: ca
      },

      opening_data: {
        denominations: opening,
        total: openingCash
      },

      closing_data: {
        denominations: closing,
        total: closingCash,
        bills_total: cashBills,
        coins_total: cashCoins,
        cash_sales: cashSales
      },

      payments_data: {
        simple: {
          tpe: payments.tpe,
          web: payments.web,
          cheque: payments.cheque,
          ancv: ancvDirectTotal,
          connect: payments.connect,
          autre: payments.autre
        },

        ancv_by_value: ancv,

        totals: {
          ancv: ancvTotal,
          cash: cashSales,
          cash_multiple: multipleCash,
          tpe:
            payments.tpe +
            multipleTpe,
          web:
            payments.web +
            multipleWeb,
          cheque:
            payments.cheque +
            multipleCheque,
          connect:
            payments.connect +
            multipleConnect,
          autre:
            payments.autre +
            multipleAutre
        }
      },

      multiple_payments:
        multiplePayments,

      total_ca: ca,
      total_encaisse:
        paymentsTotal,
      difference
    };

    const { error } =
      await supabase
        .from('caisses')
        .insert(caisseData);

    setSaving(false);

    if (error) {
      console.error(
        'Erreur sauvegarde caisse:',
        error
      );

      alert(
        `Impossible de sauvegarder la caisse.\n\n${error.message}`
      );

      return;
    }

    setClosed(true);
  }

  return (
    <main
      className={
        dark ? 'dark' : ''
      }
    >
      <div className="wrap">

        {/* HEADER */}

        <header>
          <div>
            <div className="eyebrow">
              BILLETTERIE ASSOCIATIVE
            </div>

            <h1>
              Clôture de caisse
            </h1>

            <p>
              Ouverture → comptage → fermeture → contrôle.
            </p>
          </div>

          <button
            className="theme"
            onClick={() =>
              setDark(!dark)
            }
            aria-label="Changer de thème"
          >
            {dark
              ? '☀️'
              : '🌙'}
          </button>
        </header>

        {/* =========================
            1. OUVERTURE
        ========================= */}

        <section className="card">

          <h2>
            1. Ouverture de caisse
          </h2>

          <div className="grid2">

            <label>
              Manifestation

              <input
                value={eventName}
                onChange={e =>
                  setEventName(
                    e.target.value
                  )
                }
                placeholder="Nom de la manifestation"
              />
            </label>

            <label>
              Date

              <input
                type="date"
                value={date}
                onChange={e =>
                  setDate(
                    e.target.value
                  )
                }
              />
            </label>

          </div>

          <h3>
            Fond de caisse
          </h3>

          <div className="cashgrid">

            {cashValues.map(value => (

              <div
                className="cashrow"
                key={
                  'opening' +
                  value
                }
              >

                <span>
                  {money(value)}
                </span>

                <NumberField
                  value={
                    opening[value]
                  }
                  onChange={x =>
                    setCount(
                      setOpening,
                      value,
                      x
                    )
                  }
                />

                <strong>
                  {money(
                    value *
                      opening[value]
                  )}
                </strong>

              </div>

            ))}

          </div>

          <div className="totalline">

            <span>
              Fond de caisse initial
            </span>

            <strong>
              {money(
                openingCash
              )}
            </strong>

          </div>

        </section>

        {/* =========================
            2. BILLETTERIE
        ========================= */}

        <section className="card">

          <h2>
            2. Billetterie
          </h2>

          <p className="muted">
            Saisis uniquement le nombre de billets vendus.
          </p>

          <div className="ticketgrid">

            {tickets.map(
              ([name, price]) => (

                <div
                  className="ticket"
                  key={name}
                >

                  <div>

                    <strong>
                      {name}
                    </strong>

                    <span>
                      {money(price)}
                    </span>

                  </div>

                  <NumberField
                    value={
                      qty[name]
                    }
                    onChange={x =>
                      setCount(
                        setQty,
                        name,
                        x
                      )
                    }
                  />

                  <b>
                    {money(
                      price *
                        qty[name]
                    )}
                  </b>

                </div>

              )
            )}

          </div>

          <div className="caBox">

            <span>
              CA billetterie
            </span>

            <strong>
              {money(ca)}
            </strong>

          </div>

        </section>

        {/* =========================
            3. FERMETURE ESPECES
        ========================= */}

        <section className="card">

          <h2>
            3. Fermeture — espèces
          </h2>

          <p className="muted">
            Compte les espèces présentes dans la caisse.
          </p>

          <div className="cashgrid">

            {cashValues.map(value => (

              <div
                className="cashrow"
                key={
                  'closing' +
                  value
                }
              >

                <span>
                  {money(value)}
                </span>

                <NumberField
                  value={
                    closing[value]
                  }
                  onChange={x =>
                    setCount(
                      setClosing,
                      value,
                      x
                    )
                  }
                />

                <strong>
                  {money(
                    value *
                      closing[value]
                  )}
                </strong>

              </div>

            ))}

          </div>

          <div className="totalline">

            <span>
              Espèces en caisse
            </span>

            <strong>
              {money(
                closingCash
              )}
            </strong>

          </div>

          <div className="info">

            Fond initial :{' '}

            <strong>
              {money(
                openingCash
              )}
            </strong>

            {' — '}

            Espèces issues des ventes :{' '}

            <strong>
              {money(
                cashSales
              )}
            </strong>

          </div>

        </section>

        {/* =========================
            4. MOYENS DE PAIEMENT
        ========================= */}

        <section className="card">

          <h2>
            4. Moyens de paiement
          </h2>

          {!paymentsValidated ? (

            <>

              <div className="paymentgrid">

                <label>
                  CB Guichet — TPE

                  <NumberField
                    step="0.01"
                    value={
                      payments.tpe
                    }
                    onChange={x =>
                      setCount(
                        setPayments,
                        'tpe',
                        x
                      )
                    }
                  />

                </label>

                <label>
                  CB Web

                  <NumberField
                    step="0.01"
                    value={
                      payments.web
                    }
                    onChange={x =>
                      setCount(
                        setPayments,
                        'web',
                        x
                      )
                    }
                  />

                </label>

                <label>
                  Chèques

                  <NumberField
                    step="0.01"
                    value={
                      payments.cheque
                    }
                    onChange={x =>
                      setCount(
                        setPayments,
                        'cheque',
                        x
                      )
                    }
                  />

                </label>

                <label>
                  Chèques-Vacances Connect

                  <NumberField
                    step="0.01"
                    value={
                      payments.connect
                    }
                    onChange={x =>
                      setCount(
                        setPayments,
                        'connect',
                        x
                      )
                    }
                  />

                </label>

                <label>
                  Autre

                  <NumberField
                    step="0.01"
                    value={
                      payments.autre
                    }
                    onChange={x =>
                      setCount(
                        setPayments,
                        'autre',
                        x
                      )
                    }
                  />

                </label>

              </div>

              <button
                type="button"
                className="primary"
                onClick={() =>
                  setPaymentsValidated(
                    true
                  )
                }
              >
                ✓ Valider les moyens de paiement
              </button>

            </>

          ) : (

            <>

              <div className="info">

                <strong>
                  Moyens de paiement validés ✓
                </strong>

              </div>

              <div className="paymentSummary">

                <div>
                  <span>
                    CB TPE
                  </span>

                  <strong>
                    {money(
                      payments.tpe
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    CB Web
                  </span>

                  <strong>
                    {money(
                      payments.web
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Chèques
                  </span>

                  <strong>
                    {money(
                      payments.cheque
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    ANCV Connect
                  </span>

                  <strong>
                    {money(
                      payments.connect
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Autre
                  </span>

                  <strong>
                    {money(
                      payments.autre
                    )}
                  </strong>
                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setPaymentsValidated(
                    false
                  )
                }
              >
                ✏️ Modifier
              </button>

            </>

          )}

          <h3>
            Chèques-Vacances ANCV
          </h3>

          <div className="cashgrid">

            {ancvValues.map(value => (

              <div
                className="cashrow"
                key={
                  'ancv' +
                  value
                }
              >

                <span>
                  {money(value)}
                </span>

                <NumberField
                  value={
                    ancv[value]
                  }
                  onChange={x =>
                    setCount(
                      setAncv,
                      value,
                      x
                    )
                  }
                />

                <strong>
                  {money(
                    value *
                      ancv[value]
                  )}
                </strong>

              </div>

            ))}

          </div>

          <div className="totalline">

            <span>
              ANCV directs
            </span>

            <strong>
              {money(
                ancvDirectTotal
              )}
            </strong>

          </div>

        </section>

        {/* =========================
            5. PAIEMENTS MULTIPLES
        ========================= */}

        <section className="card">

          <h2>
            5. Paiements multiples
          </h2>

          <p className="muted">
            Pour une vente réglée avec plusieurs moyens de paiement.
          </p>

          {multiplePayments.map(
            (payment, index) => (

              <div
                className="multiple"
                key={payment.id}
              >

                <div className="multipleHeader">

                  <strong>
                    Paiement multiple #
                    {index + 1}
                  </strong>

                  <div>

                    <button
                      type="button"
                      onClick={() =>
                        editMultiple(
                          payment.id
                        )
                      }
                    >
                      ✏️
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        removeMultiple(
                          payment.id
                        )
                      }
                    >
                      🗑️
                    </button>

                  </div>

                </div>

                <div className="info">

                  <strong>
                    {money(
                      payment.amount
                    )}
                  </strong>

                  {' → '}

                  {payment.allocations.cash > 0 && (
                    <>
                      Espèces :{' '}
                      {money(
                        payment.allocations.cash
                      )}{' '}
                    </>
                  )}

                  {payment.allocations.tpe > 0 && (
                    <>
                      TPE :{' '}
                      {money(
                        payment.allocations.tpe
                      )}{' '}
                    </>
                  )}

                  {payment.allocations.web > 0 && (
                    <>
                      CB Web :{' '}
                      {money(
                        payment.allocations.web
                      )}{' '}
                    </>
                  )}

                  {payment.allocations.cheque > 0 && (
                    <>
                      Chèque :{' '}
                      {money(
                        payment.allocations.cheque
                      )}{' '}
                    </>
                  )}

                  {payment.allocations.ancv > 0 && (
                    <>
                      ANCV :{' '}
                      {money(
                        payment.allocations.ancv
                      )}{' '}
                    </>
                  )}

                  {payment.allocations.connect > 0 && (
                    <>
                      ANCV Connect :{' '}
                      {money(
                        payment.allocations.connect
                      )}{' '}
                    </>
                  )}

                  {payment.allocations.autre > 0 && (
                    <>
                      Autre :{' '}
                      {money(
                        payment.allocations.autre
                      )}
                    </>
                  )}

                </div>

              </div>

            )
          )}

          {!multipleDraft ? (

            <button
              type="button"
              onClick={startMultiple}
            >
              ＋ Nouveau paiement multiple
            </button>

          ) : (

            <div className="multiple">

              <div className="multipleHeader">

                <strong>
                  Nouveau paiement multiple
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    setMultipleDraft(
                      null
                    )
                  }
                >
                  Annuler
                </button>

              </div>

              <label>

                Montant de la transaction

                <NumberField
                  step="0.01"
                  value={
                    multipleDraft.amount
                  }
                  onChange={
                    updateMultipleAmount
                  }
                />

              </label>

              <h3>
                Répartition
              </h3>

              <div className="paymentgrid">

                {[
                  ['cash', 'Espèces'],
                  ['tpe', 'CB Guichet — TPE'],
                  ['web', 'CB Web'],
                  ['cheque', 'Chèque'],
                  ['ancv', 'ANCV'],
                  ['connect', 'ANCV Connect'],
                  ['autre', 'Autre']
                ].map(
                  ([type, label]) => (

                    <label key={type}>

                      {label}

                      <NumberField
                        step="0.01"
                        value={
                          multipleDraft
                            .allocations[
                              type
                            ]
                        }
                        onChange={value =>
                          updateMultipleAllocation(
                            type,
                            value
                          )
                        }
                      />

                    </label>

                  )
                )}

              </div>

              <div
                className={
                  multipleIsValid
                    ? 'info'
                    : 'info bad'
                }
              >

                Montant de la transaction :{' '}

                <strong>
                  {money(
                    multipleDraft.amount
                  )}
                </strong>

                <br />

                Montant réparti :{' '}

                <strong>
                  {money(
                    multipleAllocated
                  )}
                </strong>

                <br />

                {multipleIsValid
                  ? '✓ Répartition correcte'
                  : '⚠️ La répartition doit correspondre au montant de la transaction'}

              </div>

              <button
                type="button"
                className="primary"
                disabled={
                  !multipleIsValid
                }
                onClick={
                  validateMultiple
                }
              >
                ✓ Valider le paiement multiple
              </button>

            </div>

          )}

          {multiplePayments.length > 0 && (

            <div className="totalline">

              <span>
                Total paiements multiples
              </span>

              <strong>
                {money(
                  multiplePayments.reduce(
                    (sum, payment) =>
                      sum +
                      Number(
                        payment.amount ||
                        0
                      ),
                    0
                  )
                )}
              </strong>

            </div>

          )}

        </section>

        {/* =========================
            RESULTATS
        ========================= */}

        <section className="result">

          <div>
            <span>
              CA billetterie
            </span>

            <strong>
              {money(ca)}
            </strong>
          </div>

          <div>
            <span>
              Somme billets
            </span>

            <strong>
              {money(cashBills)}
            </strong>
          </div>

          <div>
            <span>
              Somme monnaie
            </span>

            <strong>
              {money(cashCoins)}
            </strong>
          </div>

          <div>
            <span>
              Somme totale espèces
            </span>

            <strong>
              {money(closingCash)}
            </strong>
          </div>

          <div>
            <span>
              Espèces issues des ventes
            </span>

            <strong>
              {money(cashSales)}
            </strong>
          </div>

          <div>
            <span>
              ANCV total
            </span>

            <strong>
              {money(ancvTotal)}
            </strong>
          </div>

          <div>
            <span>
              Total encaissé
            </span>

            <strong>
              {money(
                paymentsTotal
              )}
            </strong>
          </div>

          <div
            className={
              Math.abs(
                difference
              ) < 0.005
                ? 'ok'
                : 'bad'
            }
          >

            <span>
              Écart
            </span>

            <strong>
              {money(
                difference
              )}
            </strong>

          </div>

          <div className="actions">

            <button
              className="primary"
              onClick={
                closeCash
              }
              disabled={
                saving ||
                closed
              }
            >
              {saving
                ? '⏳ Sauvegarde...'
                : closed
                  ? '✓ Caisse sauvegardée'
                  : 'Clôturer et sauvegarder'}
            </button>

            <button
              onClick={reset}
              disabled={saving}
            >
              Nouvelle caisse
            </button>

            {closed && (

              <button
                onClick={() =>
                  window.print()
                }
              >
                Imprimer
              </button>

            )}

          </div>

          {closed && (

            <div className="closed">

              ✓ Caisse clôturée —{' '}

              {eventName ||
                'Manifestation'}

              {' — '}

              {date}

            </div>

          )}

        </section>

      </div>
    </main>
  );
}
