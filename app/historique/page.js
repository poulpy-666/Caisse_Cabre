'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const money = n =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(n) || 0);

export default function Historique() {

  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [caisses, setCaisses] = useState([]);
  const [error, setError] = useState('');

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

    <main>

      <div className="wrap">

        <header>

          <div>

            <div className="eyebrow">
              BILLETTERIE ASSOCIATIVE
            </div>

            <h1>
              Historique des caisses
            </h1>

            <p>
              Retrouvez les clôtures enregistrées.
            </p>

          </div>

          <div className="headerActions">

            <span className="userRole">

              {userRole === 'admin'
                ? 'Administrateur'
                : 'Responsable'}

            </span>

            <Link href="/">
              <button>
                ← Nouvelle caisse
              </button>
            </Link>

            <button
              onClick={handleLogout}
            >
              Déconnexion
            </button>

          </div>

        </header>

        <section className="card">

          <div className="historyHeader">

            <div>

              <h2>
                Caisses clôturées
              </h2>

              {!loading &&
                !error && (
                  <p className="muted">
                    {caisses.length}{' '}
                    caisse
                    {caisses.length > 1
                      ? 's'
                      : ''}{' '}
                    enregistrée
                    {caisses.length > 1
                      ? 's'
                      : ''}
                  </p>
                )}

            </div>

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

                <br />

                <small>
                  Si une caisse existe dans Supabase,
                  vérifie les politiques RLS de la table
                  <strong> caisses</strong>.
                </small>

              </div>

            )}

          {!loading &&
            !error &&
            caisses.length > 0 && (

              <div className="history">

                {caisses.map(
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
                        key={caisse.id}
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

                          {caisse.responsible && (

                            <small>
                              Responsable :{' '}
                              {caisse.responsible}
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
