import { money, volume } from "../utils/format";

export default function RecommendationList({ offers, median }) {
  const bestPrice = offers[0];
  const bestVolume = [...offers].sort((a, b) => Number(b.volume) - Number(a.volume))[0];
  const cards = [
    bestPrice && { title: "Best relevance", offer: bestPrice },
    bestVolume && bestVolume.id !== bestPrice?.id && { title: "Best volume", offer: bestVolume },
  ].filter(Boolean);

  return (
    <section className="rail-block" id="recs">
      <h3>Opportunities</h3>
      {!cards.length && <div className="empty">No ask offers to compare yet. Publish a sell intention, or pick another product.</div>}
      {cards.map(({ title, offer }) => {
        const vs = median ? ((Number(offer.price) - median) / median) * 100 : null;
        return (
          <div className="rec" key={title}>
            <div>
              <div className="stat">{title}</div>
              <b>{offer.product}</b>
              <div className="num">{money(offer.price)} · {volume(offer.volume)} kg</div>
              <div className="stat">{offer.region}</div>
              {vs != null && (
                <div className={vs < 0 ? "ask" : vs > 0 ? "bid" : ""}>
                  {vs === 0
                    ? "At the regional median ask"
                    : `${Math.abs(vs).toFixed(0)}% ${vs < 0 ? "below" : "above"} regional median ask`}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
