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
  const [caisses, setCaisses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCaisses();
  }, []);

  async function loadCaisses() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('caisses')
      .select(
        'id, created_at, event_name, date, total_ca, total_encaisse, difference'
      )
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setError(
        'Impossible de charger l’historique des caisses.'
      );
      setLoading(false);
      return;
    }

    setCaisses(data || []);
    setLoading(false);
  }

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

          <Link href="/">
            <button>
              ← Nouvelle caisse
            </button>
          </Link>
        </header>

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
              ↻ Actualiser
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
            caisses.length > 0 && (

              <div className="history">

                {caisses.map(caisse => {

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
                })}

              </div>
            )}

        </section>

      </div>
    </main>
  );
}
