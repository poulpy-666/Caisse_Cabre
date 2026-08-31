'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const roleLabel = {
  admin: 'Administrateur',
  responsable: 'Responsable',
  benevole: 'Bénévole'
};

export default function Utilisateurs() {

  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [users, setUsers] = useState([]);

  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);

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
     CHARGEMENT UTILISATEURS
  ========================================================= */

  useEffect(() => {

    if (
      session &&
      userRole === 'admin'
    ) {
      loadUsers();
    }

  }, [session, userRole]);

  async function loadUsers() {

    setLoading(true);
    setError('');

    const {
      data,
      error
    } = await supabase
      .from('profiles')
      .select('id, name, role, created_at')
      .order(
        'created_at',
        {
          ascending: true
        }
      );

    if (error) {

      console.error(error);

      setError(
        'Impossible de charger les utilisateurs.'
      );

      setLoading(false);

      return;
    }

    setUsers(data || []);

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
     PAS ADMIN
  ========================================================= */

  if (userRole !== 'admin') {

    return (

      <main>

        <div className="wrap">

          <section className="card">

            <h1>
              Accès refusé
            </h1>

            <p>
              Seuls les administrateurs peuvent gérer les utilisateurs.
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

    <main>

      <div className="wrap">

        {/* HEADER */}

        <header>

          <div>

            <div className="eyebrow">
              BILLETTERIE ASSOCIATIVE
            </div>

            <h1>
              Gestion des utilisateurs
            </h1>

            <p>
              Gérez les comptes et leurs rôles.
            </p>

          </div>

          <div className="headerActions">

            <span className="userRole">
              Administrateur
            </span>

            <Link href="/">
              <button>
                ← Caisse
              </button>
            </Link>

            <button
              onClick={
                handleLogout
              }
            >
              Déconnexion
            </button>

          </div>

        </header>

        {/* UTILISATEURS */}

        <section className="card">

          <div className="historyHeader">

            <div>

              <h2>
                Utilisateurs
              </h2>

              <p className="muted">
                {users.length}{' '}
                compte
                {users.length > 1
                  ? 's'
                  : ''}
              </p>

            </div>

            <button
              type="button"
              onClick={
                loadUsers
              }
              disabled={
                loading
              }
            >
              {loading
                ? '⏳ Chargement...'
                : '↻ Actualiser'}
            </button>

          </div>

          {error && (

            <div className="info bad">
              {error}
            </div>

          )}

          {!loading &&
            !error &&
            users.length === 0 && (

              <div className="info">
                Aucun utilisateur trouvé.
              </div>

            )}

          {users.length > 0 && (

            <div className="history">

              {users.map(
                user => {

                  const role =
                    user.role ||
                    'benevole';

                  const createdAt =
                    user.created_at
                      ? new Date(
                          user.created_at
                        ).toLocaleDateString(
                          'fr-FR'
                        )
                      : '—';

                  const isCurrentUser =
                    session.user.id ===
                    user.id;

                  return (

                    <div
                      className="historyItem"
                      key={
                        user.id
                      }
                    >

                      <div>

                        <strong>
                          {user.name || 'Nom non renseigné'}
                        </strong>

                        <small>
                          ID :{' '}
                          {user.id}
                        </small>

                        {isCurrentUser && (

                          <small>
                            Vous
                          </small>

                        )}

                      </div>

                      <div>

                        <span>
                          Rôle
                        </span>

                        <strong>
                          {roleLabel[
                            role
                          ] || role}
                        </strong>

                      </div>

                      <div>

                        <span>
                          Créé le
                        </span>

                        <strong>
                          {createdAt}
                        </strong>

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </section>

        {/* INFORMATION */}

        <section className="card">

          <h2>
            Gestion des rôles
          </h2>

          <div className="info">

            <strong>
              Cette première version est en lecture seule.
            </strong>

            <br />

            La modification des rôles sera ajoutée à l'étape suivante.

          </div>

        </section>

      </div>

    </main>

  );
}
