'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from './lib/supabase';

/* =========================================================
   ÉVÈNEMENTS ET TARIFS
========================================================= */

const eventTypes = [
  {
    id: 'visite',
    name: 'Visite avant spectacle',
    tickets: [
      ['Tarif plein', 10],
      ['Moins de 12 ans', 5],
      ['Moins de 3 ans', 0],
      ['Invitation', 0],
      ['PMR', 10],
    ],
  },
  {
    id: 'spectacle',
    name: 'Spectacle',
    tickets: [
      ['Tarif plein', 20],
      ['Moins de 12 ans', 12],
      ['Moins de 3 ans', 0],
      ['Invitation', 0],
      ['PMR', 20],
    ],
  },
  {
    id: 'atelier',
    name: 'Atelier',
    tickets: [
      ['Tarif plein', 15],
      ['Moins de 12 ans', 8],
      ['Moins de 3 ans', 0],
      ['Invitation', 0],
      ['PMR', 15],
    ],
  ],
];

/* =========================================================
   ESPÈCES
========================================================= */

const cashValues = [
  50, 20, 10, 5,
  2, 1,
  0.5, 0.2, 0.1,
  0.05, 0.02, 0.01
];

const billValues = [50, 20, 10, 5];

const coinValues = [
  2, 1,
  0.5, 0.2, 0.1,
  0.05, 0.02, 0.01
];

const ancvValues = [10, 20, 25, 50];

/* =========================================================
   OUTILS
========================================================= */

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

function createTicketQuantities(event) {
  return Object.fromEntries(
    event.tickets.map(([name]) => [
      name,
      0
    ])
  );
}

