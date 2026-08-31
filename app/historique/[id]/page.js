'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import ImpressionCaisse from '../../composants/ImpressionCaisse';

const money = n =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(Number(n) || 0);

export default function CaisseDetail() {

  const params = useParams();
  const router = useRouter();

  const id = params.id;

  /* =========================================================
     ÉTATS
  ========================================================= */

  const [caisse, setCaisse] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [deleting, setDeleting] =
    useState(false);

  /* =========================================================
     THÈME
  ========================================================= */

  const [dark, setDark] =
    useState(false);

  /* =========================================================
     CHARGEMENT DU THÈME
  ========================================================= */

  useEffect(() => {

    const savedTheme =
      localStorage.getItem('caisse-theme');

    if (savedTheme === 'dark') {
      setDark(true);
    }

    if (savedTheme === 'light') {
      setDark(false);
    }

  }, []);

  /* =========================================================
     CHARGEMENT CAISSE
  ========================================================= */

  useEffect(() => {

    if (id) {
      loadCaisse();
    }

  }, [id]);

  async function loadCaisse() {

    setLoading(true);
    setError('');

    const {
      data,
      error
    } = await supabase
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

  /* =========================================================
     SUPPRESSION
  ========================================================= */

  async function deleteCaisse() {

    const confirmation =
      window.confirm(
        '⚠️ Supprimer définitivement cette caisse ?\n\n' +
        'Cette action est irréversible.'
      );

    if (!confirmation) {
      return;
    }

    setDeleting(true);

    const {
      error
    } = await supabase
      .from('caisses')
      .delete()
      .eq('id', id);

    if (error) {

      console.error(
        'Erreur suppression caisse:',
        error
      );

      alert(
        `Impossible de supprimer la caisse.\n\n${error.message}`
      );

      setDeleting(false);

      return;
    }

    router.push('/historique');

  }

  /* =========================================================
     CHARGEMENT
  ========================================================= */

  if (loading) {

    return (

      <main
        className={
          dark
            ? 'dark'
            : ''
        }
      >

        <div className="wrap">

          <section className="card">

            <div className="info">
              Chargement de la caisse...
            </div>

          </section>

        </div>

      </main>
    );
  }

  /* =========================================================
     ERREUR
  ========================================================= */

  if (error || !caisse) {

    return (

      <main
        className={
          dark
            ? 'dark'
            : ''
        }
      >

        <div className="wrap">

          <section className="card">

            <div className="info bad">
              {error ||
                'Caisse introuvable.'}
            </div>

            <Link
              href="/historique"
            >

              <button>
                ← Retour à l'historique
              </button>

            </Link>

          </section>

        </div>

      </main>
    );
  }

  /* =========================================================
     DONNÉES
  ========================================================= */

  const caData =
    caisse.ca_data || {};

  const opening =
    caisse.opening_data || {};

  const closing =
    caisse.closing_data || {};

  const payments =
    caisse.payments_data || {};

  const paymentTotals =
    payments.totals || {};

  const ancvByValue =
    payments.ancv_by_value || {};

  const multiplePayments =
    Array.isArray(
      caisse.multiple_payments
    )
      ? caisse.multiple_payments
      : [];

  const events =
    Array.isArray(
      caData.events
    )
      ? caData.events
      : [];

  const openingDenominations =
    opening.denominations || {};

  const closingDenominations =
    closing.denominations || {};

  const difference =
    Number(
      caisse.difference
    ) || 0;

  const differenceOk =
    Math.abs(
      difference
    ) < 0.005;

  const totalMultiple =
    multiplePayments.reduce(
      (
        sum,
        payment
      ) =>
        sum +
        Number(
          payment?.amount || 0
        ),
      0
    );

  /* =========================================================
     PAGE
  ========================================================= */

  return (

    <main
      className={
        dark
          ? 'dark'
          : ''
      }
    >

      <div className="wrap screenOnly">

        {/* =================================================
            HEADER
        ================================================= */}

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

            {caisse.responsible && (

              <p className="muted">

                Responsable de caisse :{' '}

                <strong>
                  {caisse.responsible}
                </strong>

              </p>

            )}

          </div>

          <div className="headerActions">

            <Link
              href="/historique"
            >

              <button>
                ← Historique
              </button>

            </Link>

            <Link
              href={`/?edit=${id}`}
            >

              <button className="primary">
                ✏️ Modifier
              </button>

            </Link>

            <button
              onClick={
                deleteCaisse
              }
              disabled={
                deleting
              }
            >

              {deleting
                ? '⏳ Suppression...'
                : '🗑️ Supprimer'}

            </button>

          </div>

        </header>

        {/* =================================================
            RESULTAT GLOBAL
        ================================================= */}

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

        {/* =================================================
            BILLETTERIE
        ================================================= */}

        <section className="card">

          <h2>
            Billetterie
          </h2>

          <p className="muted">
            Détail des ventes par évènement et par tarif.
          </p>

          {events.length === 0 ? (

            <div className="info">
              Aucun évènement enregistré.
            </div>

          ) : (

            events.map(
              (
                event,
                eventIndex
              ) => {

                const tickets =
                  Array.isArray(
                    event.tickets
                  )
                    ? event.tickets
                    : [];

                const quantities =
                  event.quantities ||
                  {};

                const eventTotal =
                  Number(
                    event.total || 0
                  );

                return (

                  <div
                    className="multiple"
                    key={
                      event.eventId ||
                      event.id ||
                      eventIndex
                    }
                  >

                    <div className="multipleHeader">

                      <strong>
                        {event.eventName ||
                          'Évènement'}
                      </strong>

                      <strong>
                        {money(
                          eventTotal
                        )}
                      </strong>

                    </div>

                    <div className="paymentSummary">

                      {tickets.map(
                        (
                          ticket,
                          ticketIndex
                        ) => {

                          let name;
                          let price;
                          let quantity;
                          let total;

                          if (
                            Array.isArray(
                              ticket
                            )
                          ) {

                            name =
                              ticket[0];

                            price =
                              Number(
                                ticket[1]
                              ) || 0;

                            quantity =
                              Number(
                                quantities[
                                  name
                                ] || 0
                              );

                            total =
                              quantity *
                              price;

                          } else {

                            name =
                              ticket?.name ||
                              'Tarif';

                            price =
                              Number(
                                ticket?.price ||
                                0
                              );

                            quantity =
                              Number(
                                ticket?.quantity ??
                                quantities[name] ??
                                0
                              );

                            total =
                              Number(
                                ticket?.total ??
                                (
                                  quantity *
                                  price
                                )
                              );

                          }

                          return (

                            <div
                              key={
                                ticket?.id ||
                                name ||
                                ticketIndex
                              }
                            >

                              <span>

                                {name}

                                {' — '}

                                {money(
                                  price
                                )}

                              </span>

                              <strong>

                                {quantity}

                                {' × '}

                                {money(
                                  price
                                )}

                                {' = '}

                                {money(
                                  total
                                )}

                              </strong>

                            </div>

                          );

                        }
                      )}

                    </div>

                    <div className="caBox">

                      <span>
                        CA {event.eventName}
                      </span>

                      <strong>
                        {money(
                          eventTotal
                        )}
                      </strong>

                    </div>

                  </div>

                );

              }
            )

          )}

          <div className="caBox">

            <span>
              CA BILLETTERIE TOTAL
            </span>

            <strong>
              {money(
                caisse.total_ca
              )}
            </strong>

          </div>

        </section>

        {/* =================================================
            FOND DE CAISSE
        ================================================= */}

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
                (
                  [
                    value,
                    quantity
                  ]
                ) => (

                  <div
                    className="cashrow"
                    key={
                      'opening-' +
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
                        Number(quantity)
                      )}
                    </strong>

                  </div>

                )
              )}

          </div>

          <div className="totalline">

            <span>
              FOND DE CAISSE INITIAL
            </span>

            <strong>
              {money(
                opening.total
              )}
            </strong>

          </div>

        </section>

        {/* =================================================
            FERMETURE ESPÈCES
        ================================================= */}

        <section className="card">

          <h2>
            Espèces à la fermeture
          </h2>

          <div className="cashgrid">

            {Object.entries(
              closingDenominations
            )
              .sort(
                ([a], [b]) =>
                  Number(b) -
                  Number(a)
              )
              .map(
                (
                  [
                    value,
                    quantity
                  ]
                ) => (

                  <div
                    className="cashrow"
                    key={
                      'closing-' +
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
                        Number(quantity)
                      )}
                    </strong>

                  </div>

                )
              )}

          </div>

          <div className="totalline">

            <span>
              SOMME TOTALE ESPÈCES
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

        {/* =================================================
            MOYENS DE PAIEMENT
        ================================================= */}

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

          {Object.keys(
            ancvByValue
          ).length === 0 ? (

            <div className="info">
              Aucun ANCV enregistré.
            </div>

          ) : (

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
                  (
                    [
                      value,
                      quantity
                    ]
                  ) => (

                    <div
                      className="cashrow"
                      key={
                        'ancv-' +
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
                          Number(quantity)
                        )}
                      </strong>

                    </div>

                  )
                )}

            </div>

          )}

          <div className="totalline">

            <span>
              TOTAL ANCV
            </span>

            <strong>
              {money(
                paymentTotals.ancv
              )}
            </strong>

          </div>

        </section>

        {/* =================================================
            PAIEMENTS MULTIPLES
        ================================================= */}

        <section className="card">

          <h2>
            Paiements multiples
          </h2>

          <p className="muted">
            Détail des transactions réglées avec plusieurs
            moyens de paiement.
          </p>

          {multiplePayments.length === 0 ? (

            <div className="info">
              Aucun paiement multiple.
            </div>

          ) : (

            <>

              {multiplePayments.map(
                (
                  payment,
                  index
                ) => {

                  const allocations =
                    payment?.allocations ||
                    {};

                  return (

                    <div
                      className="multiple"
                      key={
                        payment?.id ||
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
                            payment?.amount
                          )}
                        </strong>

                      </div>

                      <div className="info">

                        {Number(
                          allocations.cash
                        ) > 0 && (
                          <>
                            Espèces :{' '}
                            {money(
                              allocations.cash
                            )}
                            {' — '}
                          </>
                        )}

                        {Number(
                          allocations.tpe
                        ) > 0 && (
                          <>
                            TPE :{' '}
                            {money(
                              allocations.tpe
                            )}
                            {' — '}
                          </>
                        )}

                        {Number(
                          allocations.web
                        ) > 0 && (
                          <>
                            CB Web :{' '}
                            {money(
                              allocations.web
                            )}
                            {' — '}
                          </>
                        )}

                        {Number(
                          allocations.cheque
                        ) > 0 && (
                          <>
                            Chèque :{' '}
                            {money(
                              allocations.cheque
                            )}
                            {' — '}
                          </>
                        )}

                        {Number(
                          allocations.ancv
                        ) > 0 && (
                          <>
                            ANCV :{' '}
                            {money(
                              allocations.ancv
                            )}
                            {' — '}
                          </>
                        )}

                        {Number(
                          allocations.autre
                        ) > 0 && (
                          <>
                            Autre :{' '}
                            {money(
                              allocations.autre
                            )}
                          </>
                        )}

                      </div>

                    </div>

                  );

                }
              )}

              <div className="totalline">

                <span>
                  TOTAL PAIEMENTS MULTIPLES
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

        {/* =================================================
            CONTRÔLE
        ================================================= */}

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

          <div className="actions">

            <button
              onClick={() =>
                window.print()
              }
            >
              🖨️ Imprimer
            </button>

            <Link
              href="/historique"
            >

              <button>
                ← Retour à l'historique
              </button>

            </Link>

          </div>

        </section>

      </div>

      {/* =====================================================
          VERSION IMPRESSION
      ===================================================== */}

      <div className="historiquePrint">

        <ImpressionCaisse

          eventName={
            caisse.event_name
          }

          responsible={
            caisse.responsible
          }

          date={
            caisse.date
          }

          eventTotals={
            events
          }

          billValues={[
            50,
            20,
            10,
            5
          ]}

          coinValues={[
            2,
            1,
            0.5,
            0.2,
            0.1,
            0.05,
            0.02,
            0.01
          ]}

          opening={
            openingDenominations
          }

          closing={
            closingDenominations
          }

          openingCash={
            Number(
              opening.total
            ) || 0
          }

          openingBills={
            Number(
              opening.total
            ) || 0
          }

          openingCoins={0}

          closingCash={
            Number(
              closing.total
            ) || 0
          }

          cashBills={
            Number(
              closing.bills_total
            ) || 0
          }

          cashCoins={
            Number(
              closing.coins_total
            ) || 0
          }

          cashSales={
            Number(
              closing.cash_sales
            ) || 0
          }

          cashDifference={

            (
              Number(
                closing.total
              ) || 0
            ) -

            (
              (
                Number(
                  opening.total
                ) || 0
              ) +

              (
                Number(
                  closing.cash_sales
                ) || 0
              )
            )

          }

          payments={{

            tpe:
              Number(
                payments.simple?.tpe
              ) || 0,

            web:
              Number(
                payments.simple?.web
              ) || 0,

            cheque:
              Number(
                payments.simple?.cheque
              ) || 0,

            autre:
              Number(
                payments.simple?.autre
              ) || 0

          }}

          ancv={
            ancvByValue
          }

          ancvValues={[
            10,
            20,
            25,
            50
          ]}

          ancvTotal={
            Number(
              paymentTotals.ancv
            ) || 0
          }

          ancvDirectTotal={
            Number(
              payments.simple?.ancv
            ) || 0
          }

          multiplePayments={
            multiplePayments
          }

          paymentsTotal={
            Number(
              caisse.total_encaisse
            ) || 0
          }

          ca={
            Number(
              caisse.total_ca
            ) || 0
          }

          difference={
            difference
          }

          money={
            money
          }

        />

      </div>

    </main>
  );
}
