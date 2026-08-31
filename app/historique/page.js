'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';
import Header from '../composants/Header';

const money = n =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(n) || 0);

export default function Historique() {

  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [dark, setDark] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [caisses, setCaisses] = useState([]);
  const [error, setError] = useState('');

  /* =========================================================
     FILTRES
  ========================================================= */

  const [search, setSearch] = useState('');
  const [responsibleFilter, setResponsibleFilter] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');

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
     CHARGEMENT HISTORIQUE
  ========================================================= */

  useEffect(() => {

    if (!session || !userRole) {
      return;
    }

    if (
      userRole !== 'admin' &&
      userRole !== 'responsable'
    ) {
      return;
    }

    loadCaisses();

  }, [session, userRole]);

  async function loadCaisses() {

    setLoading(true);
    setError('');

    const {
      data,
      error
    } = await supabase
      .from('caisses')
      .select(
        `
          id,
          created_at,
          event_name,
          responsible,
          date,
          total_ca,
          total_encaisse,
          difference
        `
      )
      .order(
        'date',
        {
          ascending: false
        }
      )
      .order(
        'created_at',
        {
          ascending: false
        }
      );

    if (error) {

      console.error(
        'Erreur historique Supabase:',
        error
      );

      setError(
        `Impossible de charger l’historique.\n\n${error.message}`
      );

      setCaisses([]);

      setLoading(false);

      return;
    }

    console.log(
      'Caisses récupérées:',
      data
    );

    setCaisses(data || []);

    setLoading(false);
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
     RESPONSABLES DISPONIBLES
  ========================================================= */

  const responsibleOptions = useMemo(() => {

    const names = caisses
      .map(caisse =>
        caisse.responsible?.trim()
      )
      .filter(Boolean);

    return [...new Set(names)]
      .sort(
        (a, b) =>
          a.localeCompare(
            b,
            'fr'
          )
      );

  }, [caisses]);

  /* =========================================================
     CAISSES FILTRÉES
  ========================================================= */

  const filteredCaisses = useMemo(() => {

    const searchValue =
      search
        .trim()
        .toLowerCase();

    return caisses.filter(
      caisse => {

        /* RECHERCHE */

        if (
          searchValue &&
          !(
            caisse.event_name
              ?.toLowerCase()
              .includes(searchValue)
          )
        ) {
          return false;
        }

        /* RESPONSABLE */

        if (
          responsibleFilter &&
          (
            caisse.responsible
              ?.trim() ||
            ''
          ) !== responsibleFilter
        ) {
          return false;
        }

        /* DATE DEBUT */

        if (
          dateStart &&
          caisse.date < dateStart
        ) {
          return false;
        }

        /* DATE FIN */

        if (
          dateEnd &&
          caisse.date > dateEnd
        ) {
          return false;
        }

        return true;
      }
    );

  }, [
    caisses,
    search,
    responsibleFilter,
    dateStart,
    dateEnd
  ]);

  /* =========================================================
     STATISTIQUES
  ========================================================= */

  const statistics = useMemo(() => {

    const count =
      filteredCaisses.length;

    const totalCa =
      filteredCaisses.reduce(
        (sum, caisse) =>
          sum +
          Number(
            caisse.total_ca || 0
          ),
        0
      );

    const totalEncaisse =
      filteredCaisses.reduce(
        (sum, caisse) =>
          sum +
          Number(
            caisse.total_encaisse || 0
          ),
        0
      );

    const totalDifference =
      filteredCaisses.reduce(
        (sum, caisse) =>
          sum +
          Number(
            caisse.difference || 0
          ),
        0
      );

    const withDifference =
      filteredCaisses.filter(
        caisse =>
          Math.abs(
            Number(
              caisse.difference || 0
            )
          ) >= 0.005
      ).length;

    return {
      count,
      totalCa,
      totalEncaisse,
      totalDifference,
      withDifference
    };

  }, [filteredCaisses]);

  /* =========================================================
     RESET FILTRES
  ========================================================= */

  function resetFilters() {

    setSearch('');
    setResponsibleFilter('');
    setDateStart('');
    setDateEnd('');

  }

  const filtersActive =
    search.trim() !== '' ||
    responsibleFilter !== '' ||
    dateStart !== '' ||
    dateEnd !== '';

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
              Vous devez être connecté pour accéder à l'historique.
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
     BÉNÉVOLE
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
              Votre rôle ne vous permet pas d'accéder à l'historique des caisses.
            </p>

            <div className="actions">

              <Link href="/">
                <button>
                  ← Retour à la caisse
                </button>
              </Link>

              <button
                className="primary"
                onClick={handleLogout}
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
     HISTORIQUE
  ========================================================= */

  return (

    <main className={dark ? 'dark' : ''}>

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
            STATISTIQUES
        ================================================= */}

        <section className="result">

          <div>

            <span>
              Caisses
            </span>

            <strong>
              {statistics.count}
            </strong>

          </div>

          <div>

            <span>
              CA total
            </span>

            <strong>
              {money(
                statistics.totalCa
              )}
            </strong>

          </div>

          <div>

            <span>
              Total encaissé
            </span>

            <strong>
              {money(
                statistics.totalEncaisse
              )}
            </strong>

          </div>

          <div
            className={
              Math.abs(
                statistics.totalDifference
              ) < 0.005
                ? 'ok'
                : 'bad'
            }
          >

            <span>
              Écart cumulé
            </span>

            <strong>
              {money(
                statistics.totalDifference
              )}
            </strong>

          </div>

          <div
            className={
              statistics.withDifference === 0
                ? 'ok'
                : 'bad'
            }
          >

            <span>
              Caisses avec écart
            </span>

            <strong>
              {statistics.withDifference}
            </strong>

          </div>

        </section>

        {/* =================================================
            FILTRES
        ================================================= */}

        <section className="card">

          <div className="historyHeader">

            <div>

              <h2>
                Recherche et filtres
              </h2>

              <p className="muted">

                {filtersActive
                  ? `${filteredCaisses.length} résultat${
                      filteredCaisses.length > 1
                        ? 's'
                        : ''
                    } sur ${caisses.length}`
                  : `${caisses.length} caisse${
                      caisses.length > 1
                        ? 's'
                        : ''
                    } enregistrée${
                      caisses.length > 1
                        ? 's'
                        : ''
                    }`}

              </p>

            </div>

            {filtersActive && (

              <button
                type="button"
                onClick={
                  resetFilters
                }
              >
                ✕ Réinitialiser
              </button>

            )}

          </div>

          <div className="paymentgrid">

            {/* RECHERCHE */}

            <label>

              Manifestation

              <input
                type="text"
                value={search}
                onChange={e =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Rechercher une manifestation..."
              />

            </label>

            {/* RESPONSABLE */}

            <label>

              Responsable

              <select
                value={
                  responsibleFilter
                }
                onChange={e =>
                  setResponsibleFilter(
                    e.target.value
                  )
                }
              >

                <option value="">
                  Tous les responsables
                </option>

                {responsibleOptions.map(
                  name => (

                    <option
                      key={name}
                      value={name}
                    >
                      {name}
                    </option>

                  )
                )}

              </select>

            </label>

            {/* DATE DEBUT */}

            <label>

              Du

              <input
                type="date"
                value={dateStart}
                onChange={e =>
                  setDateStart(
                    e.target.value
                  )
                }
              />

            </label>

            {/* DATE FIN */}

            <label>

              Au

              <input
                type="date"
                value={dateEnd}
                onChange={e =>
                  setDateEnd(
                    e.target.value
                  )
                }
              />

            </label>

          </div>

        </section>

        {/* =================================================
            LISTE
        ================================================= */}

        <section className="card">

          <div className="historyHeader">

            <h2>
              Caisses clôturées
            </h2>

            <button
              type="button"
              onClick={loadCaisses}
              disabled={loading}
            >

              {loading
                ? '⏳ Chargement...'
                : '↻ Actualiser'}

            </button>

          </div>

          {loading && (

            <div className="info">
              Chargement de l’historique...
            </div>

          )}

          {error && (

            <div className="info bad">
              {error}
            </div>

          )}

          {!loading &&
            !error &&
            caisses.length === 0 && (

              <div className="info">

                Aucune caisse clôturée pour le moment.

              </div>

            )}

          {!loading &&
            !error &&
            caisses.length > 0 &&
            filteredCaisses.length === 0 && (

              <div className="info">

                Aucune caisse ne correspond aux filtres sélectionnés.

                <br />

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                >
                  Réinitialiser les filtres
                </button>

              </div>

            )}

          {!loading &&
            !error &&
            filteredCaisses.length > 0 && (

              <div className="history">

                {filteredCaisses.map(
                  caisse => {

                    const difference =
                      Number(
                        caisse.difference
                      ) || 0;

                    const differenceOk =
                      Math.abs(
                        difference
                      ) < 0.005;

                    return (

                      <Link
                        href={`/historique/${caisse.id}`}
                        key={
                          caisse.id
                        }
                        className="historyItem"
                      >

                        <div>

                          <strong>
                            {caisse.event_name ||
                              'Manifestation'}
                          </strong>

                          <span>
                            {caisse.date}
                          </span>

                          {caisse.responsible ? (

                            <small>
                              Responsable :{' '}
                              {caisse.responsible}
                            </small>

                          ) : (

                            <small>
                              Responsable non renseigné
                            </small>

                          )}

                        </div>

                        <div>

                          <span>
                            CA
                          </span>

                          <strong>
                            {money(
                              caisse.total_ca
                            )}
                          </strong>

                        </div>

                        <div>

                          <span>
                            Encaissé
                          </span>

                          <strong>
                            {money(
                              caisse.total_encaisse
                            )}
                          </strong>

                        </div>

                        <div
                          className={
                            differenceOk
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

                        <div className="historyArrow">
                          →
                        </div>

                      </Link>

                    );

                  }
                )}

              </div>

            )}

        </section>

      </div>

    </main>

  );
}
