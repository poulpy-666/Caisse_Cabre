'use client';

import { useMemo, useState } from 'react';

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
          Math.max(0, Number(e.target.value) || 0)
        )
      }
    />
  );
}

const emptyMultiple = () => ({
  id: Date.now() + Math.random(),
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
});

export default function Home() {
  const [dark, setDark] = useState(false);

  const [eventName, setEventName] = useState('');

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [opening, setOpening] = useState(
    Object.fromEntries(
      cashValues.map(v => [v, 0])
    )
  );

  const [closing, setClosing] = useState(
    Object.fromEntries(
      cashValues.map(v => [v, 0])
    )
  );

  const [qty, setQty] = useState(
    Object.fromEntries(
      tickets.map(([n]) => [n, 0])
    )
  );

  const [ancv, setAncv] = useState(
    Object.fromEntries(
      ancvValues.map(v => [v, 0])
    )
  );

  const [payments, setPayments] = useState({
    tpe: 0,
    web: 0,
    cheque: 0,
    connect: 0,
    autre: 0
  });

  const [multiples, setMultiples] = useState([]);

  const [closed, setClosed] = useState(false);

  /* -----------------------------
     CALCULS
  ----------------------------- */

  const openingCash = useMemo(
    () =>
      cashValues.reduce(
        (s, v) => s + v * opening[v],
        0
      ),
    [opening]
  );

  const closingCash = useMemo(
    () =>
      cashValues.reduce(
        (s, v) => s + v * closing[v],
        0
      ),
    [closing]
  );

  const cashBills = useMemo(
    () =>
      [50, 20, 10, 5].reduce(
        (s, v) => s + v * closing[v],
        0
      ),
    [closing]
  );

  const cashCoins = useMemo(
    () =>
      [2, 1, 0.5, 0.2, 0.1, 0.05, 0.02, 0.01].reduce(
        (s, v) => s + v * closing[v],
        0
      ),
    [closing]
  );

  const cashSales = closingCash - openingCash;

  const ca = useMemo(
    () =>
      tickets.reduce(
        (s, [n, p]) => s + p * qty[n],
        0
      ),
    [qty]
  );

  const ancvTotal = useMemo(
    () =>
      ancvValues.reduce(
        (s, v) => s + v * ancv[v],
        0
      ),
    [ancv]
  );

  /*
   * Montants des paiements multiples
   */
  const multipleTotal = useMemo(
    () =>
      multiples.reduce(
        (s, p) => s + Number(p.amount || 0),
        0
      ),
    [multiples]
  );

  const multipleAllocatedTotal = useMemo(
    () =>
      multiples.reduce(
        (s, payment) =>
          s +
          Object.values(payment.allocations).reduce(
            (a, b) => a + Number(b || 0),
            0
          ),
        0
      ),
    [multiples]
  );

  /*
   * Dans les paiements multiples,
   * la partie espèces est déjà comprise
   * dans cashSales.
   *
   * On ne l'ajoute donc pas une deuxième fois.
   */
  const multipleNonCash = useMemo(
    () =>
      multiples.reduce(
        (s, payment) =>
          s +
          Number(payment.allocations.tpe || 0) +
          Number(payment.allocations.web || 0) +
          Number(payment.allocations.cheque || 0) +
          Number(payment.allocations.ancv || 0) +
          Number(payment.allocations.connect || 0) +
          Number(payment.allocations.autre || 0),
        0
      ),
    [multiples]
  );

  const paymentsTotal =
    cashSales +
    payments.tpe +
    payments.web +
    payments.cheque +
    ancvTotal +
    payments.connect +
    payments.autre +
    multipleNonCash;

  const difference = paymentsTotal - ca;

  const invalidMultiple = multiples.some(payment => {
    const allocated = Object.values(
      payment.allocations
    ).reduce(
      (s, value) => s + Number(value || 0),
      0
    );

    return Math.abs(
      allocated - Number(payment.amount || 0)
    ) > 0.005;
  });

  /* -----------------------------
     OUTILS
  ----------------------------- */

  const setCount = (
    setter,
    key,
    value
  ) =>
    setter(prev => ({
      ...prev,
      [key]: value
    }));

  function addMultiple() {
    setMultiples(prev => [
      ...prev,
      emptyMultiple()
    ]);
  }

  function removeMultiple(id) {
    setMultiples(prev =>
      prev.filter(p => p.id !== id)
    );
  }

  function updateMultipleAmount(
    id,
    value
  ) {
    setMultiples(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              amount: value
            }
          : p
      )
    );
  }

  function updateMultipleAllocation(
    id,
    type,
    value
  ) {
    setMultiples(prev =>
      prev.map(p =>
        p.id === id
          ? {
              ...p,
              allocations: {
                ...p.allocations,
                [type]: value
              }
            }
          : p
      )
    );
  }

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
        tickets.map(([n]) => [n, 0])
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

    setMultiples([]);
    setClosed(false);
  }

  function closeCash() {
    if (invalidMultiple) {
      alert(
        'Un ou plusieurs paiements multiples ne sont pas correctement répartis.'
      );
      return;
    }

    setClosed(true);
  }

  return (
    <main className={dark ? 'dark' : ''}>
      <div className="wrap">

        {/* ---------------- HEADER ---------------- */}

        <header>
          <div>
            <div className="eyebrow">
              BILLETTERIE ASSOCIATIVE
            </div>

            <h1>Clôture de caisse</h1>

            <p>
              Ouverture → comptage → fermeture → contrôle.
            </p>
          </div>

          <button
            className="theme"
            onClick={() => setDark(!dark)}
            aria-label="Changer de thème"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </header>

        {/* ---------------- OUVERTURE ---------------- */}

        <section className="card">
          <h2>1. Ouverture de caisse</h2>

          <div className="grid2">
            <label>
              Manifestation
              <input
                value={eventName}
                onChange={e =>
                  setEventName(e.target.value)
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
                  setDate(e.target.value)
                }
              />
            </label>
          </div>

          <h3>Fond de caisse</h3>

          <div className="cashgrid">
            {cashValues.map(v => (
              <div
                className="cashrow"
                key={'o' + v}
              >
                <span>{money(v)}</span>

                <NumberField
                  value={opening[v]}
                  onChange={x =>
                    setCount(
                      setOpening,
                      v,
                      x
                    )
                  }
                />

                <strong>
                  {money(v * opening[v])}
                </strong>
              </div>
            ))}
          </div>

          <div className="totalline">
            <span>
              Fond de caisse initial
            </span>

            <strong>
              {money(openingCash)}
            </strong>
          </div>
        </section>

        {/* ---------------- BILLETTERIE ---------------- */}

        <section className="card">
          <h2>2. Billetterie</h2>

          <p className="muted">
            Saisis uniquement le nombre de billets vendus.
          </p>

          <div className="ticketgrid">
            {tickets.map(([n, p]) => (
              <div
                className="ticket"
                key={n}
              >
                <div>
                  <strong>{n}</strong>
                  <span>{money(p)}</span>
                </div>

                <NumberField
                  value={qty[n]}
                  onChange={x =>
                    setCount(
                      setQty,
                      n,
                      x
                    )
                  }
                />

                <b>
                  {money(p * qty[n])}
                </b>
              </div>
            ))}
          </div>

          <div className="caBox">
            <span>CA billetterie</span>
            <strong>{money(ca)}</strong>
          </div>
        </section>

        {/* ---------------- FERMETURE ESPECES ---------------- */}

        <section className="card">
          <h2>3. Fermeture — espèces</h2>

          <p className="muted">
            Compte les espèces présentes dans la caisse.
          </p>

          <div className="cashgrid">
            {cashValues.map(v => (
              <div
                className="cashrow"
                key={'c' + v}
              >
                <span>{money(v)}</span>

                <NumberField
                  value={closing[v]}
                  onChange={x =>
                    setCount(
                      setClosing,
                      v,
                      x
                    )
                  }
                />

                <strong>
                  {money(v * closing[v])}
                </strong>
              </div>
            ))}
          </div>

          <div className="totalline">
            <span>
              Espèces en caisse
            </span>

            <strong>
              {money(closingCash)}
            </strong>
          </div>

          <div className="info">
            Espèces issues de la billetterie :{' '}
            <strong>
              {money(cashSales)}
            </strong>{' '}
            (espèces finales − fond initial)
          </div>
        </section>

        {/* ---------------- AUTRES PAIEMENTS ---------------- */}

        <section className="card">
          <h2>4. Autres moyens de paiement</h2>

          <div className="paymentgrid">

            <label>
              CB Guichet — TPE
              <NumberField
                step="0.01"
                value={payments.tpe}
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
                value={payments.web}
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
                value={payments.cheque}
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
                value={payments.connect}
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
                value={payments.autre}
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

          {/* ---------------- ANCV ---------------- */}

          <h3>
            Chèques-Vacances ANCV
          </h3>

          <div className="cashgrid">
            {ancvValues.map(v => (
              <div
                className="cashrow"
                key={'ancv' + v}
              >
                <span>{money(v)}</span>

                <NumberField
                  value={ancv[v]}
                  onChange={x =>
                    setCount(
                      setAncv,
                      v,
                      x
                    )
                  }
                />

                <strong>
                  {money(v * ancv[v])}
                </strong>
              </div>
            ))}
          </div>

          <div className="totalline">
            <span>
              Total ANCV
            </span>

            <strong>
              {money(ancvTotal)}
            </strong>
          </div>
        </section>

        {/* ---------------- PAIEMENTS MULTIPLES ---------------- */}

        <section className="card">
          <h2>5. Paiements multiples</h2>

          <p className="muted">
            Pour une vente réglée avec plusieurs moyens de paiement.
          </p>

          {multiples.length === 0 && (
            <div className="info">
              Aucun paiement multiple ajouté.
            </div>
          )}

          {multiples.map((payment, index) => {
            const allocated =
              Object.values(
                payment.allocations
              ).reduce(
                (s, v) =>
                  s + Number(v || 0),
                0
              );

            const valid =
              Math.abs(
                allocated -
                  Number(payment.amount || 0)
              ) < 0.005;

            return (
              <div
                className="multiple"
                key={payment.id}
              >
                <div className="multipleHeader">
                  <strong>
                    Paiement multiple #{index + 1}
                  </strong>

                  <button
                    type="button"
                    onClick={() =>
                      removeMultiple(
                        payment.id
                      )
                    }
                  >
                    Supprimer
                  </button>
                </div>

                <label>
                  Montant de la transaction
                  <NumberField
                    step="0.01"
                    value={payment.amount}
                    onChange={value =>
                      updateMultipleAmount(
                        payment.id,
                        value
                      )
                    }
                  />
                </label>

                <h3>
                  Répartition
                </h3>

                <div className="paymentgrid">

                  <label>
                    Espèces
                    <NumberField
                      step="0.01"
                      value={
                        payment.allocations.cash
                      }
                      onChange={value =>
                        updateMultipleAllocation(
                          payment.id,
                          'cash',
                          value
                        )
                      }
                    />
                  </label>

                  <label>
                    CB Guichet — TPE
                    <NumberField
                      step="0.01"
                      value={
                        payment.allocations.tpe
                      }
                      onChange={value =>
                        updateMultipleAllocation(
                          payment.id,
                          'tpe',
                          value
                        )
                      }
                    />
                  </label>

                  <label>
                    CB Web
                    <NumberField
                      step="0.01"
                      value={
                        payment.allocations.web
                      }
                      onChange={value =>
                        updateMultipleAllocation(
                          payment.id,
                          'web',
                          value
                        )
                      }
                    />
                  </label>

                  <label>
                    Chèque
                    <NumberField
                      step="0.01"
                      value={
                        payment.allocations.cheque
                      }
                      onChange={value =>
                        updateMultipleAllocation(
                          payment.id,
                          'cheque',
                          value
                        )
                      }
                    />
                  </label>

                  <label>
                    ANCV
                    <NumberField
                      step="0.01"
                      value={
                        payment.allocations.ancv
                      }
                      onChange={value =>
                        updateMultipleAllocation(
                          payment.id,
                          'ancv',
                          value
                        )
                      }
                    />
                  </label>

                  <label>
                    ANCV Connect
                    <NumberField
                      step="0.01"
                      value={
                        payment.allocations.connect
                      }
                      onChange={value =>
                        updateMultipleAllocation(
                          payment.id,
                          'connect',
                          value
                        )
                      }
                    />
                  </label>

                  <label>
                    Autre
                    <NumberField
                      step="0.01"
                      value={
                        payment.allocations.autre
                      }
                      onChange={value =>
                        updateMultipleAllocation(
                          payment.id,
                          'autre',
                          value
                        )
                      }
                    />
                  </label>

                </div>

                <div
                  className={
                    valid
                      ? 'info'
                      : 'info bad'
                  }
                >
                  Montant réparti :{' '}
                  <strong>
                    {money(allocated)}
                  </strong>

                  {' — '}

                  {valid
                    ? '✓ Répartition correcte'
                    : `⚠️ Il reste ${money(
                        Number(payment.amount || 0) -
                          allocated
                      )} à répartir`}
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={addMultiple}
          >
            ＋ Ajouter un paiement multiple
          </button>

          {multiples.length > 0 && (
            <div className="totalline">
              <span>
                Total paiements multiples
              </span>

              <strong>
                {money(multipleTotal)}
              </strong>
            </div>
          )}
        </section>

        {/* ---------------- RESULTATS ---------------- */}

        <section className="result">

          <div>
            <span>CA billetterie</span>
            <strong>
              {money(ca)}
            </strong>
          </div>

          <div>
            <span>Somme billets</span>
            <strong>
              {money(cashBills)}
            </strong>
          </div>

          <div>
            <span>Somme monnaie</span>
            <strong>
              {money(cashCoins)}
            </strong>
          </div>

          <div>
            <span>Somme totale espèces</span>
            <strong>
              {money(closingCash)}
            </strong>
          </div>

          <div>
            <span>ANCV</span>
            <strong>
              {money(ancvTotal)}
            </strong>
          </div>

          <div>
            <span>
              Total encaissé
            </span>

            <strong>
              {money(paymentsTotal)}
            </strong>
          </div>

          <div
            className={
              Math.abs(difference) < 0.005 &&
              !invalidMultiple
                ? 'ok'
                : 'bad'
            }
          >
            <span>Écart</span>

            <strong>
              {money(difference)}
            </strong>
          </div>

          {invalidMultiple && (
            <div className="bad">
              ⚠️ Un paiement multiple
              n'est pas correctement réparti.
            </div>
          )}

          <div className="actions">

            <button
              className="primary"
              onClick={closeCash}
            >
              Clôturer la caisse
            </button>

            <button onClick={reset}>
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
                'Manifestation'}{' '}
              — {date}
            </div>
          )}

        </section>

      </div>
    </main>
  );
}