import { useEffect, useRef, useState } from "react";
import { postJson } from "../api/client";

function friendlyError(err) {
  const raw = String(err?.message || err || "");
  if (!raw || raw.length > 180 || raw.trim().startsWith("<") || raw.trim().startsWith("{")) {
    return "We couldn’t publish this intention. Check the product, region, and price, then try again.";
  }
  return raw;
}

export default function CreateIntentionModal({ products, regions, users, defaults, onClose, onCreated }) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState({
    order_type: "ASK",
    product_id: "",
    region_id: "",
    seller_id: "",
    price: "5000",
    volume: "100",
    expires_at: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const product = products.find((item) => item.name === defaults.product);
    const region = regions.find((item) => item.name === defaults.region);
    setForm((current) => ({
      ...current,
      product_id: product?.id ? String(product.id) : current.product_id,
      region_id: region?.id ? String(region.id) : current.region_id,
      seller_id: users[0] ? String(users[0].id) : "",
    }));
  }, [products, regions, users, defaults]);

  useEffect(() => {
    const previous = document.activeElement;
    dialogRef.current?.querySelector("button, select, input")?.focus();
    function onKey(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, [onClose]);

  function update(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!form.product_id || !form.region_id || !form.seller_id) {
      setError("Choose a product, region, and user before publishing.");
      return;
    }
    if (Number(form.price) < 1) {
      setError("Enter a price of at least 1 UZS.");
      return;
    }
    if (Number(form.volume) < 1) {
      setError("Enter a volume of at least 1 kg.");
      return;
    }
    try {
      await postJson("/api/offers", {
        product_id: Number(form.product_id),
        region_id: Number(form.region_id),
        seller_id: Number(form.seller_id),
        price: form.price,
        volume: form.volume,
        order_type: form.order_type,
        expires_at: form.expires_at || null,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="intention-title"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="intention-title">Publish intention</h2>
        <p className="lead">This posts a buy or sell offer. It does not complete a trade.</p>
        <form onSubmit={submit}>
          <div className="mode" role="group" aria-label="Intention type">
            <button type="button" className={`btn bid ${form.order_type === "BID" ? "active" : ""}`} aria-pressed={form.order_type === "BID"} onClick={() => update("order_type", "BID")}>
              Bid (buy)
            </button>
            <button type="button" className={`btn ask ${form.order_type === "ASK" ? "active" : ""}`} aria-pressed={form.order_type === "ASK"} onClick={() => update("order_type", "ASK")}>
              Ask (sell)
            </button>
          </div>
          <label className="field">
            Product
            <select required value={form.product_id} onChange={(e) => update("product_id", e.target.value)}>
              <option value="">Choose a product</option>
              {products.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="field">
            Region
            <select required value={form.region_id} onChange={(e) => update("region_id", e.target.value)}>
              <option value="">Choose a region</option>
              {regions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="field">
            User
            <select required value={form.seller_id} onChange={(e) => update("seller_id", e.target.value)}>
              <option value="">Choose a user</option>
              {users.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="field">
            Price (UZS per kg)
            <input type="number" min="1" required value={form.price} onChange={(e) => update("price", e.target.value)} />
          </label>
          <label className="field">
            Volume (kg)
            <input type="number" min="1" required value={form.volume} onChange={(e) => update("volume", e.target.value)} />
          </label>
          <label className="field">
            Expires (optional)
            <input type="datetime-local" value={form.expires_at} onChange={(e) => update("expires_at", e.target.value)} />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="modal-actions">
            <button className="btn" type="button" onClick={onClose}>Cancel</button>
            <button className="btn primary" type="submit">Publish intention</button>
          </div>
        </form>
      </div>
    </div>
  );
}
