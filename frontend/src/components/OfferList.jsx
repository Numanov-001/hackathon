export default function OfferList({ offers }) {
  return (
    <div className="card">
      <h2>P2P intentions</h2>
      <p className="disclaimer">Список намерений купить/продать. Это не order book и не сделка.</p>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Product</th>
            <th>Region</th>
            <th>Price</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.id}>
              <td className={offer.order_type === "ASK" ? "ask" : "bid"}>{offer.order_type}</td>
              <td>{offer.product}</td>
              <td>{offer.region}</td>
              <td>{offer.price}</td>
              <td>{offer.volume}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
