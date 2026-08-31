'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

import { supabase } from './lib/supabase';

import Header from './composants/Header';
import OuvertureCaisse from './composants/OuvertureCaisse';
import Billetterie from './composants/Billetterie';
import FermetureEspeces from './composants/FermetureEspeces';
import MoyensPaiement from './composants/MoyensPaiement';
import PaiementsMultiples from './composants/PaiementsMultiples';
import ResultatsCaisse from './composants/ResultatsCaisse';
import ImpressionCaisse from './composants/ImpressionCaisse';


/* =========================================================
   OUTILS
========================================================= */

const money = n =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(n) || 0);


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


/* =========================================================
   ESPÈCES
========================================================= */

const cashValues = [
  50,
  20,
  10,
  5,
  2,
  1,
  0.5,
  0.2,
  0.1,
  0.05,
  0.02,
  0.01
];

const billValues = [
  50,
  20,
  10,
  5
];

const coinValues = [
  2,
  1,
  0.5,
  0.2,
  0.1,
  0.05,
  0.02,
  0.01
];

const ancvValues = [
  10,
  20,
  25,
  50
];


/* =========================================================
   CRÉATION ÉVÈNEMENT
========================================================= */

function createTicketQuantities(tickets) {

  return Object.fromEntries(
    tickets.map(ticket => [
      ticket.name,
      0
    ])
  );

}


