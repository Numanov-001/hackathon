import { useMemo, useState } from "react";
import { exactTime, money, timeAgo, volume } from "../utils/format";

const PAGE = 8;

export default function P2PTable({ offers }) {
  const [sort, setSort] = useState({ key: "created_at", dir: -1 });
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    const copy = [...offers];
    copy.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av === bv) return 0;
      return av > bv ? sort.dir : -sort.dir;
    });
    return copy;
  }, [offers, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const slice = sorted.slice(page * PAGE, page * PAGE + PAGE);

  function toggle(key) {
    setSort((current) => ({ key, dir: current.key === key ? -current.dir : 1 }));
    setPage(0);
  }

  if (!offers.length) return <div className="empty">No intentions match these filters. Reset the filters, or publish a new intention.</div>;

  return (
    <>
      <div className="table-wrap">
        <table className="market">
          <thead>
            <tr>
              <th onClick={() => toggle("order_type")}>Type</th>
              <th className="right" onClick={() => toggle("price")}>Price</th>
              <th className="right" onClick={() => toggle("volume")}>Volume</th>
              <th onClick={() => toggle("region")}>Region</th>
              <th onClick={() => toggle("seller_name")}>User</th>
              <th onClick={() => toggle("created_at")}>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {slice.map((offer) => (
              <tr key={offer.id}>
                <td className={offer.order_type === "ASK" ? "ask" : "bid"}>{offer.order_type === "ASK" ? "Ask" : "Bid"}</td>
                <td className="right num">{money(offer.price)}</td>
                <td className="right num">{volume(offer.volume)} kg</td>
                <td>{offer.region}</td>
                <td>{offer.seller_name || `User ${offer.seller_id}`}</td>
                <td title={exactTime(offer.created_at)}>{timeAgo(offer.created_at)}</td>
                <td>
                  <button className="linkish" type="button" title={`Intention ${offer.id}`}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pager">
        <button className="btn" type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</button>
        <span>Page {page + 1} of {pages}</span>
        <button className="btn" type="button" disabled={page + 1 >= pages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </>
  );
}
