'use client';

export default function Billetterie({
  events,
  eventsLoading,
  eventsError,
  selectedEventId,
  setSelectedEventId,
  addEvent,
  eventTotals,
  removeEvent,
  updateTicketQuantity,
  ca,
  money,
  NumberField
}) {

  return (
    <section className="card">

      <h2>
        2. Billetterie
      </h2>

      <p className="muted">
        Ajoutez les événements concernés par la
        manifestation puis saisissez les ventes.
      </p>

      {eventsError && (
        <div className="info bad">
          {eventsError}
        </div>
      )}

      {eventsLoading ? (

        <div className="info">
          ⏳ Chargement des événements et tarifs...
        </div>

      ) : events.length === 0 ? (

        <div className="info">
          Aucun événement avec tarif actif n'est disponible.
          <br />
          Créez un événement et ses tarifs dans la page Tarifs.
        </div>

      ) : (

        <div className="grid2">

          <label>

            Événement

            <select
              value={selectedEventId}
              onChange={e =>
                setSelectedEventId(
                  e.target.value
                )
              }
            >

              {events.map(
                event => (

                  <option
                    key={event.id}
                    value={event.id}
                  >
                    {event.name}
                  </option>

                )
              )}

            </select>

          </label>

          <div>

            <button
              type="button"
              className="primary"
              onClick={addEvent}
            >
              ＋ Ajouter l'événement
            </button>

          </div>

        </div>

      )}

      {eventTotals.length === 0 ? (

        <div className="info">
          Aucun événement ajouté.
        </div>

      ) : (

        eventTotals.map(
          event => (

            <div
              className="multiple"
              key={event.id}
            >

              <div className="multipleHeader">

                <strong>
                  {event.eventName}
                </strong>

                <button
                  type="button"
                  onClick={() =>
                    removeEvent(
                      event.id
                    )
                  }
                >
                  🗑️ Supprimer
                </button>

              </div>

              <div className="ticketgrid">

                {event.tickets.map(
                  ticket => (

                    <div
                      className="ticket"
                      key={ticket.id}
                    >

                      <div>

                        <strong>
                          {ticket.name}
                        </strong>

                        <span>
                          {money(
                            ticket.price
                          )}
                        </span>

                      </div>

                      <NumberField
                        value={
                          event
                            .quantities[
                              ticket.name
                            ] || 0
                        }
                        onChange={value =>
                          updateTicketQuantity(
                            event.id,
                            ticket.name,
                            value
                          )
                        }
                      />

                      <b>
                        {money(
                          ticket.price *
                          (
                            event
                              .quantities[
                                ticket.name
                              ] || 0
                          )
                        )}
                      </b>

                    </div>

                  )
                )}

              </div>

              <div className="caBox">

                <span>
                  CA {event.eventName}
                </span>

                <strong>
                  {money(
                    event.total
                  )}
                </strong>

              </div>

            </div>

          )
        )

      )}

      <div className="caBox">

        <span>
          CA BILLETTERIE TOTAL
        </span>

        <strong>
          {money(ca)}
        </strong>

      </div>

    </section>
  );
}
