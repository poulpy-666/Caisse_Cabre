'use client';

export default function OuvertureCaisse({
  eventName,
  setEventName,
  responsible,
  setResponsible,
  date,
  setDate,
  opening,
  setOpening,
  billValues,
  coinValues,
  openingBills,
  openingCoins,
  openingCash,
  money,
  NumberField,
  setCount
}) {

  return (
    <section className="card">

      <h2>
        1. Ouverture de caisse
      </h2>

      <div className="grid2">

        <label>

          Manifestation

          <input
            value={eventName}
            onChange={e =>
              setEventName(
                e.target.value
              )
            }
            placeholder="Nom de la manifestation"
          />

        </label>

        <label>

          Responsable de caisse

          <input
            value={responsible}
            onChange={e =>
              setResponsible(
                e.target.value
              )
            }
            placeholder="Nom du responsable"
          />

        </label>

      </div>

      <label>

        Date

        <input
          type="date"
          value={date}
          onChange={e =>
            setDate(
              e.target.value
            )
          }
        />

      </label>

      <h3>
        Fond de caisse
      </h3>

      <div className="cashColumns">

        {/* BILLETS */}

        <div className="cashPanel">

          <h3>
            💶 Billets
          </h3>

          {billValues.map(
            value => (

              <div
                className="cashrow"
                key={
                  'opening-bill-' +
                  value
                }
              >

                <span>
                  {money(value)}
                </span>

                <NumberField
                  value={
                    opening[value]
                  }
                  onChange={x =>
                    setCount(
                      setOpening,
                      value,
                      x
                    )
                  }
                />

                <strong>
                  {money(
                    value *
                    opening[value]
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
              {money(openingBills)}
            </strong>

          </div>

        </div>

        {/* MONNAIE */}

        <div className="cashPanel">

          <h3>
            🪙 Monnaie
          </h3>

          {coinValues.map(
            value => (

              <div
                className="cashrow"
                key={
                  'opening-coin-' +
                  value
                }
              >

                <span>
                  {money(value)}
                </span>

                <NumberField
                  value={
                    opening[value]
                  }
                  onChange={x =>
                    setCount(
                      setOpening,
                      value,
                      x
                    )
                  }
                />

                <strong>
                  {money(
                    value *
                    opening[value]
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
              {money(openingCoins)}
            </strong>

          </div>

        </div>

      </div>

      <div className="caBox">

        <span>
          FOND DE CAISSE INITIAL
        </span>

        <strong>
          {money(openingCash)}
        </strong>

      </div>

    </section>
  );
}
