'use client';

export default function ImpressionCaisse({
  eventName,
  responsible,
  date,
  eventTotals,

  billValues,
  coinValues,
  opening,
  closing,

  openingCash,
  openingBills,
  openingCoins,

  closingCash,
  cashBills,
  cashCoins,
  cashSales,
  cashDifference,

  payments,
  ancv,
  ancvValues,
  ancvTotal,
  ancvDirectTotal,

  multiplePayments,
  paymentsTotal,
  ca,
  difference,

  money
}) {

  const differenceValue =
    Number(difference) || 0;

  const cashDifferenceValue =
    Number(cashDifference) || 0;

  const differenceOk =
    Math.abs(
      differenceValue
    ) < 0.005;

  let statusTitle =
    'CAISSE ÉQUILIBRÉE';

  let statusText =
    'Le montant encaissé correspond au CA.';

  let statusClass =
    'printStatusOk';

  if (!differenceOk) {

    if (differenceValue < 0) {

      statusTitle =
        'MANQUE DE CAISSE';

      statusText =
        `Il manque ${money(
          Math.abs(
            differenceValue
          )
        )}.`;

      statusClass =
        'printStatusBad';

    } else {

      statusTitle =
        'EXCÉDENT DE CAISSE';

      statusText =
        `Excédent de ${money(
          differenceValue
        )}.`;

      statusClass =
        'printStatusWarning';

    }

  }

  return (

    <div className="printSheet">

      {/* =================================================
          EN-TÊTE
      ================================================= */}

      <div className="printHeader">

        <div>

          <div className="printEyebrow">
            BILLETTERIE ASSOCIATIVE
          </div>

          <h1>
            CLÔTURE DE CAISSE
          </h1>

        </div>

        <div className="printHeaderInfo">

          <div>
            <span>
              Manifestation
            </span>

            <strong>
              {eventName ||
                '—'}
            </strong>
          </div>

          <div>
            <span>
              Date
            </span>

            <strong>
              {date ||
                '—'}
            </strong>
          </div>

          <div>
            <span>
              Responsable
            </span>

            <strong>
              {responsible ||
                '—'}
            </strong>
          </div>

        </div>

      </div>


      {/* =================================================
          1. BILLETTERIE
      ================================================= */}

      <section className="printSection">

        <h2>
          1. Billetterie
        </h2>

        {eventTotals.map(
          event => (

            <div
              className="printEvent"
              key={event.id}
            >

              <h3>
                {event.eventName}
              </h3>

              <table>

                <thead>

                  <tr>

                    <th>
                      Tarif
                    </th>

                    <th className="right">
                      Quantité
                    </th>

                    <th className="right">
                      Prix
                    </th>

                    <th className="right">
                      Total
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {event.tickets.map(
                    ticket => {

                      const quantity =
                        Number(
                          event
                            .quantities[
                              ticket.name
                            ] || 0
                        );

                      const total =
                        quantity *
                        Number(
                          ticket.price
                        );

                      return (

                        <tr
                          key={
                            ticket.id
                          }
                        >

                          <td>
                            {ticket.name}
                          </td>

                          <td className="right">
                            {quantity}
                          </td>

                          <td className="right">
                            {money(
                              ticket.price
                            )}
                          </td>

                          <td className="right">
                            {money(
                              total
                            )}
                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

                <tfoot>

                  <tr>

                    <td
                      colSpan="3"
                      className="right"
                    >
                      CA événement
                    </td>

                    <td className="right">
                      <strong>
                        {money(
                          event.total
                        )}
                      </strong>
                    </td>

                  </tr>

                </tfoot>

              </table>

            </div>

          )
        )}

        <div className="printTotalBox">

          <span>
            CA BILLETTERIE TOTAL
          </span>

          <strong>
            {money(ca)}
          </strong>

        </div>

      </section>


      {/* =================================================
          2. FOND DE CAISSE
      ================================================= */}

      <section className="printSection">

        <h2>
          2. Fond de caisse initial
        </h2>

        <div className="printColumns">

          {/* BILLETS */}

          <div>

            <h3>
              Billets
            </h3>

            <table>

              <thead>

                <tr>
                  <th>
                    Valeur
                  </th>

                  <th className="right">
                    Quantité
                  </th>

                  <th className="right">
                    Total
                  </th>
                </tr>

              </thead>

              <tbody>

                {billValues.map(
                  value => (

                    <tr
                      key={
                        'opening-print-bill-' +
                        value
                      }
                    >

                      <td>
                        {money(value)}
                      </td>

                      <td className="right">
                        {opening[value] || 0}
                      </td>

                      <td className="right">
                        {money(
                          value *
                          (
                            opening[value] ||
                            0
                          )
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          {/* MONNAIE */}

          <div>

            <h3>
              Monnaie
            </h3>

            <table>

              <thead>

                <tr>
                  <th>
                    Valeur
                  </th>

                  <th className="right">
                    Quantité
                  </th>

                  <th className="right">
                    Total
                  </th>
                </tr>

              </thead>

              <tbody>

                {coinValues.map(
                  value => (

                    <tr
                      key={
                        'opening-print-coin-' +
                        value
                      }
                    >

                      <td>
                        {money(value)}
                      </td>

                      <td className="right">
                        {opening[value] || 0}
                      </td>

                      <td className="right">
                        {money(
                          value *
                          (
                            opening[value] ||
                            0
                          )
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

        <div className="printTotalBox">

          <span>
            FOND DE CAISSE INITIAL
          </span>

          <strong>
            {money(openingCash)}
          </strong>

        </div>

      </section>


      {/* =================================================
          3. COMPTAGE DE FERMETURE
      ================================================= */}

      <section className="printSection">

        <h2>
          3. Comptage des espèces à la fermeture
        </h2>

        <div className="printColumns">

          {/* BILLETS */}

          <div>

            <h3>
              Billets
            </h3>

            <table>

              <thead>

                <tr>
                  <th>
                    Valeur
                  </th>

                  <th className="right">
                    Quantité
                  </th>

                  <th className="right">
                    Total
                  </th>
                </tr>

              </thead>

              <tbody>

                {billValues.map(
                  value => (

                    <tr
                      key={
                        'closing-print-bill-' +
                        value
                      }
                    >

                      <td>
                        {money(value)}
                      </td>

                      <td className="right">
                        {closing[value] || 0}
                      </td>

                      <td className="right">
                        {money(
                          value *
                          (
                            closing[value] ||
                            0
                          )
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

          {/* MONNAIE */}

          <div>

            <h3>
              Monnaie
            </h3>

            <table>

              <thead>

                <tr>
                  <th>
                    Valeur
                  </th>

                  <th className="right">
                    Quantité
                  </th>

                  <th className="right">
                    Total
                  </th>
                </tr>

              </thead>

              <tbody>

                {coinValues.map(
                  value => (

                    <tr
                      key={
                        'closing-print-coin-' +
                        value
                      }
                    >

                      <td>
                        {money(value)}
                      </td>

                      <td className="right">
                        {closing[value] || 0}
                      </td>

                      <td className="right">
                        {money(
                          value *
                          (
                            closing[value] ||
                            0
                          )
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </div>

        <div className="printTotalBox">

          <span>
            ESPÈCES COMPTÉES
          </span>

          <strong>
            {money(closingCash)}
          </strong>

        </div>

      </section>


      {/* =================================================
          4. CONTRÔLE ESPÈCES
      ================================================= */}

      <section className="printSection">

        <h2>
          4. Contrôle des espèces
        </h2>

        <table className="printControlTable">

          <tbody>

            <tr>

              <td>
                Fond de caisse initial
              </td>

              <td className="right">
                {money(openingCash)}
              </td>

            </tr>

            <tr>

              <td>
                + Espèces issues des ventes
              </td>

              <td className="right">
                {money(cashSales)}
              </td>

            </tr>

            <tr className="highlight">

              <td>
                <strong>
                  ESPÈCES ATTENDUES
                </strong>
              </td>

              <td className="right">
                <strong>
                  {money(
                    openingCash +
                    cashSales
                  )}
                </strong>
              </td>

            </tr>

            <tr>

              <td>
                Espèces réellement comptées
              </td>

              <td className="right">
                {money(closingCash)}
              </td>

            </tr>

            <tr
              className={
                cashDifferenceValue === 0
                  ? 'successRow'
                  : 'errorRow'
              }
            >

              <td>
                <strong>
                  ÉCART ESPÈCES
                </strong>
              </td>

              <td className="right">

                <strong>
                  {money(
                    cashDifference
                  )}
                </strong>

              </td>

            </tr>

          </tbody>

        </table>

      </section>


      {/* =================================================
          5. AUTRES MOYENS DE PAIEMENT
      ================================================= */}

      <section className="printSection">

        <h2>
          5. Moyens de paiement
        </h2>

        <table className="printControlTable">

          <tbody>

            <tr>

              <td>
                Espèces issues des ventes
              </td>

              <td className="right">
                {money(cashSales)}
              </td>

            </tr>

            <tr>

              <td>
                CB Guichet — TPE
              </td>

              <td className="right">
                {money(
                  payments.tpe
                )}
              </td>

            </tr>

            <tr>

              <td>
                CB Web
              </td>

              <td className="right">
                {money(
                  payments.web
                )}
              </td>

            </tr>

            <tr>

              <td>
                Chèques
              </td>

              <td className="right">
                {money(
                  payments.cheque
                )}
              </td>

            </tr>

            <tr>

              <td>
                Chèques-Vacances ANCV
              </td>

              <td className="right">
                {money(
                  ancvTotal
                )}
              </td>

            </tr>

            <tr>

              <td>
                Autre
              </td>

              <td className="right">
                {money(
                  payments.autre
                )}
              </td>

            </tr>

          </tbody>

        </table>

        {/* ANCV DETAIL */}

        {ancvDirectTotal > 0 && (

          <div className="printSubsection">

            <h3>
              Détail des ANCV
            </h3>

            <table>

              <thead>

                <tr>

                  <th>
                    Valeur
                  </th>

                  <th className="right">
                    Quantité
                  </th>

                  <th className="right">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {ancvValues.map(
                  value => {

                    const quantity =
                      Number(
                        ancv[value] ||
                        0
                      );

                    if (
                      quantity === 0
                    ) {
                      return null;
                    }

                    return (

                      <tr
                        key={
                          'print-ancv-' +
                          value
                        }
                      >

                        <td>
                          {money(value)}
                        </td>

                        <td className="right">
                          {quantity}
                        </td>

                        <td className="right">
                          {money(
                            value *
                            quantity
                          )}
                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

        {/* PAIEMENTS MULTIPLES */}

        {multiplePayments.length > 0 && (

          <div className="printSubsection">

            <h3>
              Paiements multiples
            </h3>

            <table>

              <thead>

                <tr>

                  <th>
                    N°
                  </th>

                  <th>
                    Répartition
                  </th>

                  <th className="right">
                    Montant
                  </th>

                </tr>

              </thead>

              <tbody>

                {multiplePayments.map(
                  (
                    payment,
                    index
                  ) => (

                    <tr
                      key={
                        payment.id ||
                        index
                      }
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>

                        {payment.allocations?.cash > 0 && (
                          <>
                            Espèces :{' '}
                            {money(
                              payment
                                .allocations
                                .cash
                            )}{' '}
                          </>
                        )}

                        {payment.allocations?.tpe > 0 && (
                          <>
                            TPE :{' '}
                            {money(
                              payment
                                .allocations
                                .tpe
                            )}{' '}
                          </>
                        )}

                        {payment.allocations?.web > 0 && (
                          <>
                            CB Web :{' '}
                            {money(
                              payment
                                .allocations
                                .web
                            )}{' '}
                          </>
                        )}

                        {payment.allocations?.cheque > 0 && (
                          <>
                            Chèque :{' '}
                            {money(
                              payment
                                .allocations
                                .cheque
                            )}{' '}
                          </>
                        )}

                        {payment.allocations?.ancv > 0 && (
                          <>
                            ANCV :{' '}
                            {money(
                              payment
                                .allocations
                                .ancv
                            )}{' '}
                          </>
                        )}

                        {payment.allocations?.autre > 0 && (
                          <>
                            Autre :{' '}
                            {money(
                              payment
                                .allocations
                                .autre
                            )}
                          </>
                        )}

                      </td>

                      <td className="right">

                        <strong>
                          {money(
                            payment.amount
                          )}
                        </strong>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* =================================================
          6. RÉCAPITULATIF FINAL
      ================================================= */}

      <section className="printSection">

        <h2>
          6. Récapitulatif final
        </h2>

        <table className="printFinalTable">

          <tbody>

            <tr>

              <td>
                CA billetterie
              </td>

              <td className="right">
                {money(ca)}
              </td>

            </tr>

            <tr>

              <td>
                Total encaissé
              </td>

              <td className="right">
                <strong>
                  {money(
                    paymentsTotal
                  )}
                </strong>
              </td>

            </tr>

            <tr className="finalDifference">

              <td>
                ÉCART FINAL
              </td>

              <td className="right">
                <strong>
                  {money(
                    difference
                  )}
                </strong>
              </td>

            </tr>

          </tbody>

        </table>

        <div
          className={
            `printStatus ${statusClass}`
          }
        >

          <strong>
            {statusTitle}
          </strong>

          <span>
            {statusText}
          </span>

        </div>

      </section>


      {/* =================================================
          SIGNATURE
      ================================================= */}

      <section className="printSignature">

        <div>

          <strong>
            Responsable de caisse
          </strong>

          <div className="signatureLine">
            {responsible || ''}
          </div>

        </div>

        <div>

          <strong>
            Signature
          </strong>

          <div className="signatureSpace">
          </div>

        </div>

        <div>

          <strong>
            Observations
          </strong>

          <div className="observationsSpace">
          </div>

        </div>

      </section>

      <footer className="printFooter">

        Document de clôture de caisse —{' '}

        {date || '—'}

      </footer>

    </div>
  );
}
