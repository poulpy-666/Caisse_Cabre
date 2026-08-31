'use client';

export default function MoyensPaiement({
  payments,
  setPayments,
  paymentsValidated,
  setPaymentsValidated,
  ancv,
  setAncv,
  ancvValues,
  ancvDirectTotal,
  money,
  NumberField,
  setCount
}) {

  return (
    <section className="card">

      <h2>
        4. Moyens de paiement
      </h2>

      {!paymentsValidated ? (

        <>
          <div className="paymentgrid">

            <label>
              CB Guichet — TPE

              <NumberField
                step="0.01"
                value={payments.tpe}
                onChange={value =>
                  setCount(
                    setPayments,
                    'tpe',
                    value
                  )
                }
              />
            </label>

            <label>
              CB Web

              <NumberField
                step="0.01"
                value={payments.web}
                onChange={value =>
                  setCount(
                    setPayments,
                    'web',
                    value
                  )
                }
              />
            </label>

            <label>
              Chèques

              <NumberField
                step="0.01"
                value={payments.cheque}
                onChange={value =>
                  setCount(
                    setPayments,
                    'cheque',
                    value
                  )
                }
              />
            </label>

            <label>
              Autre

              <NumberField
                step="0.01"
                value={payments.autre}
                onChange={value =>
                  setCount(
                    setPayments,
                    'autre',
                    value
                  )
                }
              />
            </label>

          </div>

          <button
            type="button"
            className="primary"
            onClick={() =>
              setPaymentsValidated(true)
            }
          >
            ✓ Valider les moyens de paiement
          </button>

        </>

      ) : (

        <>
          <div className="info">

            <strong>
              Moyens de paiement validés ✓
            </strong>

          </div>

          <div className="paymentSummary">

            <div>
              <span>
                CB TPE
              </span>

              <strong>
                {money(payments.tpe)}
              </strong>
            </div>

            <div>
              <span>
                CB Web
              </span>

              <strong>
                {money(payments.web)}
              </strong>
            </div>

            <div>
              <span>
                Chèques
              </span>

              <strong>
                {money(payments.cheque)}
              </strong>
            </div>

            <div>
              <span>
                Autre
              </span>

              <strong>
                {money(payments.autre)}
              </strong>
            </div>

          </div>

          <button
            type="button"
            onClick={() =>
              setPaymentsValidated(false)
            }
          >
            ✏️ Modifier
          </button>

        </>

      )}

      <h3>
        Chèques-Vacances ANCV
      </h3>

      <div className="cashgrid">

        {ancvValues.map(
          value => (

            <div
              className="cashrow"
              key={
                'ancv-' +
                value
              }
            >

              <span>
                {money(value)}
              </span>

              <NumberField
                value={ancv[value]}
                onChange={x =>
                  setCount(
                    setAncv,
                    value,
                    x
                  )
                }
              />

              <strong>
                {money(
                  value *
                  ancv[value]
                )}
              </strong>

            </div>

          )
        )}

      </div>

      <div className="totalline">

        <span>
          Total ANCV
        </span>

        <strong>
          {money(ancvDirectTotal)}
        </strong>

      </div>

    </section>
  );
}
