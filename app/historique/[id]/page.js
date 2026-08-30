'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

const money = n =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(n) || 0);

export default function CaisseDetail() {
  const params = useParams();
  const id = params.id;

  const [caisse, setCaisse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) loadCaisse();
  }, [id]);

  async function loadCaisse() {
    setLoading(true);
    setError('');

    const { data, error } = await supabase
      .from('caisses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      setError(
        'Impossible de charger cette caisse.'
      );
      setLoading(false);
      return;
    }

    setCaisse(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <main>
        <div className="wrap">
          <div className="info">
            Chargement de la caisse...
          </div>
        </div>
      </main>
    );
  }

  if (error || !caisse) {
    return (
      <main>
        <div className="wrap">
          <div className="info bad">
            {error || 'Caisse introuvable.'}
          </div>

          <Link href="/historique">
            <button>
              ← Retour à l'historique
            </button>
          </Link>
        </div>
      </main>
    );
  }

  const caData = caisse.ca_data || {};
  const opening = caisse.opening_data || {};
  const closing = caisse.closing_data || {};
  const payments = caisse.payments_data || {};
  const paymentTotals = payments.totals || {};
  const ancvByValue =
    payments.ancv_by_value || {};
  const multiplePayments =
    caisse.multiple_payments || [];

  const quantities =
    caData.quantities || {};

  const denominations =
    closing.denominations || {};

  const openingDenominations =
    opening.denominations || {};

  const difference =
    Number(caisse.difference) || 0;

  const differenceOk =
    Math.abs(difference) < 0.005;

  const totalMultiple =
    multiplePayments.reduce(
      (sum, payment) =>
        sum +
        Number(payment.amount || 0),
      0
    );

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
              Détail de la caisse
            </h1>

            <p>
              {caisse.event_name ||
                'Manifestation'}
              {' — '}
              {caisse.date}
            </p>
          </div>

          <Link href="/historique">
            <button>
              ← Historique
            </button>
          </Link>
        </header>

        {/* RESULTAT */}

        <section className="result">

          <div>
            <span>
              CA billetterie
            </span>

            <strong>
              {money(
                caisse.total_ca
              )}
            </strong>
          </div>

          <div>
            <span>
              Total encaissé
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

        </section>

        {/* BILLETS */}

        <section className="card">

          <h2>
            Billetterie
          </h2>

          <div className="paymentSummary">

            {[
              ['Tarif plein', 20],
              ['Moins de 12 ans', 12],
              ['Moins de 3 ans', 0],
              ['Invitation', 0],
              ['PMR', 20]
            ].map(
              ([name, price]) => (
                <div key={name}>

                  <span>
                    {name}
                    {' — '}
                    {money(price)}
                  </span>

                  <strong>
                    {quantities[name] || 0}
                    {' × '}
                    {money(price)}
                    {' = '}
                    {money(
                      (quantities[name] || 0) *
                        price
                    )}
                  </strong>

                </div>
              )
            )}

          </div>

          <div className="caBox">

            <span>
              CA billetterie
            </span>

            <strong>
              {money(
                caisse.total_ca
              )}
            </strong>

          </div>

        </section>

        {/* OUVERTURE */}

        <section className="card">

          <h2>
            Fond de caisse initial
          </h2>

          <div className="cashgrid">

            {Object.entries(
              openingDenominations
            )
              .sort(
                ([a], [b]) =>
                  Number(b) -
                  Number(a)
              )
              .map(
                ([value, quantity]) => (

                  <div
                    className="cashrow"
                    key={
                      'opening' +
                      value
                    }
                  >

                    <span>
                      {money(
                        Number(value)
                      )}
                    </span>

                    <strong>
                      {quantity}
                    </strong>

                    <strong>
                      {money(
                        Number(value) *
                          Number(
                            quantity
                          )
                      )}
                    </strong>

                  </div>

                )
              )}

          </div>

          <div className="totalline">

            <span>
              Fond initial
            </span>

            <strong>
              {money(
                opening.total
              )}
            </strong>

          </div>

        </section>

        {/* FERMETURE */}

        <section className="card">

          <h2>
            Espèces à la fermeture
          </h2>

          <div className="cashgrid">

            {Object.entries(
              denominations
            )
              .sort(
                ([a], [b]) =>
                  Number(b) -
                  Number(a)
              )
              .map(
                ([value, quantity]) => (

                  <div
                    className="cashrow"
                    key={
                      'closing' +
                      value
                    }
                  >

                    <span>
                      {money(
                        Number(value)
                      )}
                    </span>

                    <strong>
                      {quantity}
                    </strong>

                    <strong>
                      {money(
                        Number(value) *
                          Number(
                            quantity
                          )
                      )}
                    </strong>

                  </div>

                )
              )}

          </div>

          <div className="totalline">

            <span>
              Somme totale espèces
            </span>

            <strong>
              {money(
                closing.total
              )}
            </strong>

          </div>

          <div className="info">

            Somme billets :{' '}

            <strong>
              {money(
                closing.bills_total
              )}
            </strong>

            {' — '}

            Somme monnaie :{' '}

            <strong>
              {money(
                closing.coins_total
              )}
            </strong>

            <br />

            Espèces issues des ventes :{' '}

            <strong>
              {money(
                closing.cash_sales
              )}
            </strong>

          </div>

        </section>

        {/* PAIEMENTS */}

        <section className="card">

          <h2>
            Moyens de paiement
          </h2>

          <div className="paymentSummary">

            <div>
              <span>
                CB Guichet — TPE
              </span>

              <strong>
                {money(
                  paymentTotals.tpe
                )}
              </strong>
            </div>

            <div>
              <span>
                CB Web
              </span>

              <strong>
                {money(
                  paymentTotals.web
                )}
              </strong>
            </div>

            <div>
              <span>
                Chèques
              </span>

              <strong>
                {money(
                  paymentTotals.cheque
                )}
              </strong>
            </div>

            <div>
              <span>
                Chèques-Vacances ANCV
              </span>

              <strong>
                {money(
                  paymentTotals.ancv
                )}
              </strong>
            </div>

            <div>
              <span>
                ANCV Connect
              </span>

              <strong>
                {money(
                  paymentTotals.connect
                )}
              </strong>
            </div>

            <div>
              <span>
                Autre
              </span>

              <strong>
                {money(
                  paymentTotals.autre
                )}
              </strong>
            </div>

          </div>

          <h3>
            Détail des ANCV
          </h3>

          <div className="cashgrid">

            {Object.entries(
              ancvByValue
            )
              .sort(
                ([a], [b]) =>
                  Number(a) -
                  Number(b)
              )
              .map(
                ([value, quantity]) => (

                  <div
                    className="cashrow"
                    key={
                      'ancv' +
                      value
                    }
                  >

                    <span>
                      {money(
                        Number(value)
                      )}
                    </span>

                    <strong>
                      {quantity}
                    </strong>

                    <strong>
                      {money(
                        Number(value) *
                          Number(
                            quantity
                          )
                      )}
                    </strong>

                  </div>

                )
              )}

          </div>

        </section>

        {/* PAIEMENTS MULTIPLES */}

        <section className="card">

          <h2>
            Paiements multiples
          </h2>

          {multiplePayments.length === 0 ? (

            <div className="info">
              Aucun paiement multiple.
            </div>

          ) : (

            <>
              {multiplePayments.map(
                (payment, index) => (

                  <div
                    className="multiple"
                    key={
                      payment.id ||
                      index
                    }
                  >

                    <div className="multipleHeader">

                      <strong>
                        Paiement multiple #
                        {index + 1}
                      </strong>

                      <strong>
                        {money(
                          payment.amount
                        )}
                      </strong>

                    </div>

                    <div className="info">

                      {payment.allocations?.cash > 0 && (
                        <>
                          Espèces :{' '}
                          {money(
                            payment.allocations.cash
                          )}
                          {' — '}
                        </>
                      )}

                      {payment.allocations?.tpe > 0 && (
                        <>
                          TPE :{' '}
                          {money(
                            payment.allocations.tpe
                          )}
                          {' — '}
                        </>
                      )}

                      {payment.allocations?.web > 0 && (
                        <>
                          CB Web :{' '}
                          {money(
                            payment.allocations.web
                          )}
                          {' — '}
                        </>
                      )}

                      {payment.allocations?.cheque > 0 && (
                        <>
                          Chèque :{' '}
                          {money(
                            payment.allocations.cheque
                          )}
                          {' — '}
                        </>
                      )}

                      {payment.allocations?.ancv > 0 && (
                        <>
                          ANCV :{' '}
                          {money(
                            payment.allocations.ancv
                          )}
                          {' — '}
                        </>
                      )}

                      {payment.allocations?.connect > 0 && (
                        <>
                          ANCV Connect :{' '}
                          {money(
                            payment.allocations.connect
                          )}
                          {' — '}
                        </>
                      )}

                      {payment.allocations?.autre > 0 && (
                        <>
                          Autre :{' '}
                          {money(
                            payment.allocations.autre
                          )}
                        </>
                      )}

                    </div>

                  </div>

                )
              )}

              <div className="totalline">

                <span>
                  Total paiements multiples
                </span>

                <strong>
                  {money(
                    totalMultiple
                  )}
                </strong>

              </div>
            </>

          )}

        </section>

        {/* CONTROLES */}

        <section className="result">

          <div
            className={
              differenceOk
                ? 'ok'
                : 'bad'
            }
          >

            <span>
              Contrôle de caisse
            </span>

            <strong>
              {differenceOk
                ? '✓ OK'
                : '⚠️ Écart constaté'}
            </strong>

          </div>

          <div className="actions">

            <button
              onClick={() =>
                window.print()
              }
            >
              🖨️ Imprimer
            </button>

            <Link href="/historique">
              <button>
                ← Retour à l'historique
              </button>
            </Link>

          </div>

        </section>

      </div>
    </main>
  );
}
