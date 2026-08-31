'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header({
  userRole,
  dark,
  setDark,
  onLogout
}) {

  const pathname = usePathname();

  /* =================================================
     CHARGEMENT DU THÈME
  ================================================= */

  useEffect(() => {

    const savedTheme =
      localStorage.getItem('caisse-theme');

    if (savedTheme === 'dark') {
      setDark(true);
    }

    if (savedTheme === 'light') {
      setDark(false);
    }

  }, [setDark]);


  /* =================================================
     CHANGEMENT DU THÈME
  ================================================= */

  function toggleTheme() {

    const newDark =
      !dark;

    setDark(newDark);

    localStorage.setItem(
      'caisse-theme',
      newDark
        ? 'dark'
        : 'light'
    );

  }


  /* =================================================
     PAGE ACTUELLE
  ================================================= */

  const isCaisse =
    pathname === '/';

  const isHistorique =
    pathname === '/historique' ||
    pathname.startsWith('/historique/');

  const isTarifs =
    pathname === '/Tarifs' ||
    pathname.startsWith('/Tarifs/');

  const isUtilisateurs =
    pathname === '/Utilisateurs' ||
    pathname.startsWith('/Utilisateurs/');


  return (

    <header>

      {/* =================================================
          TITRE
      ================================================= */}

      <div>

        <div className="eyebrow">
          BILLETTERIE ASSOCIATIVE
        </div>

        <h1>

          {isHistorique
            ? 'Historique des caisses'
            : isTarifs
              ? 'Gestion des tarifs'
              : isUtilisateurs
                ? 'Gestion des utilisateurs'
                : 'Clôture de caisse'}

        </h1>

        <p>

          {isHistorique
            ? 'Retrouvez et analysez les clôtures enregistrées.'
            : isTarifs
              ? 'Gérez les événements et les tarifs de billetterie.'
              : isUtilisateurs
                ? 'Gérez les utilisateurs et leurs autorisations.'
                : 'Ouverture → comptage → fermeture → contrôle.'}

        </p>

      </div>


      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="headerActions">

        <span className="userRole">

          {userRole === 'admin'
            ? 'Administrateur'
            : userRole === 'responsable'
              ? 'Responsable'
              : 'Bénévole'}

        </span>


        {/* CAISSE */}

        {!isCaisse && (

          <Link href="/">

            <button type="button">
              🧾 Caisse
            </button>

          </Link>

        )}


        {/* UTILISATEURS */}

        {userRole === 'admin' &&
          !isUtilisateurs && (

            <Link href="/Utilisateurs">

              <button type="button">
                👥 Utilisateurs
              </button>

            </Link>

          )}


        {/* HISTORIQUE */}

        {(userRole === 'admin' ||
          userRole === 'responsable') &&
          !isHistorique && (

            <Link href="/historique">

              <button type="button">
                📋 Historique
              </button>

            </Link>

          )}


        {/* TARIFS */}

        {(userRole === 'admin' ||
          userRole === 'responsable') &&
          !isTarifs && (

            <Link href="/Tarifs">

              <button type="button">
                💶 Tarifs
              </button>

            </Link>

          )}


        {/* DÉCONNEXION */}

        <button
          type="button"
          onClick={onLogout}
        >
          Déconnexion
        </button>


        {/* THÈME */}

        <button
          type="button"
          className="theme"
          onClick={toggleTheme}
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
