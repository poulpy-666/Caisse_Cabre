'use client';

import Link from 'next/link';

export default function Header({
  userRole,
  dark,
  setDark,
  onLogout
}) {

  return (
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

          {userRole === 'admin'
            ? 'Administrateur'
            : userRole === 'responsable'
              ? 'Responsable'
              : 'Bénévole'}

        </span>

        {userRole === 'admin' && (

          <Link href="/Utilisateurs">

            <button type="button">
              👥 Utilisateurs
            </button>

          </Link>

        )}

        {(userRole === 'admin' ||
          userRole === 'responsable') && (

          <Link href="/historique">

            <button type="button">
              📋 Historique
            </button>

          </Link>

        )}

        {(userRole === 'admin' ||
          userRole === 'responsable') && (

          <Link href="/Tarifs">

            <button type="button">
              💶 Tarifs
            </button>

          </Link>

        )}

        <button
          type="button"
          onClick={onLogout}
        >
          Déconnexion
        </button>

        <button
          type="button"
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

      </div>

    </header>
  );
}
