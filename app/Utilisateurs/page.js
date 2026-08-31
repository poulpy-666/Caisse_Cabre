'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function Utilisateurs() {

  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const [savingId, setSavingId] = useState(null);

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
      !session ||
      userRole !== 'admin'
    ) {
      return;
    }

    loadUsers();

  }, [session, userRole]);

  async function loadUsers() {

    setLoading(true);
    setError('');

    const {
      data,
      error
    } = await supabase.rpc(
      'get_users_for_admin'
    );

    if (error) {

      console.error(
        'Erreur chargement utilisateurs:',
        error
      );

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
     MODIFICATION DU RÔLE
  ========================================================= */

  async function changeRole(
    userId,
    newRole
  ) {

    if (!newRole) return;

    setSavingId(userId);
    setError('');

    const {
      error
    } = await supabase
      .from('profiles')
      .update({
        role: newRole
      })
      .eq(
        'id',
        userId
      );

    if (error) {

      console.error(
        'Erreur modification rôle:',
        error
      );

      setError(
        'Impossible de modifier le rôle.'
      );

      setSavingId(null);

      return;
    }

    setUsers(
      prev =>
        prev.map(user =>
          user.id === userId
            ? {
                ...user,
                role: newRole
              }
            : user
        )
    );

    setSavingId(null);
  }

  /* =========================================================
     MODIFICATION DU NOM
  ========================================================= */

  async function changeName(
    userId,
    name
  ) {

    setSavingId(userId);
    setError('');

    const {
      error
    } = await supabase
      .from('profiles')
      .update({
        name: name.trim()
      })
      .eq(
        'id',
        userId
      );

    if (error) {

      console.error(
        'Erreur modification nom:',
        error
      );

      setError(
        'Impossible de modifier le nom.'
      );

      setSavingId(null);

      return;
    }

    setUsers(
      prev =>
        prev.map(user =>
          user.id === userId
            ? {
                ...user,
                name: name.trim()
              }
            : user
        )
    );

    setSavingId(null);
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
     NON ADMIN
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

        <header>

          <div>

            <div className="eyebrow">
              BILLETTERIE ASSOCIATIVE
            </div>

            <h1>
              Gestion des utilisateurs
            </h1>

            <p>
              Gérez les noms et les droits d'accès.
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

        <section className="card">

          <div className="historyHeader">

            <div>

              <h2>
                Utilisateurs
              </h2>

              <p className="muted">
                {users.length}{' '}
                utilisateur
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

          {loading ? (

            <div className="info">
              Chargement des utilisateurs...
            </div>

          ) : users.length === 0 ? (

            <div className="info">
              Aucun utilisateur trouvé.
            </div>

          ) : (

            <div className="usersList">

              {users.map(user => (

                <div
                  className="userItem"
                  key={
                    user.id
                  }
                >

                  <div className="userInfo">

                    <div className="userAvatar">
                      {(
                        user.name ||
                        user.email ||
                        '?'
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="userIdentity">

                      <strong>
                        {user.name ||
                          'Sans nom'}
                      </strong>

                      <span>
                        {user.email ||
                          'E-mail inconnu'}
                      </span>

                      <small>
                        Créé le{' '}
                        {user.created_at
                          ? new Date(
                              user.created_at
                            ).toLocaleDateString(
                              'fr-FR'
                            )
                          : '—'}
                      </small>

                    </div>

                  </div>

                  <div className="userControls">

                    <label>

                      Nom

                      <input
                        type="text"
                        value={
                          user.name ||
                          ''
                        }
                        onChange={e => {

                          const value =
                            e.target.value;

                          setUsers(
                            prev =>
                              prev.map(
                                item =>
                                  item.id ===
                                  user.id
                                    ? {
                                        ...item,
                                        name:
                                          value
                                      }
                                    : item
                              )
                          );

                        }}
                        onBlur={e =>
                          changeName(
                            user.id,
                            e.target.value
                          )
                        }
                      />

                    </label>

                    <label>

                      Rôle

                      <select
                        value={
                          user.role ||
                          ''
                        }
                        disabled={
                          savingId ===
                          user.id
                        }
                        onChange={e =>
                          changeRole(
                            user.id,
                            e.target.value
                          )
                        }
                      >

                        <option value="">
                          Aucun rôle
                        </option>

                        <option value="admin">
                          Administrateur
                        </option>

                        <option value="responsable">
                          Responsable
                        </option>

                        <option value="benevole">
                          Bénévole
                        </option>

                      </select>

                    </label>

                    {savingId ===
                      user.id && (

                      <span className="saving">
                        ⏳ Enregistrement...
                      </span>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        <section className="card">

          <h2>
            Les rôles
          </h2>

          <div className="roleCards">

            <div className="roleCard adminRole">

              <div className="roleIcon">
                👑
              </div>

              <div>

                <strong>
                  Administrateur
                </strong>

                <p>
                  Accès complet à l'application,
                  y compris la gestion des utilisateurs
                  et l'historique des caisses.
                </p>

              </div>

            </div>

            <div className="roleCard responsableRole">

              <div className="roleIcon">
                🧑‍💼
              </div>

              <div>

                <strong>
                  Responsable
                </strong>

                <p>
                  Peut utiliser la caisse et consulter
                  l'historique, mais ne peut pas gérer
                  les utilisateurs.
                </p>

              </div>

            </div>

            <div className="roleCard benevoleRole">

              <div className="roleIcon">
                🙋
              </div>

              <div>

                <strong>
                  Bénévole
                </strong>

                <p>
                  Peut utiliser la caisse sans accès
                  à l'historique ni à la gestion
                  des utilisateurs.
                </p>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>

  );
}
