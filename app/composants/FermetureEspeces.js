'use client';

export default function FermetureEspeces({
  closing,
  setClosing,
  billValues,
  coinValues,
  cashBills,
  cashCoins,
  closingCash,
  cashSales,
  openingCash,
  money,
  NumberField,
  setCount
}) {

  return (
    <section className="card">

      <h2>
        3. Fermeture — espèces
      </h2>

      <p className="muted">
        Comptez les espèces présentes dans la caisse
        à la fermeture.
      </p>

      <div className="cashColumns">

        {/* =================================================
            BILLETS
        ================================================= */}

        <div className="cashPanel">

          <h3>
            💶 Billets
          </h3>

          {billValues.map(
            value => (

              <div
                className="cashrow"
                key={
                  'closing-bill-' +
                  value
                }
              >

                <span>
                  {money(value)}
                </span>

                <NumberField
                  value={
                    closing[value]
                  }
                  onChange={x =>
                    setCount(
                      setClosing,
                      value,
                      x
                    )
                  }
                />

                <strong>
                  {money(
                    value *
                    closing[value]
                  )}
                </strong>

              </div>

            )
          )}

          <div className="totalline">

            <span>
              Total billets
            </span>

            <strong>
              {money(cashBills)}
            </strong>

          </div>

        </div>

        {/* =================================================
            MONNAIE
        ================================================= */}

        <div className="cashPanel">

          <h3>
            🪙 Monnaie
          </h3>

          {coinValues.map(
            value => (

              <div
                className="cashrow"
                key={
                  'closing-coin-' +
                  value
                }
              >

                <span>
                  {money(value)}
                </span>

                <NumberField
                  value={
                    closing[value]
                  }
                  onChange={x =>
                    setCount(
                      setClosing,
                      value,
                      x
                    )
                  }
                />

                <strong>
                  {money(
                    value *
                    closing[value]
                  )}
                </strong>

              </div>

            )
          )}

          <div className="totalline">

            <span>
              Total monnaie
            </span>

            <strong>
              {money(cashCoins)}
            </strong>

          </div>

        </div>

      </div>

      {/* =================================================
          TOTAL ESPÈCES
      ================================================= */}

      <div className="caBox">

        <span>
          SOMME TOTALE ESPÈCES
        </span>

        <strong>
          {money(closingCash)}
        </strong>

      </div>

      {/* =================================================
          CONTRÔLE ESPÈCES
      ================================================= */}

      <div className="info">

        <div>
          Fond de caisse initial :{' '}

          <strong>
            {money(openingCash)}
          </strong>
        </div>

        <div>
          Espèces issues des ventes :{' '}

          <strong>
            {money(cashSales)}
          </strong>
        </div>

        <div>
          Espèces attendues :{' '}

          <strong>
            {money(
              openingCash +
              cashSales
            )}
          </strong>
        </div>

      </div>

    </section>
  );
}
