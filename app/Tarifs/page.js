'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import Header from '../composants/Header';

const money = n =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(n) || 0);

export default function Tarifs() {

  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dark, setDark] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  const [saving, setSaving] = useState(false);

  /* =========================================================
     ÉVÉNEMENT OUVERT
  ========================================================= */

  const [openEventId, setOpenEventId] =
    useState(null);

  /* =========================================================
     FORMULAIRE NOUVEL ÉVÉNEMENT
  ========================================================= */

  const [newEventName, setNewEventName] =
    useState('');

  const [showNewEvent, setShowNewEvent] =
    useState(false);

  /* =========================================================
     NOUVEAU TARIF
  ========================================================= */

  const [newTarif, setNewTarif] =
    useState(null);

  /* =========================================================
     AUTHENTIFICATION
  ========================================================= */

  useEffect(() => {

    let mounted = true;

    async function loadSession() {

      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(session);

      if (!session?.user) {
        setAuthLoading(false);
        return;
      }

      const {
        data: profile,
        error
      } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!mounted) return;

      if (!error && profile) {
        setUserRole(profile.role);
      } else {
        setUserRole(null);
      }

      setAuthLoading(false);
    }

    loadSession();

    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {

        if (!mounted) return;

        setSession(session);

        if (!session?.user) {
          setUserRole(null);
          return;
        }

        const {
          data: profile
        } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (!mounted) return;

        setUserRole(
          profile?.role || null
        );
      }
    );

    return () => {

      mounted = false;

      subscription.unsubscribe();

    };

  }, []);

  /* =========================================================
     CHARGEMENT DES ÉVÉNEMENTS
  ========================================================= */

  useEffect(() => {

    if (
      !session ||
      (
        userRole !== 'admin' &&
        userRole !== 'responsable'
      )
    ) {
      return;
    }

    loadEvents();

  }, [session, userRole]);

  async function loadEvents() {

    setLoading(true);
    setError('');

    const {
      data,
      error
    } = await supabase
      .from('events')
      .select(`
        id,
        name,
        active,
        created_at,
        tarifs (
          id,
          name,
          price,
          active,
          created_at
        )
      `)
      .eq('active', true)
      .order('created_at', {
        ascending: true
      });

    if (error) {

      console.error(
        'Erreur chargement événements:',
        error
      );

      setError(
        'Impossible de charger les événements.'
      );

      setLoading(false);

      return;
    }

    setEvents(data || []);

    setLoading(false);
  }

  /* =========================================================
     CRÉER UN ÉVÉNEMENT
  ========================================================= */

  async function createEvent() {

    const name =
      newEventName.trim();

    if (!name) {

      alert(
        'Indique le nom de l’événement.'
      );

      return;
    }

    setSaving(true);
    setError('');

    const {
      data,
      error
    } = await supabase
      .from('events')
      .insert({
        name
      })
      .select()
      .single();

    if (error) {

      console.error(
        'Erreur création événement:',
        error
      );

      setError(
        'Impossible de créer l’événement.'
      );

      setSaving(false);

      return;
    }

    setEvents(
      prev => [
        ...prev,
        {
          ...data,
          tarifs: []
        }
      ]
    );

    /* Ouvre automatiquement le nouvel événement */
    setOpenEventId(data.id);

    setNewEventName('');
    setShowNewEvent(false);

    setSaving(false);
  }

  /* =========================================================
     MODIFIER UN ÉVÉNEMENT
  ========================================================= */

  async function updateEvent(
    eventId,
    name
  ) {

    const value =
      name.trim();

    if (!value) {

      alert(
        'Le nom de l’événement ne peut pas être vide.'
      );

      return;
    }

    setSaving(true);
    setError('');

    const {
      error
    } = await supabase
      .from('events')
      .update({
        name: value
      })
      .eq(
        'id',
        eventId
      );

    if (error) {

      console.error(
        'Erreur modification événement:',
        error
      );

      setError(
        'Impossible de modifier l’événement.'
      );

      setSaving(false);

      return;
    }

    setEvents(
      prev =>
        prev.map(event =>
          event.id === eventId
            ? {
                ...event,
                name: value
              }
            : event
        )
    );

    setSaving(false);
  }

  /* =========================================================
     DÉSACTIVER UN ÉVÉNEMENT
  ========================================================= */

  async function deactivateEvent(
    eventId
  ) {

    const confirmed =
      window.confirm(
        'Désactiver cet événement ?\n\nIl ne sera plus proposé dans la caisse, mais les anciennes caisses resteront conservées.'
      );

    if (!confirmed) return;

    setSaving(true);
    setError('');

    const {
      error
    } = await supabase
      .from('events')
      .update({
        active: false
      })
      .eq(
        'id',
        eventId
      );

    if (error) {

      console.error(
        'Erreur désactivation événement:',
        error
      );

      setError(
        'Impossible de désactiver l’événement.'
      );

      setSaving(false);

      return;
    }

    setEvents(
      prev =>
        prev.filter(
          event =>
            event.id !== eventId
        )
    );

    if (
      openEventId === eventId
    ) {
      setOpenEventId(null);
    }

    setSaving(false);
  }

  /* =========================================================
     AJOUTER UN TARIF
  ========================================================= */

  function startNewTarif(
    eventId
  ) {

    setOpenEventId(eventId);

    setNewTarif({
      eventId,
      name: '',
      price: 0
    });
  }

  async function createTarif() {

    if (!newTarif) return;

    const name =
      newTarif.name.trim();

    const price =
      Number(newTarif.price);

    if (!name) {

      alert(
        'Indique le nom du tarif.'
      );

      return;
    }

    if (
      !Number.isFinite(price) ||
      price < 0
    ) {

      alert(
        'Indique un prix valide.'
      );

      return;
    }

    setSaving(true);
    setError('');

    const {
      data,
      error
    } = await supabase
      .from('tarifs')
      .insert({
        event_id:
          newTarif.eventId,
        name,
        price
      })
      .select()
      .single();

    if (error) {

      console.error(
        'Erreur création tarif:',
        error
      );

      setError(
        'Impossible de créer le tarif.'
      );

      setSaving(false);

      return;
    }

    setEvents(
      prev =>
        prev.map(event =>
          event.id ===
          newTarif.eventId
            ? {
                ...event,

                tarifs: [
                  ...(event.tarifs || []),
                  data
                ]
              }
            : event
        )
    );

    setNewTarif(null);

    setSaving(false);
  }

  /* =========================================================
     MODIFIER UN TARIF
  ========================================================= */

  async function updateTarif(
    eventId,
    tarifId,
    name,
    price
  ) {

    const valueName =
      name.trim();

    const valuePrice =
      Number(price);

    if (!valueName) {

      alert(
        'Le nom du tarif ne peut pas être vide.'
      );

      return;
    }

    if (
      !Number.isFinite(
        valuePrice
      ) ||
      valuePrice < 0
    ) {

      alert(
        'Le prix doit être valide.'
      );

      return;
    }

    setSaving(true);
    setError('');

    const {
      error
    } = await supabase
      .from('tarifs')
      .update({
        name: valueName,
        price: valuePrice
      })
      .eq(
        'id',
        tarifId
      );

    if (error) {

      console.error(
        'Erreur modification tarif:',
        error
      );

      setError(
        'Impossible de modifier le tarif.'
      );

      setSaving(false);

      return;
    }

    setEvents(
      prev =>
        prev.map(event => {

          if (
            event.id !==
            eventId
          ) {
            return event;
          }

          return {
            ...event,

            tarifs:
              (event.tarifs || [])
                .map(tarif =>
                  tarif.id ===
                  tarifId
                    ? {
                        ...tarif,
                        name:
                          valueName,
                        price:
                          valuePrice
                      }
                    : tarif
                )
          };

        })
    );

    setSaving(false);
  }

  /* =========================================================
     DÉSACTIVER UN TARIF
  ========================================================= */

  async function deactivateTarif(
    eventId,
    tarifId
  ) {

    const confirmed =
      window.confirm(
        'Désactiver ce tarif ?\n\nIl ne sera plus proposé pour les nouvelles caisses.'
      );

    if (!confirmed) return;

    setSaving(true);
    setError('');

    const {
      error
    } = await supabase
      .from('tarifs')
      .update({
        active: false
      })
      .eq(
        'id',
        tarifId
      );

    if (error) {

      console.error(
        'Erreur désactivation tarif:',
        error
      );

      setError(
        'Impossible de désactiver le tarif.'
      );

      setSaving(false);

      return;
    }

    setEvents(
      prev =>
        prev.map(event =>
          event.id === eventId
            ? {
                ...event,

                tarifs:
                  (event.tarifs || [])
                    .filter(
                      tarif =>
                        tarif.id !==
                        tarifId
                    )
              }
            : event
        )
    );

    setSaving(false);
  }

  /* =========================================================
     DÉCONNEXION
  ========================================================= */

  async function handleLogout() {

    await supabase.auth.signOut();

    setSession(null);
    setUserRole(null);

  }

  /* =========================================================
     CHARGEMENT
  ========================================================= */

  if (authLoading) {

    return (
      <main>

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

  /* =========================================================
     NON CONNECTÉ
  ========================================================= */

  if (!session) {

    return (
      <main>

        <div className="wrap">

          <section className="card">

            <h1>
              Accès refusé
            </h1>

            <p>
              Vous devez être connecté pour accéder à cette page.
            </p>

            <Link href="/">
              <button className="primary">
                Se connecter
              </button>
            </Link>

          </section>

        </div>

      </main>
    );
  }

  /* =========================================================
     ACCÈS INTERDIT
  ========================================================= */

  if (
    userRole !== 'admin' &&
    userRole !== 'responsable'
  ) {

    return (
      <main>

        <div className="wrap">

          <section className="card">

            <h1>
              Accès refusé
            </h1>

            <p>
              Seuls les administrateurs et responsables peuvent gérer les tarifs.
            </p>

            <div className="actions">

              <Link href="/">
                <button>
                  ← Retour à la caisse
                </button>
              </Link>

              <button
                className="primary"
                onClick={
                  handleLogout
                }
              >
                Se déconnecter
              </button>

            </div>

          </section>

        </div>

      </main>
    );
  }

  /* =========================================================
     APPLICATION
  ========================================================= */

  return (

    <main  className={dark ? 'dark' : ''}>

      <div className="wrap">

        <Header
      userRole={userRole}
      dark={dark}
      setDark={setDark}
      onLogout={handleLogout}
    />

        {/* =================================================
            ÉVÉNEMENTS
        ================================================= */}

        <section className="card">

          <div className="historyHeader">

            <div>

              <h2>
                Événements
              </h2>

              <p className="muted">
                {events.length}{' '}
                événement
                {events.length > 1
                  ? 's'
                  : ''}
              </p>

            </div>

            <div className="actions">

              <button
                type="button"
                onClick={
                  loadEvents
                }
                disabled={
                  loading ||
                  saving
                }
              >
                {loading
                  ? '⏳ Chargement...'
                  : '↻ Actualiser'}
              </button>

              <button
                type="button"
                className="primary"
                onClick={() =>
                  setShowNewEvent(
                    !showNewEvent
                  )
                }
              >
                ＋ Nouvel événement
              </button>

            </div>

          </div>

          {/* =================================================
              NOUVEL ÉVÉNEMENT
          ================================================= */}

          {showNewEvent && (

            <div className="multiple">

              <div className="multipleHeader">

                <strong>
                  Nouvel événement
                </strong>

                <button
                  type="button"
                  onClick={() => {

                    setShowNewEvent(
                      false
                    );

                    setNewEventName('');

                  }}
                >
                  Annuler
                </button>

              </div>

              <label>

                Nom de l'événement

                <input
                  type="text"
                  value={
                    newEventName
                  }
                  onChange={e =>
                    setNewEventName(
                      e.target.value
                    )
                  }
                  placeholder="Ex : Spectacle"
                  autoFocus
                />

              </label>

              <div className="actions">

                <button
                  type="button"
                  className="primary"
                  onClick={
                    createEvent
                  }
                  disabled={
                    saving
                  }
                >
                  {saving
                    ? '⏳ Création...'
                    : '✓ Créer l’événement'}
                </button>

              </div>

            </div>

          )}

          {error && (

            <div className="info bad">
              {error}
            </div>

          )}

          {loading ? (

            <div className="info">
              Chargement des événements...
            </div>

          ) : events.length === 0 ? (

            <div className="info">
              Aucun événement actif pour le moment.
            </div>

          ) : (

            <div className="eventsList">

              {events.map(event => {

                const isOpen =
                  openEventId ===
                  event.id;

                return (

                  <div
                    className={
                      isOpen
                        ? 'eventCard open'
                        : 'eventCard'
                    }
                    key={
                      event.id
                    }
                  >

                    {/* =====================================
                        EN-TÊTE
                    ===================================== */}

                    <button
                      type="button"
                      className="eventHeader"
                      onClick={() =>
                        setOpenEventId(
                          isOpen
                            ? null
                            : event.id
                        )
                      }
                    >

                      <div>

                        <strong>
                          {event.name}
                        </strong>

                        <span>
                          {(event.tarifs || []).length}{' '}
                          tarif
                          {(event.tarifs || []).length > 1
                            ? 's'
                            : ''}
                        </span>

                      </div>

                      <span className="eventChevron">
                        {isOpen
                          ? '⌃'
                          : '⌄'}
                      </span>

                    </button>

                    {/* =====================================
                        CONTENU OUVERT
                    ===================================== */}

                    {isOpen && (

                      <div className="eventContent">

                        {/* ===============================
                            MODIFICATION ÉVÉNEMENT
                        =============================== */}

                        <div className="eventEdit">

                          <label>

                            Nom de l'événement

                            <input
                              type="text"
                              defaultValue={
                                event.name
                              }
                              onBlur={e =>
                                updateEvent(
                                  event.id,
                                  e.target.value
                                )
                              }
                            />

                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              deactivateEvent(
                                event.id
                              )
                            }
                            disabled={
                              saving
                            }
                          >
                            🗑️ Désactiver l'événement
                          </button>

                        </div>

                        {/* ===============================
                            TARIFS
                        =============================== */}

                        <h3>
                          Tarifs
                        </h3>

                        {!event.tarifs ||
                        event.tarifs.length === 0 ? (

                          <div className="info">

                            Aucun tarif pour cet événement.

                          </div>

                        ) : (

                          <div className="tarifsList">

                            {event.tarifs.map(
                              tarif => (

                                <TarifRow
                                  key={
                                    tarif.id
                                  }
                                  tarif={
                                    tarif
                                  }
                                  eventId={
                                    event.id
                                  }
                                  saving={
                                    saving
                                  }
                                  onSave={
                                    updateTarif
                                  }
                                  onDelete={
                                    deactivateTarif
                                  }
                                />

                              )
                            )}

                          </div>

                        )}

                        {/* ===============================
                            AJOUT TARIF
                        =============================== */}

                        {newTarif?.eventId ===
                        event.id ? (

                          <div className="multiple">

                            <div className="multipleHeader">

                              <strong>
                                Nouveau tarif
                              </strong>

                              <button
                                type="button"
                                onClick={() =>
                                  setNewTarif(
                                    null
                                  )
                                }
                              >
                                Annuler
                              </button>

                            </div>

                            <div className="grid2">

                              <label>

                                Nom du tarif

                                <input
                                  type="text"
                                  value={
                                    newTarif.name
                                  }
                                  onChange={e =>
                                    setNewTarif(
                                      prev => ({
                                        ...prev,
                                        name:
                                          e.target
                                            .value
                                      })
                                    )
                                  }
                                  placeholder="Ex : Tarif plein"
                                  autoFocus
                                />

                              </label>

                              <label>

                                Prix

                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={
                                    newTarif.price
                                  }
                                  onChange={e =>
                                    setNewTarif(
                                      prev => ({
                                        ...prev,
                                        price:
                                          Number(
                                            e.target
                                              .value
                                          ) || 0
                                      })
                                    )
                                  }
                                />

                              </label>

                            </div>

                            <div className="actions">

                              <button
                                type="button"
                                className="primary"
                                onClick={
                                  createTarif
                                }
                                disabled={
                                  saving
                                }
                              >
                                {saving
                                  ? '⏳ Création...'
                                  : '✓ Ajouter le tarif'}
                              </button>

                            </div>

                          </div>

                        ) : (

                          <button
                            type="button"
                            className="primary"
                            onClick={() =>
                              startNewTarif(
                                event.id
                              )
                            }
                          >
                            ＋ Ajouter un tarif
                          </button>

                        )}

                      </div>

                    )}

                  </div>

                );
              })}

            </div>

          )}

        </section>

        {/* =================================================
            INFORMATIONS
        ================================================= */}

        <section className="card">

          <h2>
            Gestion des tarifs
          </h2>

          <div className="info">

            <strong>
              💡 Conseil
            </strong>

            <br />

            Les événements et tarifs désactivés
            ne seront plus proposés pour les nouvelles
            caisses. Les données déjà enregistrées
            dans l'historique restent conservées.

          </div>

        </section>

      </div>

    </main>
  );
}


/* =========================================================
   LIGNE TARIF
========================================================= */

function TarifRow({
  tarif,
  eventId,
  saving,
  onSave,
  onDelete
}) {

  const [name, setName] =
    useState(
      tarif.name || ''
    );

  const [price, setPrice] =
    useState(
      Number(tarif.price) || 0
    );

  return (

    <div className="tarifRow">

      <label>

        Nom du tarif

        <input
          type="text"
          value={name}
          onChange={e =>
            setName(
              e.target.value
            )
          }
        />

      </label>

      <label>

        Prix

        <input
          type="number"
          min="0"
          step="0.01"
          value={price}
          onChange={e =>
            setPrice(
              Number(
                e.target.value
              ) || 0
            )
          }
        />

      </label>

      <div className="tarifActions">

        <button
          type="button"
          onClick={() =>
            onSave(
              eventId,
              tarif.id,
              name,
              price
            )
          }
          disabled={
            saving
          }
        >
          ✓
        </button>

        <button
          type="button"
          onClick={() =>
            onDelete(
              eventId,
              tarif.id
            )
          }
          disabled={
            saving
          }
        >
          🗑️
        </button>

      </div>

    </div>
  );
}
