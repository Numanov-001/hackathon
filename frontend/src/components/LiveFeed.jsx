import { money } from "../utils/format";

export default function LiveFeed({ events }) {
  return (
    <section className="rail-block">
      <h3>Live activity</h3>
      <ul className="feed">
        {events.map((event, index) => {
          const time = new Date().toTimeString().slice(0, 8);
          return (
            <li key={`${event.data.id}-${index}`}>
              <span className="num">{time}</span>
              <span>
                <b className={event.data.order_type === "ASK" ? "ask" : "bid"}>New {event.data.order_type === "ASK" ? "ask" : "bid"}</b>
                <br />
                {event.data.product} · {money(event.data.price)} · {event.data.region}
              </span>
            </li>
          );
        })}
        {!events.length && <li className="empty">No new intentions yet. Published offers will appear here.</li>}
      </ul>
    </section>
  );
}
