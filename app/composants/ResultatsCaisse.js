'use client';

export default function ResultatsCaisse({
  ca,
  openingCash,
  closingCash,
  cashSales,
  cashDifference,
  paymentsTotal,
  difference,
  payments,
  ancvTotal,
  multiplePayments,
  saving,
  closed,
  closeCash,
  reset,
  money
}) {

  const differenceOk =
    Math.abs(
      Number(difference) || 0
    ) < 0.005;

  const cashDifferenceOk =
    Math.abs(
      Number(cashDifference) || 0
    ) < 0.005;

  const differenceValue =
    Number(difference) || 0;

  const cashDifferenceValue =
    Number(cashDifference) || 0;

  let status = 'ok';
  let statusTitle = 'CAISSE ÉQUILIBRÉE';
  let statusText =
    'Le montant encaissé correspond au CA.';

  if (!differenceOk) {

    if (differenceValue < 0) {

      status = 'bad';

      statusTitle = 'MANQUE EN CAISSE';

      statusText =
        `Il manque ${money(
          Math.abs(
            differenceValue
          )
        )}.`;

    } else {

      status = 'warning';

      statusTitle = 'EXCÉDENT DE CAISSE';

      statusText =
        `Il y a un excédent de ${money(
          differenceValue
        )}.`;

    }

  }

  return (
    <>
      {/* =================================================
          CONTRÔLE DES ESPÈCES
      ================================================= */}

      <section className="card">

        <h2>
          6. Contrôle des espèces
        </h2>

        <div className="cashControl">

          <div className="cashControlRow">

            <span>
              Fond de caisse initial
            </span>

            <strong>
              {money(openingCash)}
            </strong>

          </div>

          <div className="cashControlRow">

            <span>
              + Espèces issues des ventes
            </span>

            <strong>
              {money(cashSales)}
            </strong>

          </div>

          <div className="cashControlExpected">

            <span>
              ESPÈCES ATTENDUES
            </span>

            <strong>
              {money(
                openingCash +
                cashSales
              )}
            </strong>

          </div>

          <div className="cashControlRow">

            <span>
              Espèces réellement comptées
            </span>

            <strong>
              {money(closingCash)}
            </strong>

          </div>

          <div
            className={
              cashDifferenceOk
                ? 'cashControlDifference ok'
                : 'cashControlDifference bad'
            }
          >

            <span>
              ÉCART ESPÈCES
            </span>

            <strong>
              {money(
                cashDifference
              )}
            </strong>

          </div>

        </div>

        {!cashDifferenceOk && (

          <div className="info bad">

            {cashDifferenceValue < 0
              ? (
                <>
                  ⚠️ Il manque{' '}
                  <strong>
                    {money(
                      Math.abs(
                        cashDifferenceValue
                      )
                    )}
                  </strong>{' '}
                  en espèces.
                </>
              )
              : (
                <>
                  ⚠️ Il y a un excédent de{' '}
                  <strong>
                    {money(
                      cashDifferenceValue
                    )}
                  </strong>{' '}
                  en espèces.
                </>
              )}

          </div>

        )}

        {cashDifferenceOk && (

          <div className="info">

            ✓ Le comptage des espèces correspond
            aux espèces attendues.

          </div>

        )}

      </section>

      {/* =================================================
          MOYENS DE PAIEMENT
      ================================================= */}

      <section className="card">

        <h2>
          7. Récapitulatif des encaissements
        </h2>

        <div className="paymentSummary">

          <div>

            <span>
              Espèces issues des ventes
            </span>

            <strong>
              {money(cashSales)}
            </strong>

          </div>

          <div>

            <span>
              CB Guichet — TPE
            </span>

            <strong>
              {money(
                payments.tpe
              )}
            </strong>

          </div>

          <div>

            <span>
              CB Web
            </span>

            <strong>
              {money(
                payments.web
              )}
            </strong>

          </div>

          <div>

            <span>
              Chèques
            </span>

            <strong>
              {money(
                payments.cheque
              )}
            </strong>

          </div>

          <div>

            <span>
              Chèques-Vacances ANCV
            </span>

            <strong>
              {money(
                ancvTotal
              )}
            </strong>

          </div>

          <div>

            <span>
              Autre
            </span>

            <strong>
              {money(
                payments.autre
              )}
            </strong>

          </div>

        </div>

        {multiplePayments.length > 0 && (

          <div className="info">

            <strong>
              Paiements multiples :
            </strong>{' '}

            {money(
              multiplePayments.reduce(
                (
                  total,
                  payment
                ) =>
                  total +
                  Number(
                    payment.amount ||
                    0
                  ),
                0
              )
            )}

          </div>

        )}

        <div className="caBox">

          <span>
            TOTAL ENCAISSÉ
          </span>

          <strong>
            {money(
              paymentsTotal
            )}
          </strong>

        </div>

      </section>

      {/* =================================================
          CONTRÔLE FINAL
      ================================================= */}

      <section className="result">

        <div>

          <span>
            CA BILLETTERIE
          </span>

          <strong>
            {money(ca)}
          </strong>

        </div>

        <div>

          <span>
            TOTAL ENCAISSÉ
          </span>

          <strong>
            {money(
              paymentsTotal
            )}
          </strong>

        </div>

        <div
          className={
            status
          }
        >

          <span>
            ÉCART FINAL
          </span>

          <strong>
            {money(
              difference
            )}
          </strong>

        </div>

        <div className="finalStatus">

          <div
            className={
              `finalStatusBox ${status}`
            }
          >

            <strong>
              {statusTitle}
            </strong>

            <span>
              {statusText}
            </span>

          </div>

        </div>

        <div className="actions">

          <button
            type="button"
            className="primary"
            onClick={
              closeCash
            }
            disabled={
              saving ||
              closed
            }
          >

            {saving
              ? '⏳ Sauvegarde...'
              : closed
                ? '✓ Caisse sauvegardée'
                : 'Clôturer et sauvegarder'}

          </button>

          <button
            type="button"
            onClick={
              reset
            }
            disabled={
              saving
            }
          >
            Nouvelle caisse
          </button>

          {closed && (

            <button
              type="button"
              onClick={() =>
                window.print()
              }
            >
              🖨️ Imprimer
            </button>

          )}

        </div>

        {closed && (

          <div className="closed">

            ✓ Caisse clôturée et sauvegardée.

          </div>

        )}

      </section>
    </>
  );
}
