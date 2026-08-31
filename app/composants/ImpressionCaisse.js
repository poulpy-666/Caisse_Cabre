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
    Math.abs(differenceValue) < 0.005;

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
          Math.abs(differenceValue)
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
  <div
    className="printOnly"
    style={{
      display: 'none'
    }}
  >
    <div className="printSheet">

      <h1>TEST IMPRESSION</h1>

      <p>
        Manifestation : {eventName || '—'}
      </p>

      <p>
        Date : {date || '—'}
      </p>

      <p>
        Responsable : {responsible || '—'}
      </p>

      <hr />

      <h2>
        CA : {money(ca)}
      </h2>

      <h2>
        Total encaissé : {money(paymentsTotal)}
      </h2>

      <h2>
        Écart : {money(difference)}
      </h2>

    </div>
  </div>
);
