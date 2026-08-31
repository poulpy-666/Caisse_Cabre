'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

const roleLabel = {
  admin: 'Administrateur',
  responsable: 'Responsable',
  benevole: 'Bénévole'
};

const roleOptions = [
  {
    value: 'benevole',
    label: 'Bénévole'
  },
  {
    value: 'responsable',
    label: 'Responsable'
  },
  {
    value: 'admin',
    label: 'Administrateur'
  }
];

export default function Utilisateurs() {

  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [users, setUsers] = useState([]);

  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editingRole, setEditingRole] = useState('');

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
      session &&
      userRole === 'admin'
    ) {
      loadUsers();
    }

  }, [session, userRole]);

  async function loadUsers() {

    setLoading(true);
    setError('');
    setSuccess('');

    const {
      data,
      error
    } = await supabase
      .from('profiles')
      .select(
        'id, name, role, created_at'
      )
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
     MODIFICATION RÔLE
  ========================================================= */

  function startEditing(user) {

    setError('');
    setSuccess('');

    setEditingId(user.id);
    setEditingRole(
      user.role || 'benevole'
    );
  }

  function cancelEditing() {

    setEditingId(null);
    setEditingRole('');

  }

  async function saveRole(userId) {

    if (!editingRole) return;

    setError('');
    setSuccess('');

    setSavingId(userId);

    const {
      error
    } = await supabase
      .from('profiles')
      .update({
        role: editingRole
      })
      .eq('id', userId);

    setSavingId(null);

    if (error) {

      console.error(error);

      setError(
        `Impossible de modifier le rôle : ${error.message}`
      );

      return;
    }

    setUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? {
              ...user,
              role: editingRole
            }
          : user
      )
    );

    setEditingId(null);
    setEditingRole('');

    setSuccess(
      'Le rôle a été modifié avec succès.'
    );
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

        {/* =================================================
            HEADER
        ================================================= */}

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

        {/* =================================================
            MESSAGES
        ================================================= */}

        {error && (

          <div className="info bad">
            {error}
          </div>

        )}

        {success && (

          <div className="info">
            ✓ {success}
          </div>

        )}

        {/* =================================================
            UTILISATEURS
        ================================================= */}

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

          {!loading &&
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

                  const isEditing =
                    editingId ===
                    user.id;

                  const isSaving =
                    savingId ===
                    user.id;

                  return (

                    <div
                      className="historyItem"
                      key={
                        user.id
                      }
                    >

                      {/* NOM */}

                      <div>

                        <strong>
                          {user.name ||
                            'Nom non renseigné'}
                        </strong>

                        {isCurrentUser && (

                          <small>
                            Vous
                          </small>

                        )}

                        <small>
                          ID :{' '}
                          {user.id}
                        </small>

                      </div>

                      {/* RÔLE */}

                      <div>

                        <span>
                          Rôle
                        </span>

                        {!isEditing ? (

                          <strong>
                            {roleLabel[
                              role
                            ] || role}
                          </strong>

                        ) : (

                          <select
                            value={
                              editingRole
                            }
                            onChange={e =>
                              setEditingRole(
                                e.target.value
                              )
                            }
                            disabled={
                              isSaving
                            }
                          >

                            {roleOptions.map(
                              option => (

                                <option
                                  key={
                                    option.value
                                  }
                                  value={
                                    option.value
                                  }
                                >
                                  {
                                    option.label
                                  }
                                </option>

                              )
                            )}

                          </select>

                        )}

                      </div>

                      {/* DATE */}

                      <div>

                        <span>
                          Créé le
                        </span>

                        <strong>
                          {createdAt}
                        </strong>

                      </div>

                      {/* ACTION */}

                      <div>

                        {!isEditing ? (

                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                user
                              )
                            }
                          >
                            ✏️ Modifier
                          </button>

                        ) : (

                          <div
                            className="actions"
                            style={{
                              marginTop: 0
                            }}
                          >

                            <button
                              type="button"
                              className="primary"
                              onClick={() =>
                                saveRole(
                                  user.id
                                )
                              }
                              disabled={
                                isSaving
                              }
                            >
                              {isSaving
                                ? '⏳'
                                : '✓ Enregistrer'}
                            </button>

                            <button
                              type="button"
                              onClick={
                                cancelEditing
                              }
                              disabled={
                                isSaving
                              }
                            >
                              Annuler
                            </button>

                          </div>

                        )}

                      </div>

                    </div>

                  );

                }
              )}

            </div>

          )}

        </section>

        {/* =================================================
            INFORMATIONS
        ================================================= */}

        <section className="card">

          <h2>
            Rôles disponibles
          </h2>

          <div className="paymentSummary">

            <div>

              <span>
                Bénévole
              </span>

              <strong>
                Accès à la caisse uniquement
              </strong>

            </div>

            <div>

              <span>
                Responsable
              </span>

              <strong>
                Caisse + historique
              </strong>

            </div>

            <div>

              <span>
                Administrateur
              </span>

              <strong>
                Accès complet
              </strong>

            </div>

          </div>

        </section>

      </div>

    </main>

  );
}
