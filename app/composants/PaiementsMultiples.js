'use client';

const paymentTypes = [
  ['cash', 'Espèces'],
  ['tpe', 'CB Guichet — TPE'],
  ['web', 'CB Web'],
  ['cheque', 'Chèque'],
  ['ancv', 'ANCV'],
  ['autre', 'Autre']
];

export default function PaiementsMultiples({
  multiplePayments = [],
  multipleDraft,
  multipleAllocated,
  multipleIsValid,
  startMultiple,
  setMultipleDraft,
  updateMultipleAmount,
  updateMultipleAllocation,
  validateMultiple,
  editMultiple,
  removeMultiple,
  money,
  NumberField
}) {

  return (
    <section className="card">

      <h2>
        5. Paiements multiples
      </h2>

      <p className="muted">
        Pour une vente réglée avec plusieurs moyens
        de paiement.
      </p>

      {/* =================================================
          PAIEMENTS EXISTANTS
      ================================================= */}

      {multiplePayments.map(
        (payment, index) => (

          <div
            className="multiple"
            key={
              payment.id || index
            }
          >

            <div className="multipleHeader">

              <strong>
                Paiement multiple #{index + 1}
              </strong>

              <div>

                <strong>
                  {money(
                    payment.amount
                  )}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    editMultiple(
                      payment.id
                    )
                  }
                >
                  ✏️
                </button>

                <button
                  type="button"
                  onClick={() =>
                    removeMultiple(
                      payment.id
                    )
                  }
                >
                  🗑️
                </button>

              </div>

            </div>

            <div className="info">

              {paymentTypes.map(
                ([type, label], index) => {

                  const amount =
                    Number(
                      payment
                        .allocations?.[
                          type
                        ] || 0
                    );

                  if (amount <= 0) {
                    return null;
                  }

                  return (
                    <span key={type}>

                      {index > 0 && (
                        <> — </>
                      )}

                      {label}:{' '}

                      {money(amount)}

                    </span>
                  );

                }
              )}

            </div>

          </div>

        )
      )}

      {/* =================================================
          CRÉATION
      ================================================= */}

      {!multipleDraft ? (

        <button
          type="button"
          onClick={
            startMultiple
          }
        >
          ＋ Nouveau paiement multiple
        </button>

      ) : (

        <div className="multiple">

          <div className="multipleHeader">

            <strong>
              Nouveau paiement multiple
            </strong>

            <button
              type="button"
              onClick={() =>
                setMultipleDraft(null)
              }
            >
              Annuler
            </button>

          </div>

          <label>

            Montant de la transaction

            <NumberField
              step="0.01"
              value={
                multipleDraft.amount
              }
              onChange={
                updateMultipleAmount
              }
            />

          </label>

          <h3>
            Répartition
          </h3>

          <div className="paymentgrid">

            {paymentTypes.map(
              ([type, label]) => (

                <label
                  key={type}
                >

                  {label}

                  <NumberField
                    step="0.01"
                    value={
                      multipleDraft
                        .allocations?.[
                          type
                        ] || 0
                    }
                    onChange={value =>
                      updateMultipleAllocation(
                        type,
                        value
                      )
                    }
                  />

                </label>

              )
            )}

          </div>

          {/* =================================================
              CONTRÔLE DE RÉPARTITION
          ================================================= */}

          <div
            className={
              multipleIsValid
                ? 'info'
                : 'info bad'
            }
          >

            Montant de la transaction :{' '}

            <strong>
              {money(
                multipleDraft.amount
              )}
            </strong>

            <br />

            Montant réparti :{' '}

            <strong>
              {money(
                multipleAllocated
              )}
            </strong>

            <br />

            Reste à répartir :{' '}

            <strong>
              {money(
                Number(
                  multipleDraft.amount || 0
                ) -
                Number(
                  multipleAllocated || 0
                )
              )}
            </strong>

            <br />

            {multipleIsValid
              ? '✓ Répartition correcte'
              : '⚠️ La répartition doit correspondre au montant de la transaction'}

          </div>

          <button
            type="button"
            className="primary"
            disabled={
              !multipleIsValid
            }
            onClick={
              validateMultiple
            }
          >
            ✓ Valider le paiement multiple
          </button>

        </div>

      )}

      {/* =================================================
          TOTAL
      ================================================= */}

      {multiplePayments.length > 0 && (

        <div className="totalline">

          <span>
            Total paiements multiples
          </span>

          <strong>
            {money(
              multiplePayments.reduce(
                (
                  sum,
                  payment
                ) =>
                  sum +
                  Number(
                    payment.amount || 0
                  ),
                0
              )
            )}
          </strong>

        </div>

      )}

    </section>
  );
}
