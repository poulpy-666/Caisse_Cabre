'use client';

export default function ImpressionCaisse({
  eventName,
  responsible,
  date,

  eventTotals = [],

  billValues = [],
  coinValues = [],

  opening = {},
  closing = {},

  openingCash = 0,
  closingCash = 0,

  cashSales = 0,
  cashDifference = 0,

  payments = {},

  ancv = {},
  ancvValues = [],
  ancvTotal = 0,

  multiplePayments = [],

  paymentsTotal = 0,
  ca = 0,
  difference = 0,

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

      <header className="printHeader">

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
              {eventName || '—'}
            </strong>
          </div>

          <div>
            <span>
              Date
            </span>

            <strong>
              {date || '—'}
            </strong>
          </div>

          <div>
            <span>
              Responsable
            </span>

            <strong>
              {responsible || '—'}
            </strong>
          </div>

        </div>

      </header>


      {/* =================================================
          1. BILLETTERIE
      ================================================= */}

      <section className="printSection">

        <h2>
          1. Billetterie
        </h2>

        {eventTotals.length === 0 ? (

          <p>
            Aucun événement enregistré.
          </p>

        ) : (

          eventTotals.map(
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

              return (

                <div
                  className="printEvent"
                  key={
                    event.id ||
                    event.eventId ||
                    eventIndex
                  }
                >

                  <h3>
                    {event.eventName ||
                      'Événement'}
                  </h3>

                  <table>

                    <thead>

                      <tr>

                        <th>
                          Tarif
                        </th>

                        <th className="right">
                          Qté
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

                      {tickets.map(
                        (
                          ticket,
                          ticketIndex
                        ) => {

                          let name =
                            'Tarif';

                          let price =
                            0;

                          let quantity =
                            0;

                          let total =
                            0;

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
                                event
                                  .quantities?.[
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
                                event
                                  .quantities?.[
                                    name
                                  ] ??
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

                            <tr
                              key={
                                ticket?.id ||
                                name ||
                                ticketIndex
                              }
                            >

                              <td>
                                {name}
                              </td>

                              <td className="right">
                                {quantity}
                              </td>

                              <td className="right">
                                {money(
                                  price
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

              );

            }
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
          2. FOND DE CAISSE INITIAL
      ================================================= */}

      <section className="printSection">

        <h2>
          2. Fond de caisse initial
        </h2>

        <div className="printColumns">

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
                    Qté
                  </th>

                  <th className="right">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {billValues.map(
                  value => {

                    const quantity =
                      Number(
                        opening[value] ||
                        0
                      );

                    return (

                      <tr
                        key={
                          `opening-bill-${value}`
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


          <div>

            <h3>
              Pièces
            </h3>

            <table>

              <thead>

                <tr>

                  <th>
                    Valeur
                  </th>

                  <th className="right">
                    Qté
                  </th>

                  <th className="right">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {coinValues.map(
                  value => {

                    const quantity =
                      Number(
                        opening[value] ||
                        0
                      );

                    return (

                      <tr
                        key={
                          `opening-coin-${value}`
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
          3. COMPTAGE FERMETURE
      ================================================= */}

      <section className="printSection">

        <h2>
          3. Comptage des espèces à la fermeture
        </h2>

        <div className="printColumns">

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
                    Qté
                  </th>

                  <th className="right">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {billValues.map(
                  value => {

                    const quantity =
                      Number(
                        closing[value] ||
                        0
                      );

                    return (

                      <tr
                        key={
                          `closing-bill-${value}`
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


          <div>

            <h3>
              Pièces
            </h3>

            <table>

              <thead>

                <tr>

                  <th>
                    Valeur
                  </th>

                  <th className="right">
                    Qté
                  </th>

                  <th className="right">
                    Total
                  </th>

                </tr>

              </thead>

              <tbody>

                {coinValues.map(
                  value => {

                    const quantity =
                      Number(
                        closing[value] ||
                        0
                      );

                    return (

                      <tr
                        key={
                          `closing-coin-${value}`
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
                Math.abs(
                  cashDifferenceValue
                ) < 0.005
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
          5. MOYENS DE PAIEMENT
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


        {/* =================================================
            ANCV
        ================================================= */}

        {ancvValues.some(
          value =>
            Number(
              ancv[value] || 0
            ) > 0
        ) && (

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
                    Qté
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
                      quantity <= 0
                    ) {
                      return null;
                    }

                    return (

                      <tr
                        key={
                          `ancv-${value}`
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


        {/* =================================================
            PAIEMENTS MULTIPLES
        ================================================= */}

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
                  ) => {

                    const allocations =
                      payment?.allocations ||
                      {};

                    const parts = [];

                    if (
                      Number(
                        allocations.cash
                      ) > 0
                    ) {
                      parts.push(
                        `Espèces ${money(
                          allocations.cash
                        )}`
                      );
                    }

                    if (
                      Number(
                        allocations.tpe
                      ) > 0
                    ) {
                      parts.push(
                        `TPE ${money(
                          allocations.tpe
                        )}`
                      );
                    }

                    if (
                      Number(
                        allocations.web
                      ) > 0
                    ) {
                      parts.push(
                        `CB Web ${money(
                          allocations.web
                        )}`
                      );
                    }

                    if (
                      Number(
                        allocations.cheque
                      ) > 0
                    ) {
                      parts.push(
                        `Chèque ${money(
                          allocations.cheque
                        )}`
                      );
                    }

                    if (
                      Number(
                        allocations.ancv
                      ) > 0
                    ) {
                      parts.push(
                        `ANCV ${money(
                          allocations.ancv
                        )}`
                      );
                    }

                    if (
                      Number(
                        allocations.autre
                      ) > 0
                    ) {
                      parts.push(
                        `Autre ${money(
                          allocations.autre
                        )}`
                      );
                    }

                    return (

                      <tr
                        key={
                          payment?.id ||
                          index
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {parts.length > 0
                            ? parts.join(
                                ' — '
                              )
                            : '—'}
                        </td>

                        <td className="right">

                          <strong>
                            {money(
                              payment?.amount
                            )}
                          </strong>

                        </td>

                      </tr>

                    );

                  }
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