function createEventSale(event) {
  return {
    id:
      Date.now() +
      Math.random(),

    eventId: event.id,

    eventName: event.name,

    tickets: event.tickets,

    quantities:
      createTicketQuantities(event)
  };
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
      autre: 0
    }
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function Home() {

  /* =======================================================
     AUTHENTIFICATION
  ======================================================= */

  const [session, setSession] =
    useState(null);

  const [userRole, setUserRole] =
    useState(null);

  const [authLoading, setAuthLoading] =
    useState(true);

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [authError, setAuthError] =
    useState('');

  const [loggingIn, setLoggingIn] =
    useState(false);

  /* =======================================================
     THÈME
  ======================================================= */

  const [dark, setDark] =
    useState(false);

  /* =======================================================
     INFORMATIONS CAISSE
  ======================================================= */

  const [eventName, setEventName] =
    useState('');

  const [responsible, setResponsible] =
    useState('');

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  /* =======================================================
     OUVERTURE
  ======================================================= */

  const [opening, setOpening] =
    useState(
      Object.fromEntries(
        cashValues.map(v => [
          v,
          0
        ])
      )
    );

  /* =======================================================
     FERMETURE
  ======================================================= */

  const [closing, setClosing] =
    useState(
      Object.fromEntries(
        cashValues.map(v => [
          v,
          0
        ])
      )
    );

  /* =======================================================
     BILLETERIE
  ======================================================= */

  const [eventSales, setEventSales] =
    useState([]);

  const [selectedEventId, setSelectedEventId] =
    useState(
      eventTypes[0].id
    );

  /* =======================================================
     ANCV
  ======================================================= */

  const [ancv, setAncv] =
    useState(
      Object.fromEntries(
        ancvValues.map(v => [
          v,
          0
        ])
      )
    );

  /* =======================================================
     PAIEMENTS
  ======================================================= */

  const [payments, setPayments] =
    useState({
      tpe: 0,
      web: 0,
      cheque: 0,
      autre: 0
    });

  const [
    paymentsValidated,
    setPaymentsValidated
  ] = useState(false);

  /* =======================================================
     PAIEMENTS MULTIPLES
  ======================================================= */

  const [
    multipleDraft,
    setMultipleDraft
  ] = useState(null);

  const [
    multiplePayments,
    setMultiplePayments
  ] = useState([]);

  /* =======================================================
     CAISSE
  ======================================================= */

  const [closed, setClosed] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  /* =======================================================
     AUTH — CHARGEMENT SESSION
  ======================================================= */

  useEffect(() => {

    let mounted = true;

    async function loadSession() {

      const {
        data: {
          session
        }
      } =
        await supabase.auth.getSession();

      if (!mounted) return;

      setSession(session);

      if (session?.user) {

        const {
          data: profile,
          error
        } =
          await supabase
            .from('profiles')
            .select('role')
            .eq(
              'id',
              session.user.id
            )
            .single();

        if (
          !error &&
          profile
        ) {

          setUserRole(
            profile.role
          );

        } else {

          setUserRole(null);

        }

      }

      setAuthLoading(false);
    }

    loadSession();

    const {
      data: {
        subscription
      }
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          session
        ) => {

          if (!mounted)
            return;

          setSession(
            session
          );

          if (!session?.user) {

            setUserRole(null);

            return;
          }

          const {
            data: profile
          } =
            await supabase
              .from('profiles')
              .select('role')
              .eq(
                'id',
                session.user.id
              )
              .single();

          if (!mounted)
            return;

          setUserRole(
            profile?.role ||
            null
          );
        }
      );

    return () => {

      mounted = false;

      subscription.unsubscribe();

    };

  }, []);

  /* =======================================================
     CONNEXION
  ======================================================= */

  async function handleLogin(e) {

    e.preventDefault();

    setAuthError('');

    setLoggingIn(true);

    const {
      error
    } =
      await supabase.auth.signInWithPassword({
        email:
          email.trim(),

        password
      });

    setLoggingIn(false);

    if (error) {

      setAuthError(
        'Adresse e-mail ou mot de passe incorrect.'
      );

    }

  }

  /* =======================================================
     DÉCONNEXION
  ======================================================= */

  async function handleLogout() {

    await supabase.auth.signOut();

    setSession(null);

    setUserRole(null);

  }

  /* =======================================================
     CALCULS ESPÈCES
  ======================================================= */

  const openingCash =
    useMemo(
      () =>
        cashValues.reduce(
          (
            sum,
            value
          ) =>
            sum +
            value *
              opening[
                value
              ],
          0
        ),
      [opening]
    );

  const closingCash =
    useMemo(
      () =>
        cashValues.reduce(
          (
            sum,
            value
          ) =>
            sum +
            value *
              closing[
                value
              ],
          0
        ),
      [closing]
    );

  const openingBills =
    useMemo(
      () =>
        billValues.reduce(
          (
            sum,
            value
          ) =>
            sum +
            value *
              opening[
                value
              ],
          0
        ),
      [opening]
    );

  const openingCoins =
    useMemo(
      () =>
        coinValues.reduce(
          (
            sum,
            value
          ) =>
            sum +
            value *
              opening[
                value
              ],
          0
        ),
      [opening]
    );

  const cashBills =
    useMemo(
      () =>
        billValues.reduce(
          (
            sum,
            value
          ) =>
            sum +
            value *
              closing[
                value
              ],
          0
        ),
      [closing]
    );

  const cashCoins =
    useMemo(
      () =>
        coinValues.reduce(
          (
            sum,
            value
          ) =>
            sum +
            value *
              closing[
                value
              ],
          0
        ),
      [closing]
    );

  const cashSales =
    closingCash -
    openingCash;

  /* =======================================================
     CA PAR ÉVÈNEMENT
  ======================================================= */

  const eventTotals =
    useMemo(
      () =>
        eventSales.map(
          event => {

            const total =
              event.tickets.reduce(
                (
                  sum,
                  [
                    name,
                    price
                  ]
                ) =>
                  sum +
                  price *
                    Number(
                      event
                        .quantities[
                        name
                      ] || 0
                    ),
                0
              );

            return {
              ...event,
              total
            };

          }
        ),
      [eventSales]
    );

  /* =======================================================
     CA GLOBAL
  ======================================================= */

  const ca =
    useMemo(
      () =>
        eventTotals.reduce(
          (
            sum,
            event
          ) =>
            sum +
            event.total,
          0
        ),
      [eventTotals]
    );

  /* =======================================================
     ANCV
  ======================================================= */

  const ancvDirectTotal =
    useMemo(
      () =>
        ancvValues.reduce(
          (
            sum,
            value
          ) =>
            sum +
            value *
              ancv[
                value
              ],
          0
        ),
      [ancv]
    );

  /* =======================================================
     PAIEMENTS MULTIPLES
  ======================================================= */

  const multipleCash =
    useMemo(
      () =>
        multiplePayments.reduce(
          (
            sum,
            payment
          ) =>
            sum +
            Number(
              payment
                .allocations
                .cash ||
                0
            ),
          0
        ),
      [multiplePayments]
    );

  const multipleTpe =
    useMemo(
      () =>
        multiplePayments.reduce(
          (
            sum,
            payment
          ) =>
            sum +
            Number(
              payment
                .allocations
                .tpe ||
                0
            ),
          0
        ),
      [multiplePayments]
    );

  const multipleWeb =
    useMemo(
      () =>
        multiplePayments.reduce(
          (
            sum,
            payment
          ) =>
            sum +
            Number(
              payment
                .allocations
                .web ||
                0
            ),
          0
        ),
      [multiplePayments]
    );

  const multipleCheque =
    useMemo(
      () =>
        multiplePayments.reduce(
          (
            sum,
            payment
          ) =>
            sum +
            Number(
              payment
                .allocations
                .cheque ||
                0
            ),
          0
        ),
      [multiplePayments]
    );

  const multipleAncv =
    useMemo(
      () =>
        multiplePayments.reduce(
          (
            sum,
            payment
          ) =>
            sum +
            Number(
              payment
                .allocations
                .ancv ||
                0
            ),
          0
        ),
      [multiplePayments]
    );

  const multipleAutre =
    useMemo(
      () =>
        multiplePayments.reduce(
          (
            sum,
            payment
          ) =>
            sum +
            Number(
              payment
                .allocations
                .autre ||
                0
            ),
          0
        ),
      [multiplePayments]
    );

  const ancvTotal =
    ancvDirectTotal +
    multipleAncv;

  /* =======================================================
     TOTAL ENCAISSÉ
  ======================================================= */

  const paymentsTotal =
    cashSales +
    payments.tpe +
    payments.web +
    payments.cheque +
    ancvDirectTotal +
    payments.autre +
    multipleTpe +
    multipleWeb +
    multipleCheque +
    multipleAncv +
    multipleAutre;

  const difference =
    paymentsTotal -
    ca;

  /* =======================================================
     PAIEMENT MULTIPLE
  ======================================================= */

  const multipleAllocated =
    multipleDraft
      ? Object.values(
          multipleDraft
            .allocations
        ).reduce(
          (
            sum,
            value
          ) =>
            sum +
            Number(
              value || 0
            ),
          0
        )
      : 0;

  const multipleIsValid =
    multipleDraft &&
    Number(
      multipleDraft
        .amount || 0
    ) > 0 &&
    Math.abs(
      multipleAllocated -
        Number(
          multipleDraft
            .amount ||
            0
        )
    ) < 0.005;

  /* =======================================================
     OUTILS
  ======================================================= */

  const setCount = (
    setter,
    key,
    value
  ) => {

    setter(
      prev => ({
        ...prev,
        [key]: value
      })
    );

  };

  function addEvent() {

    const event =
      eventTypes.find(
        e =>
          e.id ===
          selectedEventId
      );

    if (!event)
      return;

    const alreadyExists =
      eventSales.some(
        sale =>
          sale.eventId ===
          event.id
      );

    if (alreadyExists) {

      alert(
        'Cet évènement est déjà ajouté à la caisse.'
      );

      return;
    }

    setEventSales(
      prev => [
        ...prev,
        createEventSale(
          event
        )
      ]
    );

  }

  function removeEvent(id) {

    setEventSales(
      prev =>
        prev.filter(
          event =>
            event.id !== id
        )
    );

  }

  function updateTicketQuantity(
    eventId,
    ticketName,
    value
  ) {

    setEventSales(
      prev =>
        prev.map(
          event => {

            if (
              event.id !==
              eventId
            ) {

              return event;

            }

            return {

              ...event,

              quantities: {

                ...event
                  .quantities,

                [ticketName]:
                  value

              }

            };

          }
        )
    );

  }

  function reset() {

    setOpening(
      Object.fromEntries(
        cashValues.map(
          v => [
            v,
            0
          ]
        )
      )
    );

    setClosing(
      Object.fromEntries(
        cashValues.map(
          v => [
            v,
            0
          ]
        )
      )
    );

    setEventSales([]);

    setSelectedEventId(
      eventTypes[0].id
    );

    setAncv(
      Object.fromEntries(
        ancvValues.map(
          v => [
            v,
            0
          ]
        )
      )
    );

    setPayments({
      tpe: 0,
      web: 0,
      cheque: 0,
      autre: 0
    });

    setPaymentsValidated(
      false
    );

    setMultipleDraft(
      null
    );

    setMultiplePayments([]);

    setEventName('');

    setResponsible('');

    setClosed(false);

    setSaving(false);

  }

  /* =======================================================
     PAIEMENTS MULTIPLES
  ======================================================= */

  function startMultiple() {

    if (multipleDraft)
      return;

    setMultipleDraft(
      createEmptyMultiple()
    );

  }

  function updateMultipleAmount(
    value
  ) {

    setMultipleDraft(
      prev => ({
        ...prev,
        amount: value
      })
    );

  }

  function updateMultipleAllocation(
    type,
    value
  ) {

    setMultipleDraft(
      prev => ({
        ...prev,

        allocations: {

          ...prev
            .allocations,

          [type]:
            value

        }

      })
    );

  }

  function validateMultiple() {

    if (!multipleDraft)
      return;

    const amount =
      Number(
        multipleDraft
          .amount || 0
      );

    const allocated =
      Object.values(
        multipleDraft
          .allocations
      ).reduce(
        (
          sum,
          value
        ) =>
          sum +
          Number(
            value || 0
          ),
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
        amount -
          allocated
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

    setMultiplePayments(
      prev => [
        ...prev,

        {

          id:
            Date.now() +
            Math.random(),

          amount,

          allocations: {
            ...multipleDraft
              .allocations
          }

        }

      ]
    );

    setMultipleDraft(
      null
    );

  }

  function editMultiple(id) {

    const payment =
      multiplePayments.find(
        p =>
          p.id === id
      );

    if (!payment)
      return;

    setMultipleDraft({

      amount:
        payment.amount,

      allocations: {
        ...payment
          .allocations
      }

    });

    setMultiplePayments(
      prev =>
        prev.filter(
          p =>
            p.id !== id
        )
    );

  }

  function removeMultiple(id) {

    setMultiplePayments(
      prev =>
        prev.filter(
          p =>
            p.id !== id
        )
    );

  }

  /* =======================================================
     SAUVEGARDE
  ======================================================= */

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

    if (
      eventSales.length ===
      0
    ) {

      alert(
        'Ajoute au moins un évènement à la billetterie.'
      );

      return;
    }

    if (!responsible.trim()) {

      alert(
        'Indique le nom du responsable de caisse.'
      );

      return;
    }

    setSaving(true);

    const caisseData = {

      event_name:
        eventName || null,

      responsible:
        responsible || null,

      date,

      ca_data: {

        events:
          eventTotals,

        total:
          ca

      },

      opening_data: {

        denominations:
          opening,

        total:
          openingCash

      },

      closing_data: {

        denominations:
          closing,

        total:
          closingCash,

        bills_total:
          cashBills,

        coins_total:
          cashCoins,

        cash_sales:
          cashSales

      },

      payments_data: {

        simple: {

          tpe:
            payments.tpe,

          web:
            payments.web,

          cheque:
            payments.cheque,

          ancv:
            ancvDirectTotal,

          autre:
            payments.autre

        },

        ancv_by_value:
          ancv,

        totals: {

          ancv:
            ancvTotal,

          cash:
            cashSales,

          cash_multiple:
            multipleCash,

          tpe:
            payments.tpe +
            multipleTpe,

          web:
            payments.web +
            multipleWeb,

          cheque:
            payments.cheque +
            multipleCheque,

          autre:
            payments.autre +
            multipleAutre

        }

      },

      multiple_payments:
        multiplePayments,

      total_ca:
        ca,

      total_encaisse:
        paymentsTotal,

      difference

    };

    const {
      error
    } =
      await supabase
        .from('caisses')
        .insert(
          caisseData
        );

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

  /* =======================================================
     CHARGEMENT AUTH
  ======================================================= */

  if (authLoading) {

    return (

      <main
        className={
          dark
            ? 'dark'
            : ''
        }
      >

        <div className="wrap">

          <section className="card">

            <h1>
              Chargement...
            </h1>

          </section>

        </div>

      </main>

    );

  }

  /* =======================================================
     CONNEXION
  ======================================================= */

  if (!session) {

    return (

      <main
        className={
          dark
            ? 'dark'
            : ''
        }
      >

        <div className="wrap">

          <header>

            <div>

              <div className="eyebrow">
                BILLETTERIE ASSOCIATIVE
              </div>

              <h1>
                Connexion
              </h1>

              <p>
                Connectez-vous pour accéder à la caisse.
              </p>

            </div>

            <button
              className="theme"
              onClick={() =>
                setDark(
                  !dark
                )
              }
              aria-label="Changer de thème"
            >
              {dark
                ? '☀️'
                : '🌙'}
            </button>

          </header>

          <section className="card loginCard">

            <h2>
              Accès à la caisse
            </h2>

            <form
              onSubmit={
                handleLogin
              }
            >

              <label>

                Adresse e-mail

                <input
                  type="email"
                  value={
                    email
                  }
                  onChange={e =>
                    setEmail(
                      e.target
                        .value
                    )
                  }
                  placeholder="exemple@association.fr"
                  autoComplete="email"
                  required
                />

              </label>

              <label>

                Mot de passe

                <input
                  type="password"
                  value={
                    password
                  }
                  onChange={e =>
                    setPassword(
                      e.target
                        .value
                    )
                  }
                  placeholder="Mot de passe"
                  autoComplete="current-password"
                  required
                />

              </label>

              {authError && (

                <div className="info bad">

                  {authError}

                </div>

              )}

              <button
                type="submit"
                className="primary"
                disabled={
                  loggingIn
                }
              >

                {loggingIn
                  ? '⏳ Connexion...'
                  : 'Se connecter'}

              </button>

            </form>

          </section>

        </div>

      </main>

    );

  }

  /* =======================================================
     UTILISATEUR CONNECTÉ SANS RÔLE
  ======================================================= */

  if (!userRole) {

    return (

      <main
        className={
          dark
            ? 'dark'
            : ''
        }
      >

        <div className="wrap">

          <section className="card">

            <h1>
              Accès refusé
            </h1>

            <p>
              Votre compte n'est pas encore associé à un rôle dans l'application.
            </p>

            <button
              className="primary"
              onClick={
                handleLogout
              }
            >
              Se déconnecter
            </button>

          </section>

        </div>

      </main>

    );

  }

  /* =======================================================
     APPLICATION
  ======================================================= */

  return (

    <main
      className={
        dark
          ? 'dark'
          : ''
      }
    >

      <div className="wrap">

        {/* =================================================
            HEADER
        ================================================= */}

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

          <div className="headerActions">

            <span className="userRole">

              {userRole ===
              'admin'
                ? 'Administrateur'
                : userRole ===
                    'responsable'
                  ? 'Responsable'
                  : 'Bénévole'}

            </span>

            <button
              type="button"
              onClick={
                handleLogout
              }
            >
              Déconnexion
            </button>

            <button
              className="theme"
              onClick={() =>
                setDark(
                  !dark
                )
              }
              aria-label="Changer de thème"
            >
              {dark
                ? '☀️'
                : '🌙'}
            </button>

          </div>

        </header>

        {/* =================================================
            1. OUVERTURE
        ================================================= */}

        <section className="card">

          <h2>
            1. Ouverture de caisse
          </h2>

          <div className="grid2">

            <label>

              Manifestation

              <input
                value={
                  eventName
                }
                onChange={e =>
                  setEventName(
                    e.target
                      .value
                  )
                }
                placeholder="Nom de la manifestation"
              />

            </label>

            <label>

              Responsable de caisse

              <input
                value={
                  responsible
                }
                onChange={e =>
                  setResponsible(
                    e.target
                      .value
                  )
                }
                placeholder="Nom du responsable"
              />

            </label>

          </div>

          <label>

            Date

            <input
              type="date"
              value={date}
              onChange={e =>
                setDate(
                  e.target
                    .value
                )
              }
            />

          </label>

          <h3>
            Fond de caisse
          </h3>

          <div className="cashColumns">

            {/* BILLETS */}

            <div className="cashPanel">

              <h3>
                💶 Billets
              </h3>

              {billValues.map(
                value => (

                  <div
                    className="cashrow"
                    key={
                      'opening-bill-' +
                      value
                    }
                  >

                    <span>
                      {money(
                        value
                      )}
                    </span>

                    <NumberField
                      value={
                        opening[
                          value
                        ]
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
                          opening[
                            value
                          ]
                      )}
                    </strong>

                  </div>

                )
              )}

              <div className="totalline">

                <span>
                  Total billets
                </span>

                <strong>
                  {money(
                    openingBills
                  )}
                </strong>

              </div>

            </div>

            {/* MONNAIE */}

            <div className="cashPanel">

              <h3>
                🪙 Monnaie
              </h3>

              {coinValues.map(
                value => (

                  <div
                    className="cashrow"
                    key={
                      'opening-coin-' +
                      value
                    }
                  >

                    <span>
                      {money(
                        value
                      )}
                    </span>

                    <NumberField
                      value={
                        opening[
                          value
                        ]
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
                          opening[
                            value
                          ]
                      )}
                    </strong>

                  </div>

                )
              )}

              <div className="totalline">

                <span>
                  Total monnaie
                </span>

                <strong>
                  {money(
                    openingCoins
                  )}
                </strong>

              </div>

            </div>

          </div>

          <div className="caBox">

            <span>
              FOND DE CAISSE INITIAL
            </span>

            <strong>
              {money(
                openingCash
              )}
            </strong>

          </div>

        </section>

        {/* =================================================
            2. BILLETTERIE
        ================================================= */}

        <section className="card">

          <h2>
            2. Billetterie
          </h2>

          <p className="muted">
            Ajoute les évènements concernés par la manifestation puis saisis les ventes.
          </p>

          <div className="grid2">

            <label>

              Évènement

              <select
                value={
                  selectedEventId
                }
                onChange={e =>
                  setSelectedEventId(
                    e.target
                      .value
                  )
                }
              >

                {eventTypes.map(
                  event => (

                    <option
                      key={
                        event.id
                      }
                      value={
                        event.id
                      }
                    >
                      {event.name}
                    </option>

                  )
                )}

              </select>

            </label>

            <div>

              <button
                type="button"
                className="primary"
                onClick={
                  addEvent
                }
              >
                ＋ Ajouter l'évènement
              </button>

            </div>

          </div>

          {eventTotals.length ===
          0 ? (

            <div className="info">

              Aucun évènement ajouté.

            </div>

          ) : (

            eventTotals.map(
              event => (

                <div
                  className="multiple"
                  key={
                    event.id
                  }
                >

                  <div className="multipleHeader">

                    <strong>
                      {event.eventName}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        removeEvent(
                          event.id
                        )
                      }
                    >
                      🗑️ Supprimer
                    </button>

                  </div>

                  <div className="ticketgrid">

                    {event.tickets.map(
                      (
                        [
                          name,
                          price
                        ]
                      ) => (

                        <div
                          className="ticket"
                          key={
                            name
                          }
                        >

                          <div>

                            <strong>
                              {name}
                            </strong>

                            <span>
                              {money(
                                price
                              )}
                            </span>

                          </div>

                          <NumberField
                            value={
                              event
                                .quantities[
                                name
                              ] ||
                              0
                            }
                            onChange={x =>
                              updateTicketQuantity(
                                event.id,
                                name,
                                x
                              )
                            }
                          />

                          <b>
                            {money(
                              price *
                                (
                                  event
                                    .quantities[
                                    name
                                  ] ||
                                  0
                                )
                            )}
                          </b>

                        </div>

                      )
                    )}

                  </div>

                  <div className="caBox">

                    <span>
                      CA {event.eventName}
                    </span>

                    <strong>
                      {money(
                        event.total
                      )}
                    </strong>

                  </div>

                </div>

              )
            )

          )}

          <div className="caBox">

            <span>
              CA BILLETTERIE TOTAL
            </span>

            <strong>
              {money(ca)}
            </strong>

          </div>

        </section>

        {/* =================================================
            3. FERMETURE ESPECES
        ================================================= */}

        <section className="card">

          <h2>
            3. Fermeture — espèces
          </h2>

          <p className="muted">
            Compte les espèces présentes dans la caisse.
          </p>

          <div className="cashColumns">

            {/* BILLETS */}

            <div className="cashPanel">

              <h3>
                💶 Billets
              </h3>

              {billValues.map(
                value => (

                  <div
                    className="cashrow"
                    key={
                      'closing-bill-' +
                      value
                    }
                  >

                    <span>
                      {money(
                        value
                      )}
                    </span>

                    <NumberField
                      value={
                        closing[
                          value
                        ]
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
                          closing[
                            value
                          ]
                      )}
                    </strong>

                  </div>

                )
              )}

              <div className="totalline">

                <span>
                  Total billets
                </span>

                <strong>
                  {money(
                    cashBills
                  )}
                </strong>

              </div>

            </div>

            {/* MONNAIE */}

            <div className="cashPanel">

              <h3>
                🪙 Monnaie
              </h3>

              {coinValues.map(
                value => (

                  <div
                    className="cashrow"
                    key={
                      'closing-coin-' +
                      value
                    }
                  >

                    <span>
                      {money(
                        value
                      )}
                    </span>

                    <NumberField
                      value={
                        closing[
                          value
                        ]
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
                          closing[
                            value
                          ]
                      )}
                    </strong>

                  </div>

                )
              )}

              <div className="totalline">

                <span>
                  Total monnaie
                </span>

                <strong>
                  {money(
                    cashCoins
                  )}
                </strong>

              </div>

            </div>

          </div>

          <div className="caBox">

            <span>
              SOMME TOTALE ESPÈCES
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

        {/* =================================================
            4. MOYENS DE PAIEMENT
        ================================================= */}

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

            {ancvValues.map(
              value => (

                <div
                  className="cashrow"
                  key={
                    'ancv' +
                    value
                  }
                >

                  <span>
                    {money(
                      value
                    )}
                  </span>

                  <NumberField
                    value={
                      ancv[
                        value
                      ]
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
                        ancv[
                          value
                        ]
                    )}
                  </strong>

                </div>

              )
            )}

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

        {/* =================================================
            5. PAIEMENTS MULTIPLES
        ================================================= */}

        <section className="card">

          <h2>
            5. Paiements multiples
          </h2>

          <p className="muted">
            Pour une vente réglée avec plusieurs moyens de paiement.
          </p>

          {multiplePayments.map(
            (
              payment,
              index
            ) => (

              <div
                className="multiple"
                key={
                  payment.id
                }
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
                        payment
                          .allocations
                          .cash
                      )}{' '}
                    </>
                  )}

                  {payment.allocations.tpe > 0 && (
                    <>
                      TPE :{' '}
                      {money(
                        payment
                          .allocations
                          .tpe
                      )}{' '}
                    </>
                  )}

                  {payment.allocations.web > 0 && (
                    <>
                      CB Web :{' '}
                      {money(
                        payment
                          .allocations
                          .web
                      )}{' '}
                    </>
                  )}

                  {payment.allocations.cheque > 0 && (
                    <>
                      Chèque :{' '}
                      {money(
                        payment
                          .allocations
                          .cheque
                      )}{' '}
                    </>
                  )}

                  {payment.allocations.ancv > 0 && (
                    <>
                      ANCV :{' '}
                      {money(
                        payment
                          .allocations
                          .ancv
                      )}{' '}
                    </>
                  )}

                  {payment.allocations.autre > 0 && (
                    <>
                      Autre :{' '}
                      {money(
                        payment
                          .allocations
                          .autre
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
              onClick={
                startMultiple
              }
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
                  [
                    'cash',
                    'Espèces'
                  ],
                  [
                    'tpe',
                    'CB Guichet — TPE'
                  ],
                  [
                    'web',
                    'CB Web'
                  ],
                  [
                    'cheque',
                    'Chèque'
                  ],
                  [
                    'ancv',
                    'ANCV'
                  ],
                  [
                    'autre',
                    'Autre'
                  ]
                ].map(
                  (
                    [
                      type,
                      label
                    ]
                  ) => (

                    <label
                      key={
                        type
                      }
                    >

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

          {multiplePayments.length >
            0 && (

            <div className="totalline">

              <span>
                Total paiements multiples
              </span>

              <strong>
                {money(
                  multiplePayments.reduce(
                    (
                      sum,
                      payment
                    ) =>
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

        {/* =================================================
            RESULTATS
        ================================================= */}

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
              {money(
                cashBills
              )}
            </strong>

          </div>

          <div>

            <span>
              Somme monnaie
            </span>

            <strong>
              {money(
                cashCoins
              )}
            </strong>

          </div>

          <div>

            <span>
              Somme totale espèces
            </span>

            <strong>
              {money(
                closingCash
              )}
            </strong>

          </div>

          <div>

            <span>
              Espèces issues des ventes
            </span>

            <strong>
              {money(
                cashSales
              )}
            </strong>

          </div>

          <div>

            <span>
              ANCV total
            </span>

            <strong>
              {money(
                ancvTotal
              )}
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
              onClick={
                reset
              }
              disabled={
                saving
              }
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

              {responsible}

              {' — '}

              {date}

            </div>

          )}

        </section>

      </div>

    </main>

  );
}