function createEventSale(event) {

  return {
    id:
      Date.now() +
      Math.random(),

    eventId:
      event.id,

    eventName:
      event.name,

    tickets:
      event.tickets,

    quantities:
      createTicketQuantities(
        event.tickets
      )
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

  const searchParams =
    useSearchParams();

  const router =
    useRouter();

  const editId =
    searchParams.get('edit');

  const isEditing =
    Boolean(editId);


  /* =======================================================
     AUTH
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
     ÉVÈNEMENTS / TARIFS
  ======================================================= */

  const [events, setEvents] =
    useState([]);

  const [eventsLoading, setEventsLoading] =
    useState(false);

  const [eventsError, setEventsError] =
    useState('');

  const [selectedEventId, setSelectedEventId] =
    useState('');


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

  const [
    editLoading,
    setEditLoading
  ] = useState(false);


  /* =======================================================
     AUTHENTIFICATION
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

      if (!mounted)
        return;

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

        if (!mounted)
          return;

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

          setSession(session);

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
     CHARGEMENT ÉVÈNEMENTS
  ======================================================= */

  useEffect(() => {

    if (!session)
      return;

    loadEvents();

  }, [session]);


  async function loadEvents() {

    setEventsLoading(true);
    setEventsError('');

    const {
      data: eventData,
      error: eventError
    } =
      await supabase
        .from('events')
        .select(
          'id, name, active'
        )
        .eq(
          'active',
          true
        )
        .order(
          'created_at',
          {
            ascending: true
          }
        );


    if (eventError) {

      console.error(
        'Erreur chargement événements:',
        eventError
      );

      setEventsError(
        'Impossible de charger les événements.'
      );

      setEventsLoading(false);

      return;
    }


    const {
      data: tarifData,
      error: tarifError
    } =
      await supabase
        .from('tarifs')
        .select(
          'id, event_id, name, price, active'
        )
        .eq(
          'active',
          true
        )
        .order(
          'created_at',
          {
            ascending: true
          }
        );


    if (tarifError) {

      console.error(
        'Erreur chargement tarifs:',
        tarifError
      );

      setEventsError(
        'Impossible de charger les tarifs.'
      );

      setEventsLoading(false);

      return;
    }


    const formattedEvents =
      (eventData || [])
        .map(event => ({

          id:
            event.id,

          name:
            event.name,

          active:
            event.active,

          tickets:
            (tarifData || [])
              .filter(
                tarif =>
                  tarif.event_id ===
                  event.id
              )
              .map(tarif => ({

                id:
                  tarif.id,

                name:
                  tarif.name,

                price:
                  Number(
                    tarif.price
                  ) || 0

              }))

        }))
        .filter(
          event =>
            event.tickets.length > 0
        );


    setEvents(
      formattedEvents
    );


    if (
      formattedEvents.length > 0 &&
      !selectedEventId
    ) {

      setSelectedEventId(
        formattedEvents[0].id
      );

    } else if (
      formattedEvents.length === 0
    ) {

      setSelectedEventId('');

    }


    setEventsLoading(false);

  }


  /* =======================================================
     CHARGEMENT CAISSE À MODIFIER
  ======================================================= */

  useEffect(() => {

    if (
      !session ||
      !editId
    ) {

      return;
    }

    loadCaisseForEdit();

  }, [
    session,
    editId
  ]);


  async function loadCaisseForEdit() {

    setEditLoading(true);

    const {
      data: caisse,
      error
    } =
      await supabase
        .from('caisses')
        .select('*')
        .eq(
          'id',
          editId
        )
        .single();


    if (error) {

      console.error(
        'Erreur chargement caisse:',
        error
      );

      alert(
        `Impossible de charger la caisse.\n\n${error.message}`
      );

      setEditLoading(false);

      router.push('/');

      return;
    }


    /* =====================================================
       INFORMATIONS
    ===================================================== */

    setEventName(
      caisse.event_name || ''
    );

    setResponsible(
      caisse.responsible || ''
    );

    setDate(
      caisse.date ||
      new Date()
        .toISOString()
        .slice(0, 10)
    );


    /* =====================================================
       OUVERTURE
    ===================================================== */

    const savedOpening =
      caisse.opening_data
        ?.denominations ||
      {};

    setOpening(
      Object.fromEntries(
        cashValues.map(value => [
          value,
          Number(
            savedOpening[value] || 0
          )
        ])
      )
    );


    /* =====================================================
       FERMETURE
    ===================================================== */

    const savedClosing =
      caisse.closing_data
        ?.denominations ||
      {};

    setClosing(
      Object.fromEntries(
        cashValues.map(value => [
          value,
          Number(
            savedClosing[value] || 0
          )
        ])
      )
    );


    /* =====================================================
       BILLETERIE
    ===================================================== */

    const savedEvents =
      caisse.ca_data?.events ||
      [];

    setEventSales(
      savedEvents.map(
        (event, index) => {

          const tickets =
            Array.isArray(
              event.tickets
            )
              ? event.tickets
              : [];

          const quantities = {};


          tickets.forEach(
            ticket => {

              const name =
                Array.isArray(ticket)
                  ? ticket[0]
                  : ticket?.name;

              if (!name)
                return;

              const quantity =
                Array.isArray(ticket)
                  ? Number(
                      event.quantities?.[
                        name
                      ] || 0
                    )
                  : Number(
                      ticket.quantity ??
                      event.quantities?.[
                        name
                      ] ??
                      0
                    );

              quantities[name] =
                quantity;

            }
          );


          /*
           * On conserve les tarifs enregistrés
           * dans la caisse.
           */

          return {

            id:
              event.eventId ||
              event.id ||
              (
                Date.now() +
                index
              ),

            eventId:
              event.eventId,

            eventName:
              event.eventName ||
              'Évènement',

            tickets:
              tickets.map(
                ticket => {

                  if (
                    Array.isArray(
                      ticket
                    )
                  ) {

                    return {

                      id:
                        null,

                      name:
                        ticket[0],

                      price:
                        Number(
                          ticket[1]
                        ) || 0

                    };

                  }


                  return {

                    id:
                      ticket?.id,

                    name:
                      ticket?.name ||
                      'Tarif',

                    price:
                      Number(
                        ticket?.price
                      ) || 0

                  };

                }
              ),

            quantities

          };

        }
      )
    );


    /* =====================================================
       ANCV
    ===================================================== */

    const savedAncv =
      caisse.payments_data
        ?.ancv_by_value ||
      {};

    setAncv(
      Object.fromEntries(
        ancvValues.map(value => [
          value,
          Number(
            savedAncv[value] || 0
          )
        ])
      )
    );


    /* =====================================================
       PAIEMENTS SIMPLES
    ===================================================== */

    const savedSimple =
      caisse.payments_data
        ?.simple ||
      {};

    setPayments({

      tpe:
        Number(
          savedSimple.tpe || 0
        ),

      web:
        Number(
          savedSimple.web || 0
        ),

      cheque:
        Number(
          savedSimple.cheque || 0
        ),

      autre:
        Number(
          savedSimple.autre || 0
        )

    });


    setPaymentsValidated(
      true
    );


    /* =====================================================
       PAIEMENTS MULTIPLES
    ===================================================== */

    const savedMultiple =
      Array.isArray(
        caisse.multiple_payments
      )
        ? caisse.multiple_payments
        : [];


    setMultiplePayments(
      savedMultiple.map(
        (payment, index) => ({

          id:
            payment?.id ||
            (
              Date.now() +
              index
            ),

          amount:
            Number(
              payment?.amount || 0
            ),

          allocations: {

            cash:
              Number(
                payment?.allocations
                  ?.cash || 0
              ),

            tpe:
              Number(
                payment?.allocations
                  ?.tpe || 0
              ),

            web:
              Number(
                payment?.allocations
                  ?.web || 0
              ),

            cheque:
              Number(
                payment?.allocations
                  ?.cheque || 0
              ),

            ancv:
              Number(
                payment?.allocations
                  ?.ancv || 0
              ),

            autre:
              Number(
                payment?.allocations
                  ?.autre || 0
              )

          }

        })
      )
    );


    setClosed(false);

    setEditLoading(false);

  }


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
              opening[value],
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
              closing[value],
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
              opening[value],
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
              opening[value],
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
              closing[value],
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
              closing[value],
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
                  ticket
                ) =>
                  sum +
                  Number(
                    ticket.price
                  ) *
                    Number(
                      event
                        .quantities[
                        ticket.name
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
              ancv[value],
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


  const cashDifference =
    closingCash -
    (
      openingCash +
      cashSales
    );


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


  /* =======================================================
     AJOUT ÉVÈNEMENT
  ======================================================= */

  function addEvent() {

    const event =
      events.find(
        item =>
          item.id ===
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


  /* =======================================================
     SUPPRESSION ÉVÈNEMENT
  ======================================================= */

  function removeEvent(id) {

    setEventSales(
      prev =>
        prev.filter(
          event =>
            event.id !== id
        )
    );

  }


  /* =======================================================
     QUANTITÉ TICKET
  ======================================================= */

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

                ...event.quantities,

                [ticketName]:
                  value

              }

            };

          }
        )
    );

  }


  /* =======================================================
     RESET
  ======================================================= */

  function reset() {

    setOpening(
      Object.fromEntries(
        cashValues.map(
          value => [
            value,
            0
          ]
        )
      )
    );


    setClosing(
      Object.fromEntries(
        cashValues.map(
          value => [
            value,
            0
          ]
        )
      )
    );


    setEventSales([]);

    setSelectedEventId(
      events[0]?.id || ''
    );


    setAncv(
      Object.fromEntries(
        ancvValues.map(
          value => [
            value,
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

    setDate(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

    setClosed(false);

    setSaving(false);


    if (isEditing) {

      router.push('/');

    }

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

        amount:
          value

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

          ...prev.allocations,

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
        multipleDraft.amount ||
        0
      );


    const allocated =
      Object.values(
        multipleDraft.allocations
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
            ...multipleDraft.allocations
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
        payment =>
          payment.id ===
          id
      );

    if (!payment)
      return;


    setMultipleDraft({

      amount:
        payment.amount,

      allocations: {
        ...payment.allocations
      }

    });


    setMultiplePayments(
      prev =>
        prev.filter(
          payment =>
            payment.id !==
            id
        )
    );

  }


  function removeMultiple(id) {

    setMultiplePayments(
      prev =>
        prev.filter(
          payment =>
            payment.id !==
            id
        )
    );

  }


  /* =======================================================
     CONSTRUCTION DONNÉES CAISSE
  ======================================================= */

  function buildCaisseData() {

    const savedEvents =
      eventTotals.map(
        event => ({

          eventId:
            event.eventId,

          eventName:
            event.eventName,

          tickets:
            event.tickets.map(
              ticket => ({

                id:
                  ticket.id,

                name:
                  ticket.name,

                price:
                  Number(
                    ticket.price
                  ) || 0,

                quantity:
                  Number(
                    event
                      .quantities[
                        ticket.name
                      ] || 0
                  ),

                total:
                  (
                    Number(
                      ticket.price
                    ) || 0
                  ) *
                  Number(
                    event
                      .quantities[
                        ticket.name
                      ] || 0
                  )

              })
            ),

          total:
            event.total

        })
      );


    return {

      event_name:
        eventName || null,

      responsible:
        responsible || null,

      date,


      ca_data: {

        events:
          savedEvents,

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

  }


  /* =======================================================
     SAUVEGARDE / MODIFICATION
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


    if (eventSales.length === 0) {

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


    const caisseData =
      buildCaisseData();


    /* =====================================================
       MODIFICATION
    ===================================================== */

    if (isEditing) {

      const {
        error
      } =
        await supabase
          .from('caisses')
          .update(
            caisseData
          )
          .eq(
            'id',
            editId
          );


      setSaving(false);


      if (error) {

        console.error(
          'Erreur modification caisse:',
          error
        );

        alert(
          `Impossible de modifier la caisse.\n\n${error.message}`
        );

        return;
      }


      setClosed(true);

      alert(
        'Caisse modifiée avec succès.'
      );

      router.push(
        `/historique/${editId}`
      );

      return;
    }


    /* =====================================================
       NOUVELLE CAISSE
    ===================================================== */

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

          <Header
            userRole={userRole}
            dark={dark}
            setDark={setDark}
            onLogout={handleLogout}
          />


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
                      e.target.value
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
                      e.target.value
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
     UTILISATEUR SANS RÔLE
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
     CHARGEMENT MODIFICATION
  ======================================================= */

  if (
    isEditing &&
    editLoading
  ) {

    return (

      <main
        className={
          dark
            ? 'dark'
            : ''
        }
      >

        <div className="wrap">

          <Header
            userRole={userRole}
            dark={dark}
            setDark={setDark}
            onLogout={handleLogout}
          />

          <section className="card">

            <h2>
              ✏️ Modification de la caisse
            </h2>

            <div className="info">

              Chargement de la caisse...

            </div>

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

        <Header
          userRole={userRole}
          dark={dark}
          setDark={setDark}
          onLogout={handleLogout}
        />


        {/* =================================================
            MODE MODIFICATION
        ================================================= */}

        {isEditing && (

          <section className="card">

            <div
              className="multipleHeader"
            >

              <div>

                <h2>
                  ✏️ Modification de la caisse
                </h2>

                <p className="muted">

                  Les modifications seront enregistrées
                  dans cette caisse existante.

                </p>

              </div>


              <button
                onClick={() =>
                  router.push(
                    `/historique/${editId}`
                  )
                }
              >

                ← Annuler

              </button>

            </div>

          </section>

        )}


        {/* =================================================
            OUVERTURE
        ================================================= */}

        <OuvertureCaisse

          eventName={
            eventName
          }

          setEventName={
            setEventName
          }

          responsible={
            responsible
          }

          setResponsible={
            setResponsible
          }

          date={
            date
          }

          setDate={
            setDate
          }

          opening={
            opening
          }

          setOpening={
            setOpening
          }

          billValues={
            billValues
          }

          coinValues={
            coinValues
          }

          openingBills={
            openingBills
          }

          openingCoins={
            openingCoins
          }

          openingCash={
            openingCash
          }

          money={
            money
          }

          NumberField={
            NumberField
          }

          setCount={
            setCount
          }

        />


        {/* =================================================
            BILLETTERIE
        ================================================= */}

        <Billetterie

          events={
            events
          }

          eventsLoading={
            eventsLoading
          }

          eventsError={
            eventsError
          }

          selectedEventId={
            selectedEventId
          }

          setSelectedEventId={
            setSelectedEventId
          }

          addEvent={
            addEvent
          }

          eventTotals={
            eventTotals
          }

          removeEvent={
            removeEvent
          }

          updateTicketQuantity={
            updateTicketQuantity
          }

          ca={
            ca
          }

          money={
            money
          }

          NumberField={
            NumberField
          }

        />


        {/* =================================================
            FERMETURE
        ================================================= */}

        <FermetureEspeces

          closing={
            closing
          }

          setClosing={
            setClosing
          }

          billValues={
            billValues
          }

          coinValues={
            coinValues
          }

          cashBills={
            cashBills
          }

          cashCoins={
            cashCoins
          }

          closingCash={
            closingCash
          }

          cashSales={
            cashSales
          }

          openingCash={
            openingCash
          }

          money={
            money
          }

          NumberField={
            NumberField
          }

          setCount={
            setCount
          }

        />


        {/* =================================================
            MOYENS DE PAIEMENT
        ================================================= */}

        <MoyensPaiement

          payments={
            payments
          }

          setPayments={
            setPayments
          }

          paymentsValidated={
            paymentsValidated
          }

          setPaymentsValidated={
            setPaymentsValidated
          }

          ancv={
            ancv
          }

          setAncv={
            setAncv
          }

          ancvValues={
            ancvValues
          }

          ancvDirectTotal={
            ancvDirectTotal
          }

          money={
            money
          }

          NumberField={
            NumberField
          }

          setCount={
            setCount
          }

        />


        {/* =================================================
            PAIEMENTS MULTIPLES
        ================================================= */}

        <PaiementsMultiples

          multiplePayments={
            multiplePayments
          }

          multipleDraft={
            multipleDraft
          }

          multipleAllocated={
            multipleAllocated
          }

          multipleIsValid={
            multipleIsValid
          }

          startMultiple={
            startMultiple
          }

          setMultipleDraft={
            setMultipleDraft
          }

          updateMultipleAmount={
            updateMultipleAmount
          }

          updateMultipleAllocation={
            updateMultipleAllocation
          }

          validateMultiple={
            validateMultiple
          }

          editMultiple={
            editMultiple
          }

          removeMultiple={
            removeMultiple
          }

          money={
            money
          }

          NumberField={
            NumberField
          }

        />


        {/* =================================================
            RESULTATS
        ================================================= */}

        <ResultatsCaisse

          ca={
            ca
          }

          openingCash={
            openingCash
          }

          closingCash={
            closingCash
          }

          cashSales={
            cashSales
          }

          cashDifference={
            cashDifference
          }

          paymentsTotal={
            paymentsTotal
          }

          difference={
            difference
          }

          payments={
            payments
          }

          ancvTotal={
            ancvTotal
          }

          multiplePayments={
            multiplePayments
          }

          saving={
            saving
          }

          closed={
            closed
          }

          closeCash={
            closeCash
          }

          reset={
            reset
          }

          money={
            money
          }

        />


        {/* =================================================
            IMPRESSION
        ================================================= */}

        <ImpressionCaisse

          eventName={
            eventName
          }

          responsible={
            responsible
          }

          date={
            date
          }

          eventTotals={
            eventTotals
          }

          billValues={
            billValues
          }

          coinValues={
            coinValues
          }

          opening={
            opening
          }

          closing={
            closing
          }

          openingCash={
            openingCash
          }

          openingBills={
            openingBills
          }

          openingCoins={
            openingCoins
          }

          closingCash={
            closingCash
          }

          cashBills={
            cashBills
          }

          cashCoins={
            cashCoins
          }

          cashSales={
            cashSales
          }

          cashDifference={
            cashDifference
          }

          payments={
            payments
          }

          ancv={
            ancv
          }

          ancvValues={
            ancvValues
          }

          ancvTotal={
            ancvTotal
          }

          ancvDirectTotal={
            ancvDirectTotal
          }

          multiplePayments={
            multiplePayments
          }

          paymentsTotal={
            paymentsTotal
          }

          ca={
            ca
          }

          difference={
            difference
          }

          money={
            money
          }

        />

      </div>

    </main>

  );

}